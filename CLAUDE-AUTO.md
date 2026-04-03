# CLAUDE-AUTO.md — 자동 포스팅 전용 규칙 (경량)

## 파일 구조
- `posts/{id}.js`: CJS (`const post = { id, sections: [...] }; module.exports = post`)
- `data/posts.js`: 메타데이터 배열 (id, slug, title, description, category, date, tags, thumbnail, relatedSlugs, contentType, platform, spoilerLevel)
- `data/posts-summary.json`: 요약 파일 (lastId, allTitles, recentPosts) — 중복 확인용

## 섹션 타입
intro, toc, h2, body, image, cta, ending, ad
- ad는 포스트 파일에 넣지 않음 (렌더러가 h2 뒤 자동 삽입)

## H2 규칙
금지: 날짜형, 불릿형, 이모지형, 잘린 문장, 본문 첫 문장과 동일

## 금지 문구
`이번 포스팅에서는`, `알아보겠습니다`, `많은 분들이 궁금해하시는`, `한눈에 정리`, `무조건 추천`, `한동안 멍했다`, `소름이 돋았다`

## 이미지
- 본문: 네이버 크롤링 (`python3 scripts/crawl_movie_images.py --post-id {ID} --query "{작품명}"`)
- og:image: SVG 1200x630 (`post{ID}_thumb.svg`)
- 최소 4장, TOP N 추천형은 작품당 1장
- alt: 구체적, caption: `출처: 네이버 영화`

## slug
영문 소문자 + 하이픈, 3~8단어, 핵심 키워드 포함

## 카테고리
영화추천, 드라마, 해외반응후기, 마블, 애니메이션 (이 5개만)

## intro 규칙
감정적 도입 + 핵심 판단. 추천 대상 박스 포함. AI형 서론 금지.

## 커밋
`content: {설명} ({ID})` + `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`

## 검증
`node --check posts/{id}.js` 필수. `node scripts/update-posts-summary.js` 마무리 실행.
