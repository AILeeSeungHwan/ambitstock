# 실행 프롬프트 — ambitstock.com 고도화

> 이 프롬프트를 Claude Code에 붙여넣어 실행한다.
> 사전 준비: CLAUDE.md, RULE.md, SKILL.md, POST_TEMPLATE.md, CONTENT_GRADING.md, PROGRESS.md를 프로젝트 루트에 배치한 상태여야 한다.

---

아래 문서를 순서대로 읽어라:
1. CLAUDE.md
2. PROGRESS.md
3. RULE.md

읽은 뒤 PROGRESS.md의 Phase 2(버그 수정 + 기반 정비)부터 순서대로 진행해라.

## Phase 2 작업 내용

### 2-1. auto-post.sh 키워드 그룹 교체
- 현재 자동차/보험 키워드 그룹이 그대로 남아있다.
- CLAUDE.md §13(고단가 키워드 전략)을 참고해서 영화/OTT 키워드 그룹으로 전면 교체해라.
- 네이버 데이터랩 API 키워드 그룹도 영화용으로 바꿔라.
- 환경변수(NAVER_DATALAB_CLIENT_ID, NAVER_DATALAB_CLIENT_SECRET)는 절대 하드코딩하지 마라.

### 2-2. convert_v2.py 수정
- `BASE_URL = 'https://car.ambitstock.com'`을 `'https://ambitstock.com'`으로 수정
- 티스토리 `/entry/` 경로 크롤링 로직이 동작하는지 확인

### 2-3. SEO-GUIDE.md 재작성
- 자동차 사이트 잔재 전부 제거 (다이렉트보험, 포스팅 ID 42 등)
- 영화 사이트용으로 재작성 (slug 규칙, 자동 포스팅 가이드)
- CLAUDE.md §15(URL 구조)와 일관성 유지

### 2-4. 네이버 데이터랩 영화 트렌드 키워드 설계
- auto-post.sh 안의 keywordGroups를 아래 영역으로 교체:
  - OTT 플랫폼: 넷플릭스, 디즈니플러스, 티빙, 쿠팡플레이, 웨이브
  - 추천 일반: 영화추천, 드라마추천, 애니추천, 볼만한영화
  - 장르: 스릴러영화, 로맨스드라마, 가족영화, 액션영화, 공포영화
  - 작품성: 이동진추천, 로튼토마토, IMDB평점, 해외반응
  - OTT 운영: 넷플릭스요금제, 넷플릭스할인, OTT비교
- CPC 티어 매핑도 CLAUDE.md §13 기준으로 재설정

## Phase 2 완료 조건
- `node --check` 전체 PASS
- auto-post.sh에 자동차/보험 키워드 잔재 없음
- convert_v2.py BASE_URL이 ambitstock.com
- SEO-GUIDE.md에 자동차 잔재 없음
- PROGRESS.md 업데이트

## Phase 2 완료 후
- PROGRESS.md를 업데이트하고
- Phase 3(기존 티스토리 이관) 준비 사항을 정리해라
- 커밋 메시지를 제안해라

---

## 참고: 이관 작업은 Phase 3에서 별도로 진행한다

Phase 3 시작 시 아래를 실행할 예정이니 지금은 Phase 2에만 집중해라:
1. ambitstock.com 기존 /entry/ URL 전체 수집
2. URL 매핑 테이블 생성 (MIGRATION_MAP.md)
3. next.config.js 301 리다이렉트 설정
4. 우선 이관 30개 (검색 트래픽 상위)
5. convert_v2.py로 변환 + CLAUDE.md 품질 기준 검수
