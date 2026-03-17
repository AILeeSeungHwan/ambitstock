#!/usr/bin/env python3
"""
crawl_movie_images.py — ambitstock.com 영화 이미지 크롤러 (네이버 기반)

네이버 검색에서 영화 포스터 및 스틸컷을 크롤링하여 다운로드합니다.

사용법:
  # 단건
  python3 scripts/crawl_movie_images.py --post-id 485 --query "프로젝트 헤일메리" --max-images 3

  # 배치 (JSON 파일)
  python3 scripts/crawl_movie_images.py --batch scripts/image_batch.json

배치 JSON 포맷:
  [
    {"post_id": 485, "movies": [{"query": "프로젝트 헤일메리", "max_images": 3}]},
    {"post_id": 493, "movies": [
      {"query": "프로젝트 헤일메리", "max_images": 1},
      {"query": "호퍼스 픽사", "max_images": 1}
    ]}
  ]

검색어 팁:
  - 한국어로 검색 (네이버 기반이므로 한국어가 정확도 높음)
  - "영화이름 영화" 형태가 가장 정확
  - 드라마는 "드라마이름 드라마"
"""

import requests
from bs4 import BeautifulSoup
import os
import re
import json
import time
import argparse
from urllib.parse import quote, unquote

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_DIR = os.path.join(BASE_DIR, 'public', 'images')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.naver.com/',
}


def get_original_url(naver_img_url):
    """네이버 프록시 URL에서 원본 URL 추출 후 고해상도로 변환"""
    match = re.search(r'src=(https?%3A[^&]+)', naver_img_url)
    if match:
        orig = unquote(match.group(1))
        # ?type=w640_2 등 제거하면 원본 고해상도로 받아짐
        orig = re.sub(r'\?type=\w+', '', orig)
        return orig
    return naver_img_url


def search_naver(query):
    """
    네이버 통합검색에서 영화 포스터 + 스틸컷 이미지를 수집합니다.

    Returns:
        dict with 'posters' and 'stills' lists, each containing
        {'url': str, 'alt': str, 'original': str}
    """
    search_url = f"https://search.naver.com/search.naver?where=nexearch&query={quote(query)}"
    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [ERROR] 네이버 검색 실패: {e}")
        return {'posters': [], 'stills': []}

    soup = BeautifulSoup(resp.text, 'html.parser')

    posters = []
    stills = []
    seen_originals = set()

    for img in soup.find_all('img'):
        src = img.get('src', '') or img.get('data-src', '')
        if not src or 'pstatic' not in src:
            continue
        if 'movie' not in src and 'imgmovi' not in src and 'movie.phinf' not in src:
            continue

        alt = img.get('alt', '').strip()
        original = get_original_url(src)

        # 중복 제거
        if original in seen_originals:
            continue
        seen_originals.add(original)

        # 인물 사진 제외 (감독, 배우 프로필 — mdi/pi/ 패턴)
        if '/mdi/pi/' in original:
            continue

        # 원본 URL을 다운로드용으로 사용
        download_url = original

        # 크기로 포스터/스틸 구분
        size_match = re.search(r'size=(\d+)x(\d+)', src)
        if size_match:
            w, h = int(size_match.group(1)), int(size_match.group(2))
            if h > w:
                posters.append({'url': download_url, 'alt': alt})
            else:
                stills.append({'url': download_url, 'alt': alt})
        elif 'movie.phinf' in original or 'imgmovi' in original:
            if 'TRAILER' in original or 'multimedia' in original:
                stills.append({'url': download_url, 'alt': alt})
            else:
                posters.append({'url': download_url, 'alt': alt})

    return {'posters': posters, 'stills': stills}


def search_naver_image(query, max_count=5):
    """네이버 이미지 검색에서 추가 이미지 수집 (JS 렌더링 대응)"""
    search_url = f"https://search.naver.com/search.naver?where=image&query={quote(query)}"
    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [ERROR] 네이버 이미지 검색 실패: {e}")
        return []

    images = []
    seen = set()

    # 네이버 이미지 검색은 JS 렌더링 — script 태그 내 JSON에서 이미지 URL 추출
    img_urls = re.findall(
        r'https?://search\.pstatic\.net/common/\?src=http[^\"\s<>\']+\.(?:jpg|jpeg|png|webp)',
        resp.text
    )

    for url in img_urls:
        if url in seen:
            continue
        seen.add(url)
        orig = get_original_url(url)
        if orig not in seen:
            seen.add(orig)
            images.append({'url': orig, 'alt': query})
            if len(images) >= max_count:
                break

    return images


def download_image(url, filepath):
    """이미지 다운로드"""
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
            print(f"  FAIL (status={resp.status_code}, size={len(resp.content)}B)")
    except Exception as e:
        print(f"  FAIL: {e}")
    return False


def crawl_movie(post_id, query, max_images=3, img_prefix=''):
    """
    네이버에서 영화 이미지를 크롤링하여 저장합니다.

    Args:
        post_id: 포스트 ID
        query: 검색어 (한국어 권장, "영화이름 영화" 형태)
        max_images: 최대 다운로드 수 (1=포스터만, 2+=포스터+스틸)
        img_prefix: 파일명 접두사 (멀티무비 포스트용, e.g., 'a_')

    Returns:
        저장된 이미지 경로 리스트 (public/ 기준 상대경로)
    """
    print(f"\n[Post {post_id}] 검색: {query}")

    # 네이버 통합검색
    result = search_naver(query)
    posters = result['posters']
    stills = result['stills']
    print(f"  발견: 포스터 {len(posters)}장, 스틸컷 {len(stills)}장")

    # 통합검색에서 못 찾으면 이미지 검색 시도
    if not posters and not stills:
        print(f"  이미지 검색으로 재시도: {query} 포스터")
        fallback = search_naver_image(f"{query} 포스터", max_count=max_images)
        if fallback:
            posters = fallback[:1]
            stills = fallback[1:]
        if not posters and not stills:
            print(f"  이미지를 찾을 수 없습니다")
            return []

    saved = []
    prefix = f'post{post_id}_{img_prefix}' if img_prefix else f'post{post_id}_'

    # 1. 포스터 다운로드 (첫 번째)
    if posters:
        poster = posters[0]
        local_path = os.path.join(IMAGE_DIR, f'{prefix}poster.jpg')
        if download_image(poster['url'], local_path):
            saved.append(f'/images/{prefix}poster.jpg')

    # 2. 스틸컷 다운로드
    if max_images > 1 and stills:
        for i, still in enumerate(stills[:max_images - 1], 1):
            local_path = os.path.join(IMAGE_DIR, f'{prefix}still{i}.jpg')
            if download_image(still['url'], local_path):
                saved.append(f'/images/{prefix}still{i}.jpg')
            time.sleep(0.2)

    # 스틸컷이 없으면 포스터 추가분으로 대체
    if max_images > 1 and not stills and len(posters) > 1:
        for i, poster in enumerate(posters[1:max_images], 1):
            local_path = os.path.join(IMAGE_DIR, f'{prefix}still{i}.jpg')
            if download_image(poster['url'], local_path):
                saved.append(f'/images/{prefix}still{i}.jpg')
            time.sleep(0.2)

    print(f"  저장: {len(saved)}장")
    return saved


def crawl_batch(batch_file):
    """
    배치 파일 처리.
    포맷: [{"post_id": 485, "movies": [{"query": "...", "max_images": 3}]}]
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
            prefix = f'{chr(97+idx)}_' if len(movies) > 1 else ''

            images = crawl_movie(post_id, query, max_imgs, prefix)
            post_images.extend(images)
            time.sleep(0.5)

        all_results[str(post_id)] = post_images

    # 결과 저장
    results_file = os.path.join(os.path.dirname(batch_file), 'crawl_results.json')
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in all_results.values())
    print(f"\n{'='*50}")
    print(f"완료: {len(all_results)}개 포스트, {total}장 이미지")
    print(f"결과: {results_file}")
    return all_results


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ambitstock.com 영화 이미지 크롤러 (네이버 기반)')
    parser.add_argument('--post-id', type=int, help='포스트 ID')
    parser.add_argument('--query', type=str, help='검색어 (한국어 권장)')
    parser.add_argument('--max-images', type=int, default=3, help='최대 이미지 수 (기본: 3)')
    parser.add_argument('--batch', type=str, help='배치 JSON 파일 경로')

    args = parser.parse_args()

    if args.batch:
        crawl_batch(args.batch)
    elif args.post_id and args.query:
        crawl_movie(args.post_id, args.query, args.max_images)
    else:
        parser.print_help()
