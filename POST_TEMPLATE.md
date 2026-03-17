# POST_TEMPLATE.md — ambitstock.com 신규 포스팅 작성 표준 템플릿

> 마지막 업데이트: 2026-03-13
> 모든 신규 포스팅은 이 구조를 기본으로 작성할 것.
> 포스팅 유형별 변형은 하단 참조.

---

## 기본 구조 (8단계)

```
1. 한 줄 결론 — 이 작품을 볼지 말지 핵심 판단
2. 이런 사람에게 맞는 작품 — 취향/상황/분위기 기준
3. 스포일러 여부 / 감상 전 체크 포인트
4. 핵심 추천 이유 또는 해석 포인트
5. 분위기 / 장르 / 감정선 / 속도감 / 몰입도
6. 비슷한 작품과 비교
7. 이런 사람에게는 안 맞을 수 있음
8. 관련 작품/포스팅 내부 링크
```

---

## sections 배열 순서 (필수)

```js
sections: [
  // 1. intro — 감정적 도입 + 한 줄 결론 + 이런 사람에게 맞는 작품 박스
  { type: 'intro', html: '...' },

  // 2. 영화 포스터 이미지 (네이버 크롤링 — scripts/crawl_movie_images.py 활용)
  // og:image 썸네일(post[ID]_thumb.svg)은 메타데이터에만 사용하고 본문에는 실제 포스터를 삽입
  { type: 'image', src: '/images/post[ID]_poster.jpg', alt: '[영화명] 공식 포스터', caption: '출처: 네이버 영화' },

  // 3. 목차 (자동 생성)
  { type: 'toc' },

  // 4. 첫 번째 h2 + body
  { type: 'h2', id: 'section1', text: '[핵심 추천 이유 또는 감상 포인트]', gradientStyle: 'linear-gradient(...)' },
  { type: 'body', html: '...' },

  // 5. 광고 (첫 h2/body 뒤 첫 광고)
  { type: 'ad', slot: '6297515693', format: 'auto' },

  // 6. 본문 항목들 (h2 + body + 필요시 image)
  { type: 'h2', id: 'section2', text: '[장르/분위기/감정선]', gradientStyle: 'linear-gradient(...)' },
  { type: 'body', html: '...' },
  // { type: 'image', ... },  // 필요시 1장

  { type: 'h2', id: 'section3', text: '[비슷한 작품 비교]', gradientStyle: 'linear-gradient(...)' },
  { type: 'body', html: '...' },

  // 7. 중간 광고 (2~3개 h2마다)
  { type: 'ad', slot: '6297515693', format: 'auto' },

  { type: 'h2', id: 'section4', text: '[이런 사람에게는 안 맞을 수 있음]', gradientStyle: 'linear-gradient(...)' },
  { type: 'body', html: '...' },

  // 8. ending — 관련 작품/포스팅 내부 링크
  { type: 'ending', html: '...<a href="/slug/">...</a>...' },

  // 9. 마지막 광고
  { type: 'ad', slot: '6297515693', format: 'auto' },
]
```

---

## intro 작성 규칙

```html
<!-- 감정적 도입 (1~2문단) — "이번 포스팅에서는" 절대 금지 -->
<p>[감상/경험 기반 도입. 예: "이 영화를 보고 나서 한동안 멍했다."]</p>

<!-- 한 줄 결론 -->
<p><strong>한 줄 결론:</strong> [핵심 판단 1~2줄]</p>

<!-- 이런 사람에게 맞는 작품 박스 -->
<div style="background:rgba(229,9,20,0.05);border-left:3px solid #e50914;padding:14px 18px;border-radius:8px;margin:16px 0">
  <strong>이런 사람에게 추천</strong>
  <ul style="margin:8px 0 0;padding-left:20px">
    <li>[취향/상황 1]</li>
    <li>[취향/상황 2]</li>
    <li>[취향/상황 3]</li>
  </ul>
</div>

<!-- 스포일러 안내 (해당 시) -->
<p style="font-size:13px;color:#888;margin-top:12px">
  ※ 이 글은 [스포일러 없음 / 일부 스포일러 포함 / 결말 스포일러 포함]입니다.
</p>
```

---

## 유형별 템플릿

### A. 추천형 ("이번 달 넷플릭스 뭐 볼까?")

```
intro: 감정적 도입 + 전체 라인업 요약
image: 작품 포스터 (네이버 크롤링, 각 작품마다 1장씩)
toc
h2: [가장 기대되는 작품 TOP 3]
body: 각 작품별 추천 이유 + 호불호
image: 각 추천 작품 포스터 (네이버)
ad
h2: [장르별 추천 — 취향저격 신작 찾기]
body: 로맨스/액션/스릴러/가족 등 분류
h2: [퇴장 예정작 — 놓치면 후회할 작품]
body: 라이선스 만료 목록
ad
h2: [OTT 꿀팁 — 숨겨진 기능 활용법]
body: 활용 가이드
ending: 다음 편 예고 + 관련 포스팅
ad
```

### B. 리뷰형 ("이 영화 볼만해?")

```
intro: 감상 도입 + 한 줄 결론 + 추천 대상 박스
image: 영화 공식 포스터 (네이버 크롤링, caption: '출처: 네이버 영화')
toc
h2: [이 작품의 핵심 매력]
body: 감상 포인트, 몰입도, 연출력
ad
h2: [이 장면에서 소름 돋았다 — 명장면 포인트]
body: (스포일러 경고 후) 핵심 장면 해석
image: 스틸컷 1~2장 (네이버 크롤링, caption: 'ⓒ 네이버 영화')
h2: [해외 반응은? — 로튼토마토·IMDB 평점]
body: 평점 데이터 + 해외 리뷰 요약
ad
h2: [이런 사람에게는 안 맞을 수 있다]
body: 호불호 포인트
h2: [비슷한 작품 — 이것도 좋아할 겁니다]
body: 유사 작품 2~3개
ending: 종합 판단 + 관련 포스팅
ad
```

### C. 결말 해석형

```
intro: "시즌 마지막 화 보고 멍했다" 식 도입 + 스포일러 경고
image: 영화/드라마 포스터 (네이버 크롤링, caption: '출처: 네이버 영화')
toc
h2: [결말 요약 — 무슨 일이 벌어졌나]
body: 핵심 사건 정리 (스포일러)
image: 핵심 장면 스틸컷 (네이버 크롤링)
ad
h2: [놓치기 쉬운 복선 — 이 장면 기억나세요?]
body: 복선/떡밥 해석
h2: [감독/원작이 말하려는 것]
body: 주제 해석
ad
h2: [다음 시즌 예측 — 남은 떡밥 정리]
body: 후속작 가능성
ending: 시리즈 내 다른 포스팅 링크
ad
```

### D. OTT 비교형

```
intro: 상황별 고민 도입 + 한 줄 결론
image: 인포그래픽 SVG 또는 대표 이미지
toc
h2: [한눈에 보는 비교표]
body: <table> 가격/콘텐츠/화질/동접 비교
ad
h2: [혼자 본다면 — A 플랫폼 추천]
body: 상황별 해설
h2: [가족이라면 — B 플랫폼 추천]
body: 상황별 해설
ad
h2: [요금 아끼는 꿀팁]
body: 할인/결합/가족 계정
ending: 관련 포스팅
ad
```

---

## 비교표 작성 규칙 (OTT 비교, 작품 비교 등)

```html
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <thead>
    <tr style="border-bottom:2px solid #ddd;background:rgba(229,9,20,0.04)">
      <th style="text-align:left;padding:10px 8px">항목</th>
      <th style="text-align:left;padding:10px 8px">A</th>
      <th style="text-align:left;padding:10px 8px">B</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 8px">...</td>
      ...
    </tr>
  </tbody>
</table>
<p style="font-size:12px;color:#999;margin-top:8px">
  ※ [기준일], [출처] 명시
</p>
```

---

## CTA 위치 규칙

- ✅ h2 제목 + body 설명 이후 배치
- ✅ 결론/판단 이후 배치
- ❌ TOC 바로 앞 배치 금지
- ❌ intro 섹션 안에 CTA 금지
- ❌ 광고 바로 앞뒤에 CTA 연속 배치 금지

---

## 이미지 규칙

### 역할 분리
- **og:image 썸네일** (`post{ID}_thumb.svg`): 메타데이터(`thumbnail` 필드)에만 사용. 본문에 삽입하지 않아도 됨.
- **본문 이미지**: 네이버에서 크롤링한 실제 포스터/스틸컷. `scripts/crawl_movie_images.py` 활용.

### 이미지 삽입 예시
```js
// 포스터 (필수)
{ type: 'image', src: '/images/post[ID]_poster.jpg', alt: '[영화명] 공식 포스터 (연도)', caption: '출처: 네이버 영화' },

// 스틸컷 (리뷰/해석형에서 선택)
{ type: 'image', src: '/images/post[ID]_still1.jpg', alt: '[영화명] [장면 설명]', caption: 'ⓒ 네이버 영화' },
```

### 유형별 수량
| 글 유형 | 본문 이미지 수 |
|---|---|
| 단일 리뷰/해석 | 포스터 1 + 스틸컷 1~2 = 2~3장 |
| TOP N 추천 | 각 작품 포스터 1장씩 |
| OTT/비교 | 주요 작품 포스터 2~3장 |

---

## 내부 링크 규칙

- slug 기반 링크 사용: `href="/bridgerton-season4-ending-review/"`
- data/posts.js에서 실존 여부 확인 후 사용
- 존재하지 않는 slug 사용 금지
- ending 섹션에 3~5개 관련 글 링크 필수
- 같은 시리즈(series 필드) 내 포스트는 상호 참조
