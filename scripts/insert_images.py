#!/usr/bin/env python3
"""
insert_images.py — 포스트 파일에 크롤링된 JPG 이미지를 자동 삽입

이관 포스트(51-474)에 다운로드된 JPG 이미지를 본문에 삽입합니다.
기존에 JPG 이미지가 이미 삽입된 포스트는 건너뜁니다.

사용법:
  python3 scripts/insert_images.py
"""

import os
import re
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_DIR = os.path.join(BASE_DIR, 'posts')
IMAGE_DIR = os.path.join(BASE_DIR, 'public', 'images')


def get_post_jpgs(post_id):
    """포스트 ID에 해당하는 JPG 파일 목록 반환"""
    patterns = [
        os.path.join(IMAGE_DIR, f'post{post_id}_poster.jpg'),
        os.path.join(IMAGE_DIR, f'post{post_id}_still1.jpg'),
        os.path.join(IMAGE_DIR, f'post{post_id}_still2.jpg'),
    ]
    return [p for p in patterns if os.path.exists(p)]


def already_has_jpg(content):
    """포스트 내용에 이미 JPG 이미지가 있는지 확인"""
    return '.jpg' in content


def find_insertion_point(content):
    """
    본문에서 이미지를 삽입할 위치를 찾습니다.
    규칙: body 섹션 뒤, ad 섹션 앞이 아닌 곳
    """
    # h2/body 패턴 찾기 - 첫 번째 body 뒤에 삽입
    # type: 'body' 다음에 오는 }, 위치를 찾되, 바로 다음이 ad가 아닌 곳
    body_pattern = re.compile(r"(type: 'body',\s*html: '[^']*')\s*\}")
    matches = list(body_pattern.finditer(content))

    if len(matches) < 2:
        return None

    # 두 번째 body 뒤에 삽입 시도
    target = matches[1]
    insert_pos = content.find('}', target.end() - 1) + 1

    # 다음 섹션이 ad인지 확인
    next_section = content[insert_pos:insert_pos + 100].strip()
    if next_section.startswith(',') and "'ad'" in next_section[:50]:
        # ad 바로 앞이면 세 번째 body 뒤 시도
        if len(matches) > 2:
            target = matches[2]
            insert_pos = content.find('}', target.end() - 1) + 1
            next_section = content[insert_pos:insert_pos + 100].strip()
            if next_section.startswith(',') and "'ad'" in next_section[:50]:
                # 첫 번째 body 뒤 시도
                target = matches[0]
                insert_pos = content.find('}', target.end() - 1) + 1

    return insert_pos


def insert_image_section(content, image_path, alt_text):
    """포스트 내용에 이미지 섹션을 삽입"""
    insert_pos = find_insertion_point(content)
    if insert_pos is None:
        return None

    # 상대 경로 생성
    rel_path = '/images/' + os.path.basename(image_path)

    image_section = f",\n    {{ type: 'image', src: '{rel_path}', alt: '{alt_text}', caption: '출처: 네이버 영화' }}"

    return content[:insert_pos] + image_section + content[insert_pos:]


def process_post(post_id):
    """포스트에 이미지 삽입"""
    post_file = os.path.join(POSTS_DIR, f'{post_id}.js')
    if not os.path.exists(post_file):
        return False

    jpgs = get_post_jpgs(post_id)
    if not jpgs:
        return False

    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 이미 JPG가 삽입되어 있으면 건너뜀
    if already_has_jpg(content):
        return False

    # 첫 번째 JPG만 삽입 (안전하게)
    jpg = jpgs[0]
    filename = os.path.basename(jpg)
    alt = f'포스트 {post_id} 관련 이미지'

    new_content = insert_image_section(content, jpg, alt)
    if new_content is None:
        print(f"  Post {post_id}: 삽입 위치를 찾을 수 없음")
        return False

    with open(post_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # node --check 검증
    result = os.system(f'node --check {post_file} 2>/dev/null')
    if result != 0:
        # 실패 시 원본 복구
        with open(post_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Post {post_id}: 구문 오류 → 원본 복구")
        return False

    print(f"  Post {post_id}: OK ({filename})")
    return True


if __name__ == '__main__':
    success = 0
    skip = 0
    fail = 0

    for post_id in range(51, 475):
        jpgs = get_post_jpgs(post_id)
        if not jpgs:
            continue

        post_file = os.path.join(POSTS_DIR, f'{post_id}.js')
        if not os.path.exists(post_file):
            continue

        with open(post_file, 'r') as f:
            if '.jpg' in f.read():
                skip += 1
                continue

        if process_post(post_id):
            success += 1
        else:
            fail += 1

    print(f"\n완료: 성공 {success}, 건너뜀 {skip}, 실패 {fail}")
