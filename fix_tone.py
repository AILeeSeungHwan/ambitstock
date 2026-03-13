#!/usr/bin/env python3
"""Posts 1-50 톤앤매너 자동 수정 스크립트"""
import os, re, subprocess, sys

REPLACEMENTS = [
    # 과장 표현 제거/완화
    ('진짜 소름이 돋았다', '인상적이었다'),
    ('진짜 소름 돋았다', '인상적이었다'),
    ('소름이 돋았다', '인상적이었다'),
    ('소름이 돋는다', '기대가 된다'),
    ('소름 돋는다', '기대가 된다'),
    ('소름이 돋지 않나', '기대되지 않나'),
    ('상상만으로도 소름이 돋는다', '상상만으로도 기대가 된다'),
    ('소름이 돋았던', '기억에 남는'),
    ('장난 아닌데', '상당한데'),
    ('장난 아닌', '상당한'),
    ('미쳤기 때문에', '좋기 때문에'),
    ('퀄리티가 미쳤', '퀄리티가 좋았'),
    # 완벽/무조건/반드시
    ('완벽하게 정리', '정리'),
    ('완벽하게 이해', '충분히 이해'),
    ('완벽한 입문', '괜찮은 입문'),
    ('완벽한 마무리', '좋은 마무리'),
    ('완벽한 밸런스', '좋은 밸런스'),
    ('완벽 분석', '분석'),
    ('완벽 정리', '정리'),
    ('완벽하게 마무리', '잘 마무리'),
    ('무조건 개봉순', '개봉순이 낫다'),
    ('무조건이고', '대표적이고'),
    ('무조건 봐야', '볼 만'),
    ('무조건 추천', '추천할 만하다'),
    ('반드시 봐야', '봐두면 좋을'),
    ('반드시 끝까지', '끝까지'),
    ('반드시 다시', '다시'),
    # 강조 줄이기
    ('기대감이 폭발', '기대가 크다'),
    ('기대감이 상당하다', '기대가 된다'),
    ('기대감에 벌써부터 설렌다', '기대가 된다'),
    ('역대급 기대작', '큰 기대작'),
    ('역대급 앙상블', '화려한 앙상블'),
    ('역대급이', '상당히 좋은'),
    ('이건 반칙이다', '이 조합이 좋다'),
    ('진짜 대단하다', '대단하다'),
    ('진짜 궁금하다', '궁금하다'),
    ('진짜 최고의', '최고의'),
    ('정말 많이 받는다', '많이 받는다'),
    ('정말 궁금하다', '궁금하다'),
    ('정말 많을 거다', '많을 거다'),
    # 서비스형 어투
    ('알려드리겠다', '정리했다'),
    ('알려드린다', '정리했다'),
    ('정리해드린다', '정리했다'),
    ('추천해드린다', '추천한다'),
    ('준비했다.', '써봤다.'),
    ('준비했다</p>', '써봤다</p>'),
    ('당신을 위해 ', ''),
    ('확인해보시길', '참고하면 된다'),
    ('참고하시길', '참고하면 된다'),
    ('참고하시면 된다', '참고하면 된다'),
    ('보시길 강력 추천한다', '보는 게 좋다'),
    ('보시길 추천한다', '보는 게 좋다'),
    ('강력 추천한다', '추천한다'),
    ('~하시길 바란다', '하면 된다'),
    ('확인해보자', '참고해두자'),
    # 불필요한 감탄
    ('진짜 멍하니', '멍하니'),
    ('진짜 설명이', '설명이'),
    ('진짜 다시', '다시'),
    ('정말 잊지 못할', '잊지 못할'),
    # ending 톤
    ('이 글이 도움이 됐다면', '도움이 됐다면'),
    ('꼭 확인해보시길!', '참고하면 좋다.'),
    ('이었던 것도 기억에 남는다', '이었다'),
    # "~할 거다" 계열 과장
    ('평생 잊지 못할 거다', '오래 기억에 남는다'),
    ('다시 없을 순간이다', '드문 순간이다'),
    ('확신한다', '생각한다'),
]

def fix_tone(content):
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    return content

def main():
    posts_dir = os.path.join(os.path.dirname(__file__), 'posts')

    # 이미 수정된 파일 목록 (에이전트가 처리한 것)
    already_done = {1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 31, 32, 33, 34, 41, 42, 43, 44}

    # 1-50 전부 처리 (이미 수정된 것도 추가 패스 적용)
    target = list(range(1, 51))

    fixed = 0
    errors = []

    for pid in target:
        filepath = os.path.join(posts_dir, f'{pid}.js')
        if not os.path.exists(filepath):
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()

        modified = fix_tone(original)

        if modified != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified)

            # node --check
            result = subprocess.run(['node', '--check', filepath], capture_output=True, text=True)
            if result.returncode != 0:
                errors.append(f'{pid}.js: {result.stderr.strip()}')
                # Revert
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(original)
                print(f'  FAIL (reverted): {pid}.js')
            else:
                fixed += 1
                print(f'  OK: {pid}.js')
        else:
            print(f'  SKIP (no changes): {pid}.js')

    print(f'\n=== Done: {fixed} files fixed ===')
    if errors:
        print(f'Errors: {len(errors)}')
        for e in errors:
            print(f'  {e}')

if __name__ == '__main__':
    main()
