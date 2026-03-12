#!/usr/bin/env python3
"""
Phase 3-4: 상위 30개 /entry/ URL 이관 스크립트
- 티스토리 /entry/ 페이지 크롤링
- Next.js posts/{id}.js + SVG 썸네일 생성
- data/posts.js 메타데이터 추가 (기존 50개 보존)
- sitemap.xml 업데이트
"""

import os, re, sys, time, json, urllib.parse
import requests
from bs4 import BeautifulSoup, NavigableString

# ─── 설정 ───
BASE_URL = 'https://ambitstock.com'
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(PROJECT_DIR, 'posts')
IMAGES_DIR = os.path.join(PROJECT_DIR, 'public', 'images')
DATA_DIR = os.path.join(PROJECT_DIR, 'data')

ADSENSE_SLOT = '6297515693'
START_ID = 51  # 기존 50개 이후부터

GRADIENTS = [
    'linear-gradient(to right, #e50914, #ff6b6b)',
    'linear-gradient(to right, #1a73e8, #42a5f5)',
    'linear-gradient(to right, #6a1b9a, #ab47bc)',
    'linear-gradient(to right, #e53935, #ef5350)',
    'linear-gradient(to right, #00897b, #26a69a)',
    'linear-gradient(to right, #1a1a2e, #e94560)',
]

# 카테고리별 SVG 색상
CAT_COLORS = {
    '영화추천': ('#1a73e8', '#ffffff', '#ffd600'),
    '해외반응후기': ('#e53935', '#ffffff', '#ffffff'),
    '마블': ('#1a1a2e', '#ffffff', '#ffd700'),
    '드라마': ('#6a1b9a', '#ffffff', '#81d4fa'),
    '애니메이션': ('#00897b', '#ffffff', '#ffd600'),
}

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
})


def js_escape(s):
    """JS 문자열 안전하게 이스케이프"""
    if not s:
        return ''
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', ' ')
    s = s.replace('\r', '')
    s = s.replace('\t', ' ')
    # HTML 따옴표 처리
    s = s.replace('"', '&quot;')
    return s


def slugify(title):
    """한국어 제목 → 영문 SEO slug"""
    kr_en = {
        '넷플릭스': 'netflix', '디즈니플러스': 'disney-plus',
        '마블': 'marvel', '영화': 'movie', '드라마': 'drama',
        '애니메이션': 'animation', '추천': 'recommend',
        '리뷰': 'review', '관람평': 'review', '후기': 'review',
        '해외': 'overseas', '반응': 'reaction', '평점': 'rating',
        '결말': 'ending', '해석': 'analysis', '줄거리': 'plot',
        '시즌': 'season', '시리즈': 'series', '개봉': 'release',
        '공포': 'horror', '스릴러': 'thriller', '액션': 'action',
        '총정리': 'guide', '비교': 'comparison', '요금제': 'plan',
        '할인': 'discount', '신작': 'new-release',
        '흥행': 'box-office', '체인소': 'chainsaw',
        'OTT': 'ott', '쿠팡플레이': 'coupang-play',
        '티빙': 'tving', '웨이브': 'wavve',
    }

    parts = []
    # 영어 단어 추출
    eng = re.findall(r'[A-Za-z][A-Za-z0-9]+', title)
    for w in eng:
        w_lower = w.lower()
        if len(w_lower) > 1 and w_lower not in parts:
            parts.append(w_lower)

    # 한국어 키워드 매핑
    for kr, en in kr_en.items():
        if kr in title and en not in parts:
            parts.insert(0, en)

    # 숫자 추출 (시즌, 연도 등)
    nums = re.findall(r'\d{4}|\d+(?=시즌|편|위|월)', title)
    for n in nums:
        if n not in parts:
            parts.append(n)

    slug = '-'.join(parts[:8]) if parts else 'post'
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:80]


def detect_category(title, text=''):
    """제목/본문에서 카테고리 감지"""
    combined = title + ' ' + text
    if '마블' in combined or 'MCU' in combined or '어벤져스' in combined:
        return '마블'
    if '드라마' in combined and '영화' not in title:
        return '드라마'
    if '애니' in combined or '만화' in combined or '체인소' in combined or 'MAPPA' in combined:
        return '애니메이션'
    if '해외' in combined and ('반응' in combined or '평점' in combined):
        return '해외반응후기'
    return '영화추천'


def parse_entry_page(url, post_id):
    """티스토리 /entry/ 페이지 파싱 → meta + sections"""
    print(f'  [{post_id}] 크롤링: {urllib.parse.unquote(url)[:60]}...')

    try:
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f'  ❌ 요청 실패: {e}')
        return None, None

    soup = BeautifulSoup(resp.text, 'html.parser')

    # 메타 추출
    og_title = soup.find('meta', property='og:title')
    title = og_title['content'] if og_title else (soup.title.text.strip() if soup.title else f'포스트 {post_id}')
    title = re.sub(r'\s*[\|·\-]\s*(R의\s*필름공장|ambitstock).*$', '', title).strip()

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

    # 태그
    tags = []
    for t in soup.select('.tag_label a, .tags a, a[rel="tag"]'):
        tag = t.get_text(strip=True).lstrip('#')
        if tag and len(tag) < 20:
            tags.append(tag)

    # 본문
    article = (
        soup.find(class_='tt_article_useless_p_margin') or
        soup.find(class_='entry-content') or
        soup.find('article') or
        soup.find(class_='contents_style')
    )

    if not article:
        print(f'  ⚠️ 본문 못찾음')
        return None, None

    category = detect_category(title, article.get_text()[:200])
    if not tags:
        tags = [category]

    # 섹션 파싱
    sections = []
    intro_paragraphs = []
    intro_done = False
    h2_count = 0

    for child in article.children:
        if isinstance(child, NavigableString):
            text = str(child).strip()
            if text and not intro_done:
                intro_paragraphs.append(f'<p>{text}</p>')
            continue

        if not hasattr(child, 'name') or child.name is None:
            continue

        tag = child.name

        if tag in ('script', 'style', 'noscript', 'ins'):
            continue

        # h2
        if tag == 'h2':
            h2_text = child.get_text(strip=True)
            if not h2_text:
                continue

            if not intro_done:
                if intro_paragraphs:
                    sections.append({'type': 'intro', 'html': ''.join(intro_paragraphs)})
                else:
                    sections.append({'type': 'intro', 'html': '<p>' + title + '</p>'})
                intro_done = True
                sections.append({'type': 'toc'})
                sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

            if h2_count > 0 and h2_count % 3 == 0:
                sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

            h2_count += 1
            gradient = GRADIENTS[(h2_count - 1) % len(GRADIENTS)]
            sections.append({
                'type': 'h2',
                'id': f'section{h2_count}',
                'text': h2_text,
                'gradientStyle': gradient,
            })
            continue

        # h3
        if tag == 'h3':
            h3_text = child.get_text(strip=True)
            if h3_text:
                if not intro_done:
                    intro_paragraphs.append(f'<h3>{h3_text}</h3>')
                else:
                    sections.append({'type': 'body', 'html': f'<h3>{h3_text}</h3>'})
            continue

        # 이미지 — SVG 썸네일만 사용, 원본 이미지 다운로드 안함
        img_tags = child.find_all('img')
        if img_tags:
            for img in child.find_all('img'):
                img.decompose()
            remaining = child.get_text(strip=True)
            if remaining and len(remaining) > 15:
                html = str(child)
                html = re.sub(r'\s+data-ke[a-z\-]*="[^"]*"', '', html)
                if not intro_done:
                    intro_paragraphs.append(html)
                else:
                    sections.append({'type': 'body', 'html': html})
            continue

        # figure (opengraph 카드)
        if tag == 'figure':
            a_tag = child.find('a', href=True)
            if a_tag:
                href = a_tag.get('href', '')
                og_title_el = child.find(class_='og-title')
                cta_text = og_title_el.get_text(strip=True) if og_title_el else a_tag.get_text(strip=True)
                if href and cta_text:
                    sections.append({'type': 'cta', 'href': href, 'text': cta_text})
            continue

        # 테이블
        if tag == 'table' or child.find('table'):
            tbl = child.find('table') or child
            for t_tag in tbl.find_all(True):
                if t_tag.get('style'):
                    del t_tag['style']
            table_html = str(tbl)
            if not intro_done:
                intro_paragraphs.append(table_html)
            else:
                sections.append({'type': 'body', 'html': table_html})
            continue

        # 일반 본문
        text = child.get_text(strip=True)
        if not text:
            continue

        html = str(child)
        html = re.sub(r'\s+data-ke[a-z\-]*="[^"]*"', '', html)
        html = re.sub(r'\s+data-origin[a-z\-]*="[^"]*"', '', html)

        if not intro_done:
            intro_paragraphs.append(html)
        else:
            sections.append({'type': 'body', 'html': html})

    # intro 미닫힘
    if not intro_done and intro_paragraphs:
        all_html = ''.join(intro_paragraphs)
        paras = re.findall(r'<p[^>]*>.*?</p>', all_html, re.DOTALL)
        if len(paras) > 4:
            sections.append({'type': 'intro', 'html': ''.join(paras[:3])})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})
            for p in paras[3:]:
                sections.append({'type': 'body', 'html': p})
        else:
            sections.append({'type': 'intro', 'html': all_html})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

    # 마지막 body → ending
    for i in range(len(sections) - 1, -1, -1):
        if sections[i]['type'] == 'body':
            sections[i]['type'] = 'ending'
            break

    # 하단 광고
    sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

    # 광고 수 제한 (최대 3개)
    ad_count = sum(1 for s in sections if s['type'] == 'ad')
    while ad_count > 3:
        for i in range(len(sections) - 2, -1, -1):
            if sections[i]['type'] == 'ad':
                sections.pop(i)
                ad_count -= 1
                break

    slug = slugify(title)

    # 썸네일 SVG 생성
    thumb_path = f'/images/post{post_id}_thumb.svg'
    generate_svg_thumbnail(post_id, title, category)

    # 대표 이미지 섹션 추가 (intro 뒤)
    for i, s in enumerate(sections):
        if s['type'] == 'intro':
            sections.insert(i + 1, {
                'type': 'image',
                'src': thumb_path,
                'alt': title,
                'caption': title,
            })
            break

    meta = {
        'id': post_id,
        'slug': slug,
        'title': title,
        'description': description,
        'category': category,
        'date': date_str,
        'tags': tags[:5],
        'thumbnail': thumb_path,
        'entry_url': url,
    }

    h2s = len([s for s in sections if s['type'] == 'h2'])
    bodies = len([s for s in sections if s['type'] in ('body', 'ending')])
    print(f'  ✅ h2={h2s} body={bodies} "{title[:40]}"')

    return meta, sections


def generate_svg_thumbnail(post_id, title, category):
    """SVG 썸네일 생성"""
    bg, text_color, accent = CAT_COLORS.get(category, ('#1a73e8', '#ffffff', '#ffd600'))

    # 제목 줄바꿈 처리
    lines = []
    current = ''
    for char in title:
        current += char
        if len(current) >= 18:
            lines.append(current)
            current = ''
    if current:
        lines.append(current)
    lines = lines[:3]  # 최대 3줄

    title_y_start = 280 if len(lines) <= 2 else 240
    title_elements = ''
    for i, line in enumerate(lines):
        y = title_y_start + i * 60
        escaped = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')
        title_elements += f'    <text x="600" y="{y}" text-anchor="middle" fill="{text_color}" font-size="44" font-weight="bold" font-family="Pretendard, -apple-system, sans-serif">{escaped}</text>\n'

    cat_display = category
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg{post_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{bg}"/>
      <stop offset="100%" style="stop-color:{bg}dd"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg{post_id})" rx="0"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="rgba(0,0,0,0.15)"/>
  <text x="600" y="160" text-anchor="middle" fill="{accent}" font-size="28" font-weight="600" font-family="Pretendard, -apple-system, sans-serif">{cat_display}</text>
{title_elements}
  <text x="600" y="520" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="22" font-family="Pretendard, -apple-system, sans-serif">R의 필름공장 · ambitstock.com</text>
</svg>'''

    filepath = os.path.join(IMAGES_DIR, f'post{post_id}_thumb.svg')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)


def write_post_js(post_id, sections):
    """posts/{id}.js 생성"""
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
    lines.append('module.exports = post')
    lines.append('')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def update_data_posts(new_metas):
    """data/posts.js에 새 메타데이터 추가 (기존 보존)"""
    filepath = os.path.join(DATA_DIR, 'posts.js')

    # 기존 파일 읽기
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 기존 배열 닫는 부분 찾기
    # ']' 다음에 module.exports가 오는 패턴

    # 새 메타 문자열 생성
    new_entries = []
    for m in sorted(new_metas, key=lambda x: x['id']):
        entry_lines = []
        entry_lines.append('  {')
        entry_lines.append(f"    id: {m['id']},")
        entry_lines.append(f"    slug: '{js_escape(m['slug'])}',")
        entry_lines.append(f"    title: '{js_escape(m['title'])}',")
        entry_lines.append(f"    description: '{js_escape(m['description'])}',")
        entry_lines.append(f"    category: '{m['category']}',")
        entry_lines.append(f"    date: '{m['date']}',")
        tags_str = ', '.join([f"'{js_escape(t)}'" for t in m['tags']])
        entry_lines.append(f"    tags: [{tags_str}],")
        entry_lines.append(f"    thumbnail: '{m['thumbnail']}',")
        entry_lines.append('  },')
        new_entries.append('\n'.join(entry_lines))

    new_block = '\n'.join(new_entries)

    # 배열 끝 직전에 삽입
    # 패턴: ]\n\nmodule.exports 또는 ];\n\nmodule.exports
    content = content.rstrip()
    # 마지막 ] 찾기
    last_bracket = content.rfind(']')
    if last_bracket > 0:
        before = content[:last_bracket]
        after = content[last_bracket:]
        content = before + '\n' + new_block + '\n' + after

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content + '\n')

    print(f'  📄 data/posts.js 업데이트 (+{len(new_metas)}개)')


def update_sitemap(new_metas):
    """sitemap.xml에 새 URL 추가"""
    filepath = os.path.join(PROJECT_DIR, 'public', 'sitemap.xml')

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_urls = ''
    for m in new_metas:
        new_urls += f'''  <url>
    <loc>{BASE_URL}/{m['slug']}/</loc>
    <lastmod>{m['date']}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
'''

    content = content.replace('</urlset>', new_urls + '</urlset>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'  📄 sitemap.xml 업데이트 (+{len(new_metas)}개)')


def main():
    print('=' * 60)
    print(' Phase 3-4: 상위 30개 /entry/ 이관')
    print('=' * 60)

    # 상위 30개 URL 읽기
    with open('/tmp/ambitstock_entry_urls.txt') as f:
        all_urls = [line.strip() for line in f if line.strip()]

    urls = all_urls[:30]
    print(f'대상: {len(urls)}개 URL\n')

    all_meta = []
    success = 0
    fail = 0
    used_slugs = set()

    for i, url in enumerate(urls):
        post_id = START_ID + i

        try:
            meta, sections = parse_entry_page(url, post_id)
            if meta and sections:
                # slug 중복 방지
                base_slug = meta['slug']
                slug = base_slug
                counter = 2
                while slug in used_slugs:
                    slug = f'{base_slug}-{counter}'
                    counter += 1
                used_slugs.add(slug)
                meta['slug'] = slug

                write_post_js(post_id, sections)
                all_meta.append(meta)
                success += 1
            else:
                fail += 1
        except Exception as e:
            print(f'  ❌ 에러: {e}')
            import traceback
            traceback.print_exc()
            fail += 1

        time.sleep(0.5)

    if all_meta:
        update_data_posts(all_meta)
        update_sitemap(all_meta)

    # 검증
    print(f'\n{"=" * 60}')
    print(f'📊 검증 중...')
    import subprocess
    errors = 0
    for m in all_meta:
        pf = os.path.join(POSTS_DIR, f'{m["id"]}.js')
        r = subprocess.run(['node', '--check', pf], capture_output=True)
        if r.returncode != 0:
            print(f'  ❌ 구문에러: {m["id"]}.js — {r.stderr.decode()[:100]}')
            errors += 1

    print(f'\n{"=" * 60}')
    print(f'✅ 완료!')
    print(f'  포스팅: {success}개 성공, {fail}개 실패, {errors}개 구문에러')
    print(f'  ID 범위: {START_ID} ~ {START_ID + success - 1}')
    print(f'{"=" * 60}')

    # 이관 매핑 정보 출력 (next.config.js 개별 리다이렉트용)
    print('\n📋 리다이렉트 매핑:')
    for m in all_meta:
        entry_path = m['entry_url'].replace('https://ambitstock.com', '')
        print(f'  {entry_path} → /{m["slug"]}/')


if __name__ == '__main__':
    main()
