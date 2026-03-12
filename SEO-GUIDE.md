# SEO 구조 변경 + 자동 포스팅 설정 가이드

## 1. SEO Slug 구조 변경

### 변경 내용
- **기존 포스팅**: 숫자 slug 유지 (`/16/`, `/41/` 등)
- **신규 포스팅부터**: 키워드 기반 영문 slug 사용

### 예시
```
기존: car.ambitstock.com/16/
신규: car.ambitstock.com/direct-car-insurance-comparison-2026/
```

### Slug 작성 규칙
- 영문 소문자 + 하이픈 (no 한글, no 언더스코어)
- 3~6단어, 핵심 키워드 포함
- 연도 포함 권장 (갱신 인식)
- 예: `tesla-insurance-cost-2026`, `ev-subsidy-guide-korea-2026`

### 왜 좋은가
- 구글이 URL에서 키워드를 인식 → 검색 순위에 긍정적 영향
- 사용자가 URL만 보고 내용 유추 가능 → CTR 향상
- 소셜 공유 시 전문적인 인상

### 코드 변경 불필요
현재 `[slug].js`가 이미 문자열 slug를 지원하므로, `data/posts.js`에 slug만 영문으로 입력하면 자동으로 작동합니다.

---

## 2. 새 포스팅 (ID 42)

**URL**: `/direct-car-insurance-comparison-2026/`  
**제목**: 다이렉트 자동차보험 비교 견적 2026 | 6개사 보험료·보상 완전 분석  
**타겟 키워드**: 다이렉트 자동차보험, 자동차보험 비교견적, 보험료 절약  
**예상 CPC**: 높음 (자동차보험 키워드 — 애드센스 고단가)

---

## 3. 자동 포스팅 시스템 (auto-post.sh)

### 동작 방식
1. Claude Code CLI를 호출하여 20개 포스팅 생성
2. posts/*.js 파일 + data/posts.js + sitemap.xml 자동 업데이트
3. node --check로 모든 파일 구문 검증
4. git commit + push (Vercel 자동 배포)

### 설정 방법

#### 1) Claude Code CLI 설치
```bash
npm install -g @anthropic-ai/claude-code
claude login   # Max 계정으로 로그인
```

#### 2) 스크립트 확인
```bash
cd /path/to/carRecommend-main
chmod +x auto-post.sh
./auto-post.sh   # 수동 테스트
```

#### 3) Cron 등록 (1시간마다)
```bash
crontab -e

# 매시 정각에 실행
0 * * * * cd /path/to/carRecommend-main && ./auto-post.sh >> /tmp/auto-post.log 2>&1
```

#### 4) 로그 확인
```bash
tail -f /tmp/auto-post.log
```

### 주의사항
- Claude Code Max 계정 필요 (API 호출이 아닌 Max 구독 내 사용)
- git remote + credentials 설정 완료 필요
- 첫 실행 시 수동으로 테스트 후 cron 등록 권장
- 네트워크 또는 Claude Code 오류 시 git push 안 됨 (검증 통과해야 push)

### 커스터마이징
- `POSTS_PER_RUN=20` → 한 번에 생성할 포스팅 수 조정
- 프롬프트 내 주제 목록 수정으로 원하는 키워드 방향 조절 가능
- gradientStyle 컬러 변경 등도 프롬프트에서 조정

---

## 4. alt/caption 현황

전수조사 결과: **138개 이미지 전부 alt + caption 있음** ✅
추가 작업 불필요.
