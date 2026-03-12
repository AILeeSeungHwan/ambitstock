#!/usr/bin/env python3
"""
Phase 3-5: 배치 이관 스크립트
Usage: python3 migrate_batch.py <batch_file> <start_id>
"""

import os, re, sys, time, json, urllib.parse
import requests
from bs4 import BeautifulSoup, NavigableString

BASE_URL = 'https://ambitstock.com'
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(PROJECT_DIR, 'posts')
IMAGES_DIR = os.path.join(PROJECT_DIR, 'public', 'images')

ADSENSE_SLOT = '6297515693'

GRADIENTS = [
    'linear-gradient(to right, #e50914, #ff6b6b)',
    'linear-gradient(to right, #1a73e8, #42a5f5)',
    'linear-gradient(to right, #6a1b9a, #ab47bc)',
    'linear-gradient(to right, #e53935, #ef5350)',
    'linear-gradient(to right, #00897b, #26a69a)',
    'linear-gradient(to right, #1a1a2e, #e94560)',
]

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
    if not s: return ''
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', ' ').replace('\r', '').replace('\t', ' ')
    s = s.replace('"', '&quot;')
    return s


def slugify(title):
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
        '원피스': 'one-piece', '귀멸': 'demon-slayer',
        '주술회전': 'jujutsu-kaisen', '나루토': 'naruto',
        '로맨스': 'romance', '코미디': 'comedy', '판타지': 'fantasy',
    }
    parts = []
    eng = re.findall(r'[A-Za-z][A-Za-z0-9]+', title)
    for w in eng:
        w_lower = w.lower()
        if len(w_lower) > 1 and w_lower not in parts:
            parts.append(w_lower)
    for kr, en in kr_en.items():
        if kr in title and en not in parts:
            parts.insert(0, en)
    nums = re.findall(r'\d{4}|\d+(?=시즌|편|위|월)', title)
    for n in nums:
        if n not in parts: parts.append(n)
    slug = '-'.join(parts[:8]) if parts else 'post'
    return re.sub(r'-+', '-', slug).strip('-')[:80]


def detect_category(title, text=''):
    combined = title + ' ' + text
    if '마블' in combined or 'MCU' in combined or '어벤져스' in combined: return '마블'
    if '드라마' in combined and '영화' not in title: return '드라마'
    if any(k in combined for k in ['애니', '만화', '체인소', 'MAPPA', '원피스', '귀멸', '나루토', '주술회전']): return '애니메이션'
    if '해외' in combined and ('반응' in combined or '평점' in combined): return '해외반응후기'
    return '영화추천'


def parse_entry(url, post_id):
    try:
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f'  [{post_id}] FAIL: {e}')
        return None, None

    soup = BeautifulSoup(resp.text, 'html.parser')

    og_title = soup.find('meta', property='og:title')
    title = og_title['content'] if og_title else (soup.title.text.strip() if soup.title else f'포스트 {post_id}')
    title = re.sub(r'\s*[\|·\-]\s*(R의\s*필름공장|ambitstock).*$', '', title).strip()

    og_desc = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'description'})
    description = og_desc['content'][:150] if og_desc else title

    date_meta = soup.find('meta', property='article:published_time')
    if date_meta:
        date_str = date_meta['content'][:10]
    else:
        date_el = soup.find('time') or soup.find(class_=re.compile(r'date'))
        dm = re.search(r'(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})', date_el.text if date_el else '')
        date_str = f'{dm.group(1)}-{dm.group(2).zfill(2)}-{dm.group(3).zfill(2)}' if dm else '2025-01-01'

    tags = []
    for t in soup.select('.tag_label a, .tags a, a[rel="tag"]'):
        tag = t.get_text(strip=True).lstrip('#')
        if tag and len(tag) < 20: tags.append(tag)

    article = (
        soup.find(class_='tt_article_useless_p_margin') or
        soup.find(class_='entry-content') or
        soup.find('article') or
        soup.find(class_='contents_style')
    )
    if not article:
        print(f'  [{post_id}] FAIL: no article')
        return None, None

    category = detect_category(title, article.get_text()[:200])
    if not tags: tags = [category]

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
        if not hasattr(child, 'name') or child.name is None: continue
        tag = child.name
        if tag in ('script', 'style', 'noscript', 'ins'): continue

        if tag == 'h2':
            h2_text = child.get_text(strip=True)
            if not h2_text: continue
            if not intro_done:
                sections.append({'type': 'intro', 'html': ''.join(intro_paragraphs) if intro_paragraphs else '<p>' + title + '</p>'})
                intro_done = True
                sections.append({'type': 'toc'})
                sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})
            if h2_count > 0 and h2_count % 3 == 0:
                sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})
            h2_count += 1
            sections.append({'type': 'h2', 'id': f'section{h2_count}', 'text': h2_text, 'gradientStyle': GRADIENTS[(h2_count-1) % len(GRADIENTS)]})
            continue

        if tag == 'h3':
            h3_text = child.get_text(strip=True)
            if h3_text:
                if not intro_done: intro_paragraphs.append(f'<h3>{h3_text}</h3>')
                else: sections.append({'type': 'body', 'html': f'<h3>{h3_text}</h3>'})
            continue

        img_tags = child.find_all('img')
        if img_tags:
            for img in child.find_all('img'): img.decompose()
            remaining = child.get_text(strip=True)
            if remaining and len(remaining) > 15:
                html = re.sub(r'\s+data-ke[a-z\-]*="[^"]*"', '', str(child))
                if not intro_done: intro_paragraphs.append(html)
                else: sections.append({'type': 'body', 'html': html})
            continue

        if tag == 'figure':
            a_tag = child.find('a', href=True)
            if a_tag:
                href = a_tag.get('href', '')
                og_t = child.find(class_='og-title')
                cta_text = og_t.get_text(strip=True) if og_t else a_tag.get_text(strip=True)
                if href and cta_text:
                    sections.append({'type': 'cta', 'href': href, 'text': cta_text})
            continue

        if tag == 'table' or child.find('table'):
            tbl = child.find('table') or child
            for t_tag in tbl.find_all(True):
                if t_tag.get('style'): del t_tag['style']
            if not intro_done: intro_paragraphs.append(str(tbl))
            else: sections.append({'type': 'body', 'html': str(tbl)})
            continue

        text = child.get_text(strip=True)
        if not text: continue
        html = str(child)
        html = re.sub(r'\s+data-ke[a-z\-]*="[^"]*"', '', html)
        html = re.sub(r'\s+data-origin[a-z\-]*="[^"]*"', '', html)
        if not intro_done: intro_paragraphs.append(html)
        else: sections.append({'type': 'body', 'html': html})

    if not intro_done and intro_paragraphs:
        all_html = ''.join(intro_paragraphs)
        paras = re.findall(r'<p[^>]*>.*?</p>', all_html, re.DOTALL)
        if len(paras) > 4:
            sections.append({'type': 'intro', 'html': ''.join(paras[:3])})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})
            for p in paras[3:]: sections.append({'type': 'body', 'html': p})
        else:
            sections.append({'type': 'intro', 'html': all_html})
            sections.append({'type': 'toc'})
            sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

    for i in range(len(sections)-1, -1, -1):
        if sections[i]['type'] == 'body':
            sections[i]['type'] = 'ending'
            break

    sections.append({'type': 'ad', 'slot': ADSENSE_SLOT, 'format': 'auto'})

    ad_count = sum(1 for s in sections if s['type'] == 'ad')
    while ad_count > 3:
        for i in range(len(sections)-2, -1, -1):
            if sections[i]['type'] == 'ad':
                sections.pop(i); ad_count -= 1; break

    thumb_path = f'/images/post{post_id}_thumb.svg'
    generate_svg(post_id, title, category)

    for i, s in enumerate(sections):
        if s['type'] == 'intro':
            sections.insert(i+1, {'type': 'image', 'src': thumb_path, 'alt': title, 'caption': title})
            break

    slug = slugify(title)

    meta = {
        'id': post_id, 'slug': slug, 'title': title,
        'description': description, 'category': category,
        'date': date_str, 'tags': tags[:5],
        'thumbnail': thumb_path, 'entry_url': url,
    }
    return meta, sections


def generate_svg(post_id, title, category):
    bg, tc, accent = CAT_COLORS.get(category, ('#1a73e8', '#ffffff', '#ffd600'))
    lines = []
    cur = ''
    for c in title:
        cur += c
        if len(cur) >= 18: lines.append(cur); cur = ''
    if cur: lines.append(cur)
    lines = lines[:3]
    y0 = 280 if len(lines) <= 2 else 240
    te = ''
    for i, l in enumerate(lines):
        y = y0 + i * 60
        esc = l.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;').replace("'",'&apos;')
        te += f'    <text x="600" y="{y}" text-anchor="middle" fill="{tc}" font-size="44" font-weight="bold" font-family="Pretendard, -apple-system, sans-serif">{esc}</text>\n'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs><linearGradient id="bg{post_id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:{bg}"/><stop offset="100%" style="stop-color:{bg}dd"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg{post_id})" rx="0"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="rgba(0,0,0,0.15)"/>
  <text x="600" y="160" text-anchor="middle" fill="{accent}" font-size="28" font-weight="600" font-family="Pretendard, -apple-system, sans-serif">{category}</text>
{te}  <text x="600" y="520" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="22" font-family="Pretendard, -apple-system, sans-serif">R의 필름공장 · ambitstock.com</text>
</svg>'''
    with open(os.path.join(IMAGES_DIR, f'post{post_id}_thumb.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)


def write_post_js(post_id, sections):
    lines = ['const post = {', f'  id: {post_id},', '  sections: [']
    for s in sections:
        t = s['type']
        if t in ('intro','body','ending'):
            lines += ['    {', f"      type: '{t}',", f"      html: '{js_escape(s['html'])}'", '    },']
        elif t == 'toc': lines.append("    { type: 'toc' },")
        elif t == 'ad': lines.append(f"    {{ type: 'ad', slot: '{s['slot']}', format: '{s['format']}' }},")
        elif t == 'h2':
            lines += ['    {', f"      type: 'h2',", f"      id: '{s['id']}',", f"      text: '{js_escape(s['text'])}',", f"      gradientStyle: '{s.get('gradientStyle', GRADIENTS[0])}'", '    },']
        elif t == 'image':
            lines += ['    {', f"      type: 'image',", f"      src: '{s['src']}',", f"      alt: '{js_escape(s.get('alt',''))}',", f"      caption: '{js_escape(s.get('caption',''))}'", '    },']
        elif t == 'cta':
            lines += ['    {', f"      type: 'cta',", f"      href: '{js_escape(s['href'])}',", f"      text: '{js_escape(s['text'])}'", '    },']
    lines += ['  ]', '}', '', 'module.exports = post', '']
    with open(os.path.join(POSTS_DIR, f'{post_id}.js'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    if len(sys.argv) < 3:
        print('Usage: python3 migrate_batch.py <batch_file> <start_id>')
        sys.exit(1)

    batch_file = sys.argv[1]
    start_id = int(sys.argv[2])

    with open(batch_file) as f:
        urls = [l.strip() for l in f if l.strip()]

    print(f'Batch: {os.path.basename(batch_file)}, {len(urls)} URLs, start ID={start_id}')

    all_meta = []
    used_slugs = set()
    success = fail = 0

    for i, url in enumerate(urls):
        pid = start_id + i
        try:
            meta, sections = parse_entry(url, pid)
            if meta and sections:
                base = meta['slug']
                slug = base
                c = 2
                while slug in used_slugs: slug = f'{base}-{c}'; c += 1
                used_slugs.add(slug)
                meta['slug'] = slug
                write_post_js(pid, sections)
                all_meta.append(meta)
                success += 1
                if success % 10 == 0:
                    print(f'  ...{success}/{len(urls)} done')
            else: fail += 1
        except Exception as e:
            print(f'  [{pid}] ERROR: {e}')
            fail += 1
        time.sleep(0.3)

    # Save metadata to JSON for later merging
    meta_file = batch_file.replace('.txt', '_meta.json')
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(all_meta, f, ensure_ascii=False, indent=2)

    # Verify JS syntax
    import subprocess
    errors = 0
    for m in all_meta:
        r = subprocess.run(['node', '--check', os.path.join(POSTS_DIR, f'{m["id"]}.js')], capture_output=True)
        if r.returncode != 0:
            print(f'  SYNTAX_ERR: {m["id"]}.js')
            errors += 1

    print(f'DONE: {success} ok, {fail} fail, {errors} syntax errors')
    print(f'IDs: {start_id}-{start_id + success - 1}')
    print(f'Meta: {meta_file}')


if __name__ == '__main__':
    main()
