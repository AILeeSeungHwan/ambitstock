# CLAUDE.md — ambitstock.com (R의 필름공장) Next.js 이전 + 자동 포스팅

> 마지막 업데이트: 2026-03-12
> 이 문서는 Claude Code 에이전트가 프로젝트를 셋업하고 포스팅을 생성할 때 따라야 하는 규칙입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 원본 사이트 | ambitstock.com (티스토리, "R의 필름공장") |
| 이전 대상 | Next.js + Vercel + GitHub |
| 컨텐츠 영역 | 영화, 드라마, 애니메이션 추천·리뷰·해외반응·평점 |
| 수익 | Google AdSense + Coupang Partners |
| 기존 포스팅 | 약 424개 |
| 참고 프로젝트 | car.ambitstock.com (동일 구조, 자동차/보험 블로그) |

---

## 2. 사이트 구조 (car.ambitstock.com에서 복제)

car.ambitstock.com의 Next.js 프로젝트를 그대로 복사한 뒤 컨텐츠 영역만 변경합니다.

### 복제할 것
- Layout.js (테마 22종 + 폰트 5종 + 애니메이션 14종)
- PostCard.js (FeaturedCard + ListCard)
- [slug].js (포스팅 상세 — TOC, 관련포스팅, JSON-LD)
- index.js (메인 — Featured + 리스트 + 사이드바)
- PageTracker.js (referrer 트래킹)
- AdUnit.js (AdSense)
- adminLee/ (통계 + 키워드 관리)
- next.config.js, package.json, _document.js

### 변경할 것
- 사이트명: "R의 필름공장" (또는 새 이름)
- 로고 이모지: 🎬 (기존 🚗)
- primary 색상: 영화 느낌 (예: #e50914 넷플릭스 레드 또는 #6366f1 인디고)
- 카테고리: 영화추천, 해외반응후기, 마블, 드라마, 애니메이션
- data/posts.js: 이전한 포스팅 메타데이터
- posts/: 이전한 포스팅 본문

---

## 3. URL 구조 (티스토리 원본 유지)

### 티스토리 원본 형식
```
https://ambitstock.com/entry/한글-제목-슬러그
```

### Next.js 변환 형식
```
https://ambitstock.com/한글-또는-영문-seo-slug/
```

### slug 규칙 (신규 포스팅)
- 영문 소문자 + 하이픈, 3~8단어
- 핵심 키워드 포함
- 예: `bridgerton-season4-ending-review`, `netflix-movie-recommend-2026-march`

### slug 규칙 (기존 이전)
- 티스토리 entry 경로에서 한글 슬러그 추출
- 가능하면 영문 SEO slug로 변환
- 너무 긴 한글 슬러그는 핵심만 추출하여 영문화

---

## 4. 포스팅 이전 절차

### Step 1: 크롤링
```
1. ambitstock.com 메인에서 전체 포스팅 URL 수집
2. 각 포스팅 페이지 fetch → 제목, h2/h3 구조, 이미지, 본문 추출
3. 카테고리, 태그, 날짜 추출
```

### Step 2: 변환
```
1. HTML → sections 배열 변환 (car.ambitstock.com 형식)
   - h2 → { type: 'h2', id, text, gradientStyle }
   - 본문 → { type: 'body', html }
   - 이미지 → { type: 'image', src, alt, caption }
2. 대표이미지 → 새로 생성 (아래 이미지 규칙 참고)
3. data/posts.js에 메타데이터 추가
4. node --check 검증
```

### Step 3: 이미지 처리
- 기존 티스토리 이미지는 CDN URL → public/images/로 다운로드
- 대표이미지(썸네일)는 새로 생성 (아래 규칙)

---

## 5. 이미지 생성 규칙 (핵심)

### 썸네일/대표이미지 스타일
첨부파일 예시처럼 **명료한 배경 + 큰 텍스트** 형식:

```
┌─────────────────────────────┐
│                             │
│     [명료한 단색/그라디언트 배경]      │
│                             │
│       큰 제목 텍스트           │
│       (흰색 또는 노란색)        │
│                             │
│       부제목/키워드            │
│       (작은 텍스트)            │
│                             │
└─────────────────────────────┘
```

### 이미지 생성 방식 (SVG → PNG 또는 HTML Canvas)
```javascript
// 예시: SVG 기반 이미지 생성
const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1a73e8"/>
  <text x="600" y="260" text-anchor="middle"
    font-size="64" font-weight="900" fill="white"
    font-family="Pretendard, sans-serif">
    브리저튼 시즌4
  </text>
  <text x="600" y="340" text-anchor="middle"
    font-size="42" font-weight="700" fill="#FFD700"
    font-family="Pretendard, sans-serif">
    결말 해석 총정리
  </text>
  <text x="600" y="420" text-anchor="middle"
    font-size="28" fill="rgba(255,255,255,0.7)"
    font-family="Pretendard, sans-serif">
    2026 넷플릭스 시리즈 추천
  </text>
</svg>
`
```

### 배경색 팔레트 (카테고리별)
| 카테고리 | 배경색 | 텍스트색 |
|---|---|---|
| 영화 추천 | #1a73e8 (파랑) | 흰색 + 노랑 강조 |
| 해외반응/후기 | #e53935 (빨강) | 흰색 |
| 마블 | #1a1a2e (다크네이비) | 흰색 + 골드 |
| 드라마 | #6a1b9a (보라) | 흰색 + 하늘색 |
| 애니메이션 | #00897b (틸) | 흰색 + 노랑 |
| 넷플릭스 | #e50914 (넷레드) | 흰색 |

### 규칙
- 텍스트는 크게, 최대 3줄 (제목 + 부제 + 출처/연도)
- 배경은 명료한 단색 또는 2색 그라디언트만
- 복잡한 사진/일러스트 절대 금지 — 텍스트 가독성 최우선
- 이미지 크기: 1200x630 (OG 이미지 표준)

### 본문 내부 이미지
- 기존 프로젝트(car.ambitstock.com)의 public/images/에 있는 이미지 중 연관된 것 재사용
- 없으면 동일한 SVG 스타일로 소제목별 이미지 생성
- alt, caption 반드시 작성 (SEO)

---

## 6. 콘텐츠 품질 기준

### 절대 원칙 (E-E-A-T)
1. **개인적 감상/의견 필수** — "이 장면에서 소름이 돋았다", "솔직히 기대 이하였다" 등
2. **경험 기반 서술** — "극장에서 직접 봤는데", "넷플릭스에서 3번 정주행한 입장에서"
3. **감정적 도입부** — "이 영화를 보고 나서 한동안 멍했다", "정말 오랜만에 극장을 나오면서 박수를 쳤다"
4. **구체적 데이터** — 로튼토마토 평점, IMDB 점수, 국내 관객수, 넷플릭스 순위 등
5. **독자 상황별 추천** — "데이트 영화로", "가족과 함께", "혼자 밤에 몰입하고 싶다면"

### 글의 톤
- 영화 좋아하는 친구가 카톡으로 추천해주는 느낌
- 스포일러 경고 명시 후 핵심 해석
- "이건 꼭 봐야 합니다" 식의 자신감 있는 추천
- 반대 의견도 인정 ("호불호가 갈릴 수 있지만")

### 포스팅 구조
```
intro (2~3문단, 감정적 도입 + 핵심 정보)
→ image (대표이미지, SVG 생성)
→ toc (목차)
→ [h2 + body] × 4~7 (본문 섹션)
→ ad (중간 광고 1~2개)
→ cta (관련 포스팅 링크)
→ ending (마무리 + 추천 한줄)
→ ad (하단 광고)
```

### 금지 사항
- "이번 포스팅에서는 ~에 대해 알아보겠습니다" (기계적 서론)
- 스포일러 없는 줄거리만 나열
- 빈 body 섹션
- h2 연속 (body 없이)
- 1500자 미만 얇은 포스팅
- 저작권 이미지 직접 사용 (영화 포스터 등은 설명 텍스트로 대체)

---

## 7. 시리즈물 기획

### 시리즈 예시
```
시리즈: netflix-2026-spring (2026 봄 넷플릭스 총정리)
├── 1편: 2026년 3월 넷플릭스 신작 총정리
├── 2편: 브리저튼 시즌4 결말 해석
├── 3편: 오징어게임3 해외 반응
├── 4편: 넷플릭스 한국 드라마 역대 시청률 TOP 10
└── 5편: 넷플릭스 구독 요금제 비교 2026

시리즈: marvel-complete (마블 완전정복)
├── 1편: 마블 영화 개봉 예정 2025~2027
├── 2편: 어벤져스 둠스데이 완벽정리
├── 3편: MCU 페이즈 6 타임라인 정리
├── 4편: 마블 영화 평점순 TOP 20
└── 5편: 마블 초보 입문 가이드 — 뭐부터 봐야 할까?
```

### 시리즈 간 연결
- intro에서 "지난 편에서 다룬 ~에 이어"
- ending에서 "다음 편 예고"
- CTA로 이전/다음편 링크
- relatedSlugs에 시리즈 포스팅 상호 참조

---

## 8. 고단가 키워드 전략

| 티어 | 키워드 | 이유 |
|---|---|---|
| 🔴 고단가 | 넷플릭스 구독, OTT 비교, 영화 다운로드, VOD 가격 | 구독 서비스 광고 |
| 🟡 중단가 | 영화 추천, 드라마 추천, 넷플릭스 추천, 개봉 영화 | 엔터 광고 |
| 🟢 저단가 | 영화 후기, 평점, 줄거리, 해외 반응 | 정보성 |

고단가 키워드를 자연스럽게 포함하되, 포스팅 제목과 h2에 배치.

---

## 9. JS 안전 규칙 (CRITICAL)

1. html 문자열 안 따옴표: `&quot;` 또는 `&#39;` 사용
2. JS 문자열 안 실제 줄바꿈 금지 — 한 줄로 작성
3. 파일 생성 후 반드시 `node --check posts/[id].js` 실행
4. data/posts.js 수정 후 `node --check data/posts.js` 실행

---

## 10. Git 규칙

- 커밋: `[auto]: N개 포스팅 생성 (시리즈: xxx)`
- posts/ + data/posts.js + public/sitemap.xml + public/images/ 함께 커밋
- `git push origin main`

---

## 11. 섹션 타입 (posts/XX.js)

| type | 설명 | 필수 필드 |
|---|---|---|
| intro | 인트로 (감정적 도입) | html |
| toc | 목차 자동생성 | (없음) |
| ad | AdSense 광고 | slot: '6297515693', format: 'auto' |
| h2 | 소제목 (그라디언트) | id, text, gradientStyle |
| body | 본문 단락 | html (최소 200자) |
| image | 이미지 | src, alt, caption |
| cta | 버튼 링크 | href, text |
| ending | 마무리 (배경 강조) | html |

---

## 12. AdSense 광고 배치

- 본문 중간: slot '6297515693' (h2 2~3개마다 1개)
- 마무리 뒤: 하단 광고 1개
- 총 2~3개/포스팅

---

## 13. 테마 시스템 (car.ambitstock.com 동일)

Layout.js: 22개 테마 + 5개 폰트 + 14종 애니메이션
- primary 색상만 변경 (영화 사이트에 맞게)

---

## 14. 실행 가이드 (Claude Code)

### 프로젝트 셋업 (1회)
```
1. car.ambitstock.com 프로젝트 복사
2. 사이트명, primary 색상, 카테고리 변경
3. 기존 포스팅 크롤링 + 이전
4. Vercel 배포 + DNS 설정
```

### 포스팅 생성 (반복)
```
1. CLAUDE.md 읽기
2. 기존 포스팅 확인 (중복 방지)
3. 시리즈 기획 → 키워드 선정
4. 포스팅 파일 생성 (posts/[id].js)
5. 대표이미지 SVG 생성 (public/images/)
6. data/posts.js 업데이트
7. sitemap.xml 업데이트
8. node --check 검증
9. git add + commit + push
```
