# SEO 구조 + 자동 포스팅 설정 가이드 — ambitstock.com

> 마지막 업데이트: 2026-03-13
> 프로젝트: ambitstock.com ("R의 필름공장")

---

## 1. SEO Slug 구조

### 방침
- **기존 포스팅 (Phase 0 생성분)**: 숫자 slug 유지 (`/1/`, `/2/`, ..., `/50/`)
- **신규 포스팅**: 키워드 기반 영문 slug 사용

### 예시
```
기존: ambitstock.com/16/
신규: ambitstock.com/netflix-thriller-recommendation-2026/
```

### Slug 작성 규칙
- 영문 소문자 + 하이픈 (한글, 언더스코어, 특수문자 금지)
- 3~6단어, 핵심 키워드 포함
- 연도 포함 권장 (콘텐츠 신선도 인식)
- 예: `netflix-thriller-recommendation-2026`, `marvel-phase6-viewing-order`, `studio-ghibli-best-animation-guide`

### 왜 좋은가
- 구글이 URL에서 키워드를 인식 → 검색 순위에 긍정적 영향
- 사용자가 URL만 보고 내용 유추 가능 → CTR 향상
- 소셜 공유 시 전문적인 인상

### 코드 변경 불필요
현재 `[slug].js`가 이미 문자열 slug를 지원하므로, `data/posts.js`에 slug 값을 영문으로 입력하면 자동으로 작동한다.

---

## 2. URL 구조

### 도메인 및 경로
```
도메인:    ambitstock.com
포스트:    ambitstock.com/[slug]/
```

### 카테고리 (허용)
| 카테고리 | 설명 |
|---|---|
| 영화추천 | 장르별·취향별·상황별·OTT별 추천 |
| 드라마 | 국내외 드라마 추천·결말 해석·시리즈 가이드 |
| 해외반응후기 | 해외 반응 정리, 로튼토마토·IMDB 기반 분석 |
| 마블 | MCU 시청 순서, 작품 해석, 페이즈 가이드 |
| 애니메이션 | 지브리·넷플릭스 애니·입문 가이드 |

### 기존 티스토리 URL 처리
- 기존 색인된 URL: `ambitstock.com/entry/한글-슬러그`
- 신규 Next.js URL: `ambitstock.com/영문-seo-slug/`
- 301 리다이렉트 설정: `next.config.js`의 `/entry/:path*` 규칙 (Phase 3에서 설정 예정)
- 색인된 URL을 잃으면 검색 순위 손실 → 이관 시 리다이렉트 필수

---

## 3. 자동 포스팅 시스템 (auto-post.sh)

### 동작 방식
1. Claude Code CLI를 호출하여 포스팅 생성
2. `posts/*.js` 파일 + `data/posts.js` + `sitemap.xml` 자동 업데이트
3. `node --check`로 모든 파일 구문 검증
4. git commit + push → Vercel 자동 배포

### 키워드 그룹 (영화/OTT 전용)
| 그룹 | 예시 키워드 | CPC 등급 |
|---|---|---|
| OTT 플랫폼 | 넷플릭스 구독, 디즈니플러스 요금제, OTT 비교 | 고단가 |
| 추천 일반 | 영화 추천, 드라마 추천, 오늘 뭐 볼까 | 중단가 |
| 장르 | 스릴러 영화 추천, 로맨스 드라마 추천 | 중단가 |
| 작품성 | 결말 해석, 숨겨진 복선, 시즌 리뷰 | 저~중단가 |
| OTT 운영 | 넷플릭스 종료 예정작, 신작 정리 | 중단가 |

### CPC 전략
| 티어 | 키워드 | 이유 |
|---|---|---|
| 고단가 | 넷플릭스 구독, OTT 비교, VOD 가격 | 구독 서비스 광고 |
| 중단가 | 영화 추천, 드라마 추천, 넷플릭스 신작 | 엔터테인먼트 광고 |
| 저단가 | 영화 후기, 평점, 줄거리, 해외 반응 | 정보성 콘텐츠 |

### 설정 방법

#### 1) Claude Code CLI 설치
```bash
npm install -g @anthropic-ai/claude-code
claude login   # Max 계정으로 로그인
```

#### 2) 스크립트 확인
```bash
cd /path/to/ambitstock
chmod +x auto-post.sh
./auto-post.sh   # 수동 테스트
```

#### 3) Cron 등록 (매시간 실행)
```bash
crontab -e

# 매시 정각에 실행
0 * * * * cd /path/to/ambitstock && ./auto-post.sh >> /tmp/auto-post.log 2>&1
```

#### 4) 로그 확인
```bash
tail -f /tmp/auto-post.log
```

### 주의사항
- Claude Code Max 계정 필요 (API 호출이 아닌 Max 구독 내 사용)
- git remote + credentials 설정 완료 필요
- 첫 실행 시 수동으로 테스트 후 cron 등록 권장
- 네트워크 또는 Claude Code 오류 시 git push 안 됨 (구문 검증 통과해야 push)
- 프로젝트 경로: `/path/to/ambitstock`

### 커스터마이징
- `POSTS_PER_RUN=20` → 한 번에 생성할 포스팅 수 조정
- 프롬프트 내 키워드 목록 수정으로 주제 방향 조절 가능
- gradientStyle 컬러·카테고리 등도 프롬프트에서 조정

---

## 4. alt/caption 현황

전수조사 결과: **138개 이미지 전부 alt + caption 있음** ✅
추가 작업 불필요.
