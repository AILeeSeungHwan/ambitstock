#!/usr/bin/env python3
"""
crawl_movie_images.py — ambitstock.com 영화 이미지 크롤러

TMDB에서 영화 포스터 및 스틸컷을 크롤링하여 다운로드합니다.

사용법:
  # 단건
  python3 scripts/crawl_movie_images.py --post-id 485 --query "Project Hail Mary" --max-images 3

  # 배치 (JSON 파일)
  python3 scripts/crawl_movie_images.py --batch scripts/image_batch.json

배치 JSON 포맷:
  [
    {"post_id": 485, "movies": [{"query": "Project Hail Mary", "max_images": 3}]},
    {"post_id": 493, "movies": [
      {"query": "Project Hail Mary", "max_images": 1},
      {"query": "Hoppers 2026 Pixar", "max_images": 1}
    ]}
  ]
"""

import requests
from bs4 import BeautifulSoup
import os
import re
import json
import time
import sys
import argparse
from urllib.parse import quote

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_DIR = os.path.join(BASE_DIR, 'public', 'images')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
}


def extract_image_path(url_or_src):
    """Extract image filename from any TMDB image URL"""
    match = re.search(r'/([a-zA-Z0-9]+\.jpg)', url_or_src)
    return match.group(1) if match else None


def search_tmdb(query):
    """Search TMDB website for a movie"""
    url = f"https://www.themoviedb.org/search/movie?query={quote(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [ERROR] Search failed: {e}")
        return None

    soup = BeautifulSoup(resp.text, 'html.parser')

    # Find movie links
    link = soup.find('a', href=re.compile(r'^/movie/\d+'))
    if not link:
        return None

    href = link.get('href', '')
    movie_id_match = re.search(r'/movie/(\d+)', href)
    if not movie_id_match:
        return None

    movie_id = movie_id_match.group(1)

    # Get poster path from search result img
    poster_path = None
    img = link.find('img') or (link.parent and link.parent.find('img'))
    if img:
        src = img.get('src', '') or img.get('data-src', '') or img.get('loading', '')
        poster_path = extract_image_path(src)

    # Get title
    title_el = link.find('h2') or link
    title = title_el.get_text(strip=True) if title_el else query

    return {
        'movie_id': movie_id,
        'poster_path': poster_path,
        'title': title
    }


def get_poster_from_page(movie_id):
    """Get poster image path from movie page og:image"""
    url = f"https://www.themoviedb.org/movie/{movie_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
    except Exception as e:
        print(f"  [ERROR] Movie page fetch failed: {e}")
        return None

    og = soup.find('meta', property='og:image')
    if og:
        return extract_image_path(og.get('content', ''))

    # Fallback
    poster_img = soup.select_one('img[src*="tmdb"]')
    if poster_img:
        return extract_image_path(poster_img.get('src', ''))

    return None


def get_backdrops(movie_id, max_count=2):
    """Get backdrop image paths from movie images page"""
    url = f"https://www.themoviedb.org/movie/{movie_id}/images/backdrops"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
    except Exception as e:
        print(f"  [ERROR] Backdrops page fetch failed: {e}")
        return []

    paths = []
    seen = set()

    # Method 1: Find image links
    for el in soup.find_all(['a', 'img']):
        src = el.get('href', '') or el.get('src', '') or el.get('data-src', '')
        if 'tmdb' in src or 'image.tmdb.org' in src:
            path = extract_image_path(src)
            if path and path not in seen:
                seen.add(path)
                paths.append(path)
                if len(paths) >= max_count:
                    return paths

    return paths


def download_image(url, filepath):
    """Download image from URL to filepath"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        if resp.status_code == 200 and len(resp.content) > 2000:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            size_kb = len(resp.content) // 1024
            print(f"  OK ({size_kb}KB): {os.path.basename(filepath)}")
            return True
        else:
            print(f"  FAIL (status={resp.status_code}, size={len(resp.content)}B): {url}")
    except Exception as e:
        print(f"  FAIL: {e}")
    return False


def crawl_movie(post_id, query, max_images=3, img_prefix=''):
    """
    Crawl and download images for a movie.

    Args:
        post_id: Post ID number
        query: Movie search query (English preferred)
        max_images: Max images to download (1=poster only, 2+=poster+stills)
        img_prefix: Prefix for image naming (e.g., 'a_' for multi-movie posts)

    Returns:
        List of saved image paths (relative to public/)
    """
    print(f"\n[Post {post_id}] Searching: {query}")

    result = search_tmdb(query)
    if not result:
        print(f"  No results found for: {query}")
        return []

    movie_id = result['movie_id']
    print(f"  Found: {result['title']} (TMDB #{movie_id})")

    saved = []
    prefix = f'post{post_id}_{img_prefix}' if img_prefix else f'post{post_id}_'

    # 1. Download poster
    poster_path = result.get('poster_path')
    if not poster_path:
        time.sleep(0.3)
        poster_path = get_poster_from_page(movie_id)

    if poster_path:
        poster_url = f"https://image.tmdb.org/t/p/w780/{poster_path}"
        local_path = os.path.join(IMAGE_DIR, f'{prefix}poster.jpg')
        if download_image(poster_url, local_path):
            saved.append(f'/images/{prefix}poster.jpg')
    else:
        print(f"  No poster found")

    # 2. Download backdrops/stills
    if max_images > 1:
        time.sleep(0.3)
        bd_paths = get_backdrops(movie_id, max_count=max_images - 1)
        for i, bd_path in enumerate(bd_paths, 1):
            bd_url = f"https://image.tmdb.org/t/p/w1280/{bd_path}"
            local_path = os.path.join(IMAGE_DIR, f'{prefix}still{i}.jpg')
            if download_image(bd_url, local_path):
                saved.append(f'/images/{prefix}still{i}.jpg')
            time.sleep(0.2)

    print(f"  Total: {len(saved)} images")
    return saved


def crawl_batch(batch_file):
    """
    Process batch file.
    Format: [{"post_id": 485, "movies": [{"query": "...", "max_images": 3}]}]
    """
    with open(batch_file, 'r', encoding='utf-8') as f:
        batch = json.load(f)

    all_results = {}

    for item in batch:
        post_id = item['post_id']
        movies = item.get('movies', [])
        post_images = []

        for idx, movie in enumerate(movies):
            query = movie['query']
            max_imgs = movie.get('max_images', 2)
            # For multi-movie posts, use alphabetic prefix
            prefix = f'{chr(97+idx)}_' if len(movies) > 1 else ''

            images = crawl_movie(post_id, query, max_imgs, prefix)
            post_images.extend(images)
            time.sleep(0.5)

        all_results[str(post_id)] = post_images

    # Save results
    results_file = os.path.join(os.path.dirname(batch_file), 'crawl_results.json')
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in all_results.values())
    print(f"\n{'='*50}")
    print(f"DONE: {total} images for {len(all_results)} posts")
    print(f"Results: {results_file}")
    return all_results


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Movie image crawler for ambitstock.com')
    parser.add_argument('--post-id', type=int, help='Post ID')
    parser.add_argument('--query', type=str, help='Movie search query')
    parser.add_argument('--max-images', type=int, default=3, help='Max images (default: 3)')
    parser.add_argument('--batch', type=str, help='Batch JSON file path')

    args = parser.parse_args()

    if args.batch:
        crawl_batch(args.batch)
    elif args.post_id and args.query:
        crawl_movie(args.post_id, args.query, args.max_images)
    else:
        parser.print_help()
