#!/usr/bin/env python3
"""
car.ambitstock.com 티스토리 → Next.js 변환 스크립트 v2
- 정확한 h2→body 구조 보장
- 이미지명 영문 변환 (포스팅 관련 키워드)
- SEO 최적화 sections 배열 생성

사용법:
  pip3 install requests beautifulsoup4
  python3 convert_v2.py

출력:
  posts/*.js, data/posts.js, public/images/*, public/sitemap.xml
"""

import os, re, sys, time, json, hashlib
import requests
from bs4 import BeautifulSoup, NavigableString
from urllib.parse import urlparse

# ─── 설정 ───
BASE_URL = 'https://car.ambitstock.com'
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(PROJECT_DIR, 'posts')
IMAGES_DIR = os.path.join(PROJECT_DIR, 'public', 'images')
DATA_DIR = os.path.join(PROJECT_DIR, 'data')

ADSENSE_TOP = '9463227631'
ADSENSE_MID = '6297515693'

GRADIENTS = [
    'linear-gradient(to right, #3f51b1, #f18271)',
    'linear-gradient(to right, #5a55ae, #f3a469)',
    'linear-gradient(to right, #7b5fac, #cc6b8e)',
    'linear-gradient(to right, #f18271, #3f51b1)',
    'linear-gradient(to right, #3f51b1, #5a55ae)',
    'linear-gradient(to right, #cc6b8e, #3f51b1)',
]

os.makedirs(POSTS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
})


# ─── 유틸리티 ───

def js_escape(s):
    """JS 싱글쿼트 문자열용 이스케이프"""
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '')
    # octal escape 방지: \0~\7 제거
    s = re.sub(r'\\[0-7]{1,3}', '', s)
    return s


def slugify(text, max_len=40):
    """한글 텍스트 → 영문 slug (이미지 파일명용)"""
    # 한글 키워드 → 영문 매핑
    kr_to_en = {
        '자동차보험': 'car-insurance', '보험료': 'premium', '보험': 'insurance',
        '비교': 'compare', '견적': 'quote', '다이렉트': 'direct',
        '삼성화재': 'samsung-fire', '현대해상': 'hyundai-marine', '메리츠': 'meritz',
        'DB손해': 'db-insurance', 'KB손해': 'kb-insurance',
        '테슬라': 'tesla', '벤츠': 'benz', 'BMW': 'bmw', '아우디': 'audi',
        '볼보': 'volvo', '렉서스': 'lexus', '현대': 'hyundai', '기아': 'kia',
        '전기차': 'ev', '하이브리드': 'hybrid', '중고차': 'used-car',
        '블랙박스': 'dashcam', '하이패스': 'hipass', '경고등': 'warning-light',
        '엔진': 'engine', '타이어': 'tire', '계기판': 'dashboard',
        '장기렌트': 'long-term-rent', '리스': 'lease', '할부': 'installment',
        '보조금': 'subsidy', '충전': 'charging', '배터리': 'battery',
        '노트북': 'laptop', '게이밍': 'gaming', '추천': 'recommend',
        '순위': 'ranking', '가격': 'price', '유지비': 'maintenance',
        '절감': 'saving', '꿀팁': 'tips', '가이드': 'guide',
        '신차': 'new-car', '판매': 'sales', '외제차': 'imported-car',
        '세금': 'tax', '자동차세': 'car-tax', '취등록세': 'registration-tax',
    }
    result = text.lower().strip()
    for kr, en in sorted(kr_to_en.items(), key=lambda x: -len(x[0])):
        result = result.replace(kr, en)
    # 남은 한글/특수문자 제거
    result = re.sub(r'[^a-z0-9\-]', '-', result)
    result = re.sub(r'-+', '-', result).strip('-')
    return result[:max_len] if result else 'image'


def download_image(img_url, post_id, title_slug, img_idx):
    """이미지 다운로드 → 영문 파일명으로 저장"""
    if not img_url or img_url.startswith('data:'):
        return None
    try:
        filename = f'{title_slug}-{img_idx}.png'
        filepath = os.path.join(IMAGES_DIR, filename)
        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            return f'/images/{filename}'
        resp = session.get(img_url, timeout=15)
        if resp.status_code == 200 and len(resp.content) > 500:
            with open(filepath, 'wb') as f:
                f.write(resp.content)
            print(f'    📷 {filename} ({len(resp.content)//1024}KB)')
            return f'/images/{filename}'
    except Exception as e:
        print(f'    ❌ 이미지 실패: {str(e)[:50]}')
    return None


# ─── URL 수집 ───

def get_all_post_urls():
    """전체 게시글 URL 수집"""
    urls = []
    page = 1
    while True:
        print(f'📋 페이지 {page} 스캔...')
        url = f'{BASE_URL}/?page={page}' if page > 1 else BASE_URL
        resp = session.get(url, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        found = []
        for a in soup.find_all('a', href=True):
            m = re.match(r'^(?:https?://car\.ambitstock\.com)?/(\d+)$', a['href'])
            if m:
                full = f'{BASE_URL}/{m.group(1)}'
                if full not in found and full not in urls:
                    found.append(full)
        
        if not found:
            break
        urls.extend(found)
        page += 1
        time.sleep(0.3)
    
    # 중복 제거 + 정렬
    urls = list(dict.fromkeys(urls))
    print(f'✅ 총 {len(urls)}개 게시글 발견\n')
    return urls


# ─── 핵심: 포스팅 파싱 ───

def parse_post(url):
    """티스토리 포스팅 → meta + sections"""
    post_id = int(url.rstrip('/').split('/')[-1])
    print(f'🔍 #{post_id} 파싱: {url}')
    
    resp = session.get(url, timeout=15)
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    # ── 메타 추출 ──
    og_title = soup.find('meta', property='og:title')
    title = og_title['content'] if og_title else (soup.title.text.strip() if soup.title else f'포스트 {post_id}')
    title = re.sub(r'\s*[\|·]\s*모빌리티\s*인사이트.*$', '', title).strip()
    
    og_desc = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'description'})
    description = og_desc['content'][:150] if og_desc else title
    
    # 날짜
    date_meta = soup.find('meta', property='article:published_time')
    if date_meta:
        date_str = date_meta['content'][:10]
    else:
        date_el = soup.find('time') or soup.find(class_=re.compile(r'date'))
        dm = re.search(r'(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})', date_el.text if date_el else '')
        date_str = f'{dm.group(1)}-{dm.group(2).zfill(2)}-{dm.group(3).zfill(2)}' if dm else '2025-01-01'
    
    # 카테고리
    cat_el = soup.find(class_=re.compile(r'category'))
    category = '자동차'
    if cat_el:
        ct = cat_el.get_text(strip=True)
        if 'IT' in ct: category = 'IT 제품'
    
    # 태그
    tags = []
    for t in soup.select('.tag_label a, .tags a, a[rel="tag"]'):
        tag = t.get_text(strip=True).lstrip('#')
        if tag and len(tag) < 20: tags.append(tag)
    if not tags: tags = [category]
    
    # ── 본문 파싱 ──
    article = (
        soup.find(class_='tt_article_useless_p_margin') or
        soup.find(class_='entry-content') or
        soup.find('article') or
        soup.find(class_='contents_style')
    )
    
    if not article:
        print(f'  ⚠️ 본문 못찾음')
        return None, None
    
    title_slug = slugify(title)
    
    # 본문을 순서대로 순회하면서 sections 생성
    sections = []
    intro_paragraphs = []
    intro_done = False
    h2_count = 0
    img_idx = 0
    body_since_h2 = 0  # 현재 h2 이후 body 수 (광고 배치용)
    
    for child in article.children:
        # 텍스트 노드
        if isinstance(child, NavigableString):
            text = str(child).strip()
            if text and not intro_done:
                intro_paragraphs.append(f'<p>{text}</p>')
            continue
        
        if not hasattr(child, 'name') or child.name is None:
            continue
        
        tag = child.name
        
        # script, style, 광고 건너뛰기
        if tag in ('script', 'style', 'noscript', 'ins'):
            continue
        
        # ── h2 처리 ──
        if tag == 'h2':
            h2_text = child.get_text(strip=True)
            if not h2_text:
                continue
            
            # intro 마감
            if not intro_done:
                if intro_paragraphs:
                    sections.append({'type': 'intro', 'html': ''.join(intro_paragraphs)})
                else:
                    sections.append({'type': 'intro', 'html': '<p></p>'})
                intro_done = True
                sections.append({'type': 'toc'})
                sections.append({'type': 'ad', 'slot': ADSENSE_TOP, 'format': 'autorelaxed'})
            
            # 이전 h2 섹션에 광고 삽입 (2~3 h2마다)
            if h2_count > 0 and h2_count % 2 == 0:
                sections.append({'type': 'ad', 'slot': ADSENSE_MID, 'format': 'auto'})
            
            h2_count += 1
            gradient = GRADIENTS[(h2_count - 1) % len(GRADIENTS)]
            sections.append({
                'type': 'h2',
                'id': f'section{h2_count}',
                'text': h2_text,
                'gradientStyle': gradient,
            })
            body_since_h2 = 0
            continue
        
        # ── h3 처리 ──
        if tag == 'h3':
            h3_text = child.get_text(strip=True)
            if h3_text:
                if not intro_done:
                    intro_paragraphs.append(f'<h3>{h3_text}</h3>')
                else:
                    sections.append({'type': 'body', 'html': f'<h3>{h3_text}</h3>'})
                    body_since_h2 += 1
            continue
        
        # ── 이미지 처리 ──
        img_tags = child.find_all('img')
        if img_tags:
            for img in img_tags:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or ''
                if not src or src.startswith('data:'):
                    # data-url, data-phocus 에서도 찾기
                    span = child.find('span', attrs={'data-url': True})
                    if span:
                        src = span['data-url']
                    elif child.find('span', attrs={'data-phocus': True}):
                        src = child.find('span', attrs={'data-phocus': True})['data-phocus']
                
                if not src or 'tistory1.daumcdn.net' in src:
                    continue
                
                img_idx += 1
                local = download_image(src, post_id, title_slug, img_idx)
                if local:
                    alt = img.get('alt', '') or ''
                    figcap = child.find('figcaption')
                    caption = figcap.get_text(strip=True) if figcap else alt or title
                    if not alt: alt = caption or title
                    
                    sections.append({
                        'type': 'image',
                        'src': local,
                        'alt': alt,
                        'caption': caption,
                    })
            
            # 이미지 외 텍스트가 있으면 body로
            for img in child.find_all('img'):
                img.decompose()
            remaining = child.get_text(strip=True)
            if remaining and len(remaining) > 15:
                if not intro_done:
                    intro_paragraphs.append(str(child))
                else:
                    sections.append({'type': 'body', 'html': str(child)})
                    body_since_h2 += 1
            continue
        
        # ── figure (이미지 없는 opengraph 링크카드) ──
        if tag == 'figure':
            # opengraph 카드 → CTA로 변환
            a_tag = child.find('a', href=True)
            if a_tag:
                href = a_tag.get('href', '')
                og_title_el = child.find(class_='og-title')
                text = og_title_el.get_text(strip=True) if og_title_el else a_tag.get_text(strip=True)
                if href and text:
                    sections.append({'type': 'cta', 'href': href, 'text': f'👉 {text}'})
            continue
        
        # ── CTA 버튼 (a 태그 with 스타일) ──
        if tag in ('div', 'p'):
            a_tag = child.find('a')
            if a_tag:
                a_style = a_tag.get('style', '') or ''
                a_text = a_tag.get_text(strip=True)
                a_href = a_tag.get('href', '')
                
                # 버튼 스타일 링크
                if ('background' in a_style or child.find('button')) and a_href and a_text:
                    sections.append({'type': 'cta', 'href': a_href, 'text': a_text})
                    continue
                
                # "바로가기", "보러가기" 패턴
                full_text = child.get_text(strip=True)
                if full_text == a_text and ('바로가기' in a_text or '보러가기' in a_text or '👉' in a_text or '🔗' in a_text):
                    sections.append({'type': 'cta', 'href': a_href, 'text': a_text})
                    continue
        
        # ── 테이블 ──
        if tag == 'table' or child.find('table'):
            tbl = child.find('table') or child
            # 테이블 속성 정리 (style 제거)
            for t_tag in tbl.find_all(True):
                if t_tag.get('style'):
                    del t_tag['style']
                for attr in list(t_tag.attrs.keys()):
                    if attr.startswith('data-'):
                        del t_tag[attr]
            table_html = str(tbl)
            if not intro_done:
                intro_paragraphs.append(table_html)
            else:
                sections.append({'type': 'body', 'html': table_html})
                body_since_h2 += 1
            continue
        
        # ── 일반 본문 (p, ul, ol, div 등) ──
        text = child.get_text(strip=True)
        if not text:
            continue
        
        # HTML 정리: data-ke 등 불필요한 속성 제거
        html = str(child)
        html = re.sub(r'\s+data-ke[a-z\-]*="[^"]*"', '', html)
        html = re.sub(r'\s+data-origin[a-z\-]*="[^"]*"', '', html)
        html = re.sub(r'\s+style="[^"]*list-style-type:[^"]*"', '', html)
        
        if not intro_done:
            intro_paragraphs.append(html)
        else:
            sections.append({'type': 'body', 'html': html})
            body_since_h2 += 1
    
    # intro가 안 닫힌 경우 (h2 없는 글)
    if not intro_done and intro_paragraphs:
        # h2 없이 intro만 있는 글 → 문단 기준으로 분할
        all_html = ''.join(intro_paragraphs)
        paras = re.findall(r'<p[^>]*>.*?</p>', all_html, re.DOTALL)
        if len(paras) > 4:
            sections.append({'type': 'intro', 'html': ''.join(paras[:3])})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_TOP, 'format': 'autorelaxed'})
            for p in paras[3:]:
                sections.append({'type': 'body', 'html': p})
        else:
            sections.append({'type': 'intro', 'html': all_html})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_TOP, 'format': 'autorelaxed'})
    
    # 마지막 body → ending
    for i in range(len(sections) - 1, -1, -1):
        if sections[i]['type'] == 'body':
            sections[i]['type'] = 'ending'
            break
    
    # 하단 광고
    sections.append({'type': 'ad', 'slot': ADSENSE_MID, 'format': 'auto'})
    
    meta = {
        'id': post_id,
        'slug': str(post_id),
        'title': title,
        'description': description,
        'category': category,
        'date': date_str,
        'tags': tags[:5],
        'thumbnail': None,
    }
    
    # 통계
    h2s = len([s for s in sections if s['type'] == 'h2'])
    bodies = len([s for s in sections if s['type'] in ('body', 'ending')])
    imgs = len([s for s in sections if s['type'] == 'image'])
    print(f'  ✅ h2={h2s} body={bodies} img={imgs} "{title[:30]}..."')
    
    return meta, sections


# ─── 파일 생성 ───

def write_post_js(post_id, sections):
    filepath = os.path.join(POSTS_DIR, f'{post_id}.js')
    lines = ['const post = {']
    lines.append(f'  id: {post_id},')
    lines.append('  sections: [')
    
    for s in sections:
        t = s['type']
        if t in ('intro', 'body', 'ending'):
            lines.append('    {')
            lines.append(f"      type: '{t}',")
            lines.append(f"      html: '{js_escape(s['html'])}'")
            lines.append('    },')
        elif t == 'toc':
            lines.append("    { type: 'toc' },")
        elif t == 'ad':
            lines.append(f"    {{ type: 'ad', slot: '{s['slot']}', format: '{s['format']}' }},")
        elif t == 'h2':
            lines.append('    {')
            lines.append(f"      type: 'h2',")
            lines.append(f"      id: '{s['id']}',")
            lines.append(f"      text: '{js_escape(s['text'])}',")
            lines.append(f"      gradientStyle: '{s.get('gradientStyle', GRADIENTS[0])}'")
            lines.append('    },')
        elif t == 'image':
            lines.append('    {')
            lines.append(f"      type: 'image',")
            lines.append(f"      src: '{s['src']}',")
            lines.append(f"      alt: '{js_escape(s.get('alt', ''))}',")
            lines.append(f"      caption: '{js_escape(s.get('caption', ''))}'")
            lines.append('    },')
        elif t == 'cta':
            lines.append('    {')
            lines.append(f"      type: 'cta',")
            lines.append(f"      href: '{js_escape(s['href'])}',")
            lines.append(f"      text: '{js_escape(s['text'])}'")
            lines.append('    },')
    
    lines.append('  ]')
    lines.append('}')
    lines.append('')
    lines.append('export default post')
    lines.append('')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def write_posts_meta(all_meta):
    filepath = os.path.join(DATA_DIR, 'posts.js')
    lines = ['const posts = [']
    for m in sorted(all_meta, key=lambda x: x['date'], reverse=True):
        lines.append('  {')
        lines.append(f"    id: {m['id']},")
        lines.append(f"    slug: '{m['slug']}',")
        lines.append(f"    title: '{js_escape(m['title'])}',")
        lines.append(f"    description: '{js_escape(m['description'])}',")
        lines.append(f"    category: '{m['category']}',")
        lines.append(f"    date: '{m['date']}',")
        tags = ', '.join([f"'{js_escape(t)}'" for t in m['tags']])
        lines.append(f"    tags: [{tags}],")
        lines.append(f"    thumbnail: null,")
        lines.append('  },')
    lines.append(']')
    lines.append('')
    lines.append('export default posts')
    lines.append('')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'\n📄 data/posts.js ({len(all_meta)}개)')


def write_sitemap(all_meta):
    filepath = os.path.join(PROJECT_DIR, 'public', 'sitemap.xml')
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    lines.append('  <url>')
    lines.append(f'    <loc>{BASE_URL}/</loc>')
    lines.append(f'    <lastmod>{max(m["date"] for m in all_meta)}</lastmod>')
    lines.append('    <changefreq>daily</changefreq>')
    lines.append('    <priority>1.0</priority>')
    lines.append('  </url>')
    for m in sorted(all_meta, key=lambda x: x['date'], reverse=True):
        lines.append('  <url>')
        lines.append(f'    <loc>{BASE_URL}/{m["slug"]}/</loc>')
        lines.append(f'    <lastmod>{m["date"]}</lastmod>')
        lines.append('    <changefreq>monthly</changefreq>')
        lines.append('    <priority>0.8</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'📄 public/sitemap.xml')


# ─── 메인 ───

def main():
    print('=' * 60)
    print(' car.ambitstock.com → Next.js 변환 v2')
    print('=' * 60)
    
    # 16번은 수동 관리 → 건드리지 않음
    SKIP_IDS = set()
    
    # 16번 posts/16.js가 이미 있으면 보존
    post16_path = os.path.join(POSTS_DIR, '16.js')
    post16_backup = None
    if os.path.exists(post16_path):
        with open(post16_path, 'r') as f:
            post16_backup = f.read()
        SKIP_IDS.add(16)
        print('ℹ️  posts/16.js 보존 (수동 관리)')
    
    urls = get_all_post_urls()
    if not urls:
        print('❌ 게시글을 찾을 수 없습니다.')
        return
    
    all_meta = []
    success = 0
    fail = 0
    
    for url in urls:
        pid = int(url.rstrip('/').split('/')[-1])
        if pid in SKIP_IDS:
            print(f'⏭️  #{pid} 건너뜀 (수동 관리)')
            # 메타는 추가
            all_meta.append({
                'id': 16,
                'slug': '16',
                'title': '자동차보험료 비교견적 사이트 가이드 2026년 TOP 5 | 실사용 기준으로 뽑은 진짜 유용한 곳',
                'description': '2026년 실사용 기준으로 뽑은 자동차보험 비교견적 사이트 TOP 5. 장단점 총정리.',
                'category': '자동차보험',
                'date': '2026-03-11',
                'tags': ['자동차보험', '비교견적', '보험료절감'],
                'thumbnail': None,
            })
            continue
        
        try:
            meta, sections = parse_post(url)
            if meta and sections:
                write_post_js(meta['id'], sections)
                all_meta.append(meta)
                success += 1
            else:
                fail += 1
        except Exception as e:
            print(f'  ❌ 에러: {e}')
            fail += 1
        
        time.sleep(0.3)
    
    # 16번 복원
    if post16_backup:
        with open(post16_path, 'w') as f:
            f.write(post16_backup)
    
    # 16번 메타 강제 추가 (URL 목록에 없어도)
    if not any(m['id'] == 16 for m in all_meta):
        all_meta.append({
            'id': 16,
            'slug': '16',
            'title': '자동차보험료 비교견적 사이트 가이드 2026년 TOP 5 | 실사용 기준으로 뽑은 진짜 유용한 곳',
            'description': '2026년 실사용 기준으로 뽑은 자동차보험 비교견적 사이트 TOP 5. 장단점 총정리.',
            'category': '자동차보험',
            'date': '2026-03-11',
            'tags': ['자동차보험', '비교견적', '보험료절감'],
            'thumbnail': None,
        })
        print('ℹ️  16번 메타 강제 추가 (URL 목록에 없었음)')
    
    # 메타 + sitemap 생성
    if all_meta:
        write_posts_meta(all_meta)
        write_sitemap(all_meta)
    
    # 검증
    print('\n' + '=' * 60)
    print('📊 검증 중...')
    import subprocess
    posts_files = [f for f in os.listdir(POSTS_DIR) if f.endswith('.js')]
    errors = 0
    for pf in posts_files:
        r = subprocess.run(['node', '--check', os.path.join(POSTS_DIR, pf)], capture_output=True)
        if r.returncode != 0:
            print(f'  ❌ 구문에러: {pf}')
            errors += 1
    
    img_count = len([f for f in os.listdir(IMAGES_DIR) if f.endswith('.png') or f.endswith('.jpg')])
    
    print(f'\n{"=" * 60}')
    print(f'✅ 완료!')
    print(f'  포스팅: {success}개 성공, {fail}개 실패')
    print(f'  구문: {len(posts_files)-errors}/{len(posts_files)} OK')
    print(f'  이미지: {img_count}개')
    print(f'{"=" * 60}')
    print(f'\n다음 단계:')
    print(f'  npm run dev  →  로컬 확인')
    print(f'  git add . && git commit -m "[data]: 전체 포스팅 재이관 v2" && git push')


if __name__ == '__main__':
    main()
