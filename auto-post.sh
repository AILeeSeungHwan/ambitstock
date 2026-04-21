#!/bin/bash
# ============================================================
# auto-post.sh — 네이버 트렌드 기반 자동 포스팅 파이프라인
#
# 파이프라인:
#   1. 네이버 DataLab API → 영화/OTT 트렌드 키워드 수집
#   2. 애드센스 CPC 단가 매핑 (고단가 우선 정렬)
#   3. 기존 포스팅과 중복 제거
#   4. Claude Code로 포스팅 생성
#   5. 생성 로그 기록 (auto-post-log.json)
#   6. git commit + push → Vercel 자동 배포
#
# cron 등록:
#   0 * * * * cd /path/to/project && ./auto-post.sh >> /tmp/auto-post.log 2>&1
#
# 요구사항:
#   - Claude Code CLI (claude) + Max 계정 로그인
#   - Node.js, curl, jq
#   - git remote + credentials 설정 완료
#   - 네이버 개발자센터 Client ID/Secret (환경변수)
# ============================================================

set -e

# ─── 설정 ───
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
POSTS_PER_RUN=2          # 1순위: OTT 구독/비교/요금제 고단가 포스팅 2개씩
LOG_PREFIX="[auto-post $(date '+%Y-%m-%d %H:%M')]"
TODAY=$(date '+%Y-%m-%d')
LOG_FILE="$PROJECT_DIR/data/auto-post-log.json"

# 네이버 DataLab API 키 (환경변수로 주입)
NAVER_CLIENT_ID="${NAVER_CLIENT_ID:-YOUR_CLIENT_ID}"
NAVER_CLIENT_SECRET="${NAVER_CLIENT_SECRET:-YOUR_CLIENT_SECRET}"

cd "$PROJECT_DIR"
echo "$LOG_PREFIX ═══ 파이프라인 시작 ═══"

# ═══════════════════════════════════════════
# STEP 1: 네이버 트렌드 키워드 수집
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [1/6] 네이버 트렌드 키워드 수집..."

# 트렌드 검색 키워드 그룹 (영화/OTT 영역)
TREND_KEYWORDS_FILE=$(mktemp)

node << 'STEP1' > "$TREND_KEYWORDS_FILE"
const https = require('https');

const CLIENT_ID = process.env.NAVER_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

// 네이버 DataLab 검색어 트렌드 API
// 1순위: OTT 구독/비교/요금제 — RPM $1~3 고단가 키워드 우선
const keywordGroups = [
  { groupName: 'OTT구독비교', keywords: ['넷플릭스요금제', '넷플릭스구독', 'OTT비교', 'OTT구독', '디즈니플러스요금제'] },
  { groupName: 'OTT할인정보', keywords: ['넷플릭스할인', '티빙요금제', '쿠팡플레이요금제', '웨이브요금제', 'OTT할인'] },
  { groupName: 'OTT신작정리', keywords: ['넷플릭스신작', '이번주넷플릭스', '이번달넷플릭스', 'OTT신작', '넷플릭스추천'] },
  { groupName: 'OTT가이드', keywords: ['넷플릭스해지방법', '넷플릭스계정공유', '티빙해지', 'OTT추천', '어떤OTT'] },
  { groupName: '트렌드추천', keywords: ['영화추천', '드라마추천', '볼만한영화', '넷플릭스드라마'] },
];

const endDate = new Date().toISOString().slice(0, 10);
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const body = JSON.stringify({
  startDate, endDate, timeUnit: 'week',
  keywordGroups: keywordGroups.map(g => ({ groupName: g.groupName, keywords: g.keywords })),
});

if (CLIENT_ID === 'YOUR_CLIENT_ID') {
  // API 키 없으면 1순위 OTT 고단가 키워드 fallback (2개 선택)
  console.log(JSON.stringify({
    source: 'fallback',
    keywords: [
      { keyword: '넷플릭스 요금제 비교 2026 — 광고있는 베이식부터 프리미엄까지 어떤 게 맞나', trend: 95, cpcTier: 'high' },
      { keyword: 'OTT 구독 비교 2026 — 넷플릭스·티빙·디즈니+·쿠팡플레이 요금제·콘텐츠 완전 정리', trend: 92, cpcTier: 'high' },
      { keyword: '디즈니플러스 요금제 2026 — 광고형·스탠다드·프리미엄 가격·혜택 비교', trend: 88, cpcTier: 'high' },
      { keyword: '넷플릭스 계정 공유 2026 — 추가 회원 요금제 정책 완전 정리', trend: 85, cpcTier: 'high' },
      { keyword: '티빙 요금제 비교 2026 — 베이식·스탠다드·프리미엄 차이', trend: 82, cpcTier: 'high' },
      { keyword: '쿠팡플레이 vs 웨이브 2026 — 어떤 OTT가 더 낫나 취향별 비교', trend: 78, cpcTier: 'high' },
      { keyword: '넷플릭스 해지 방법 2026 — 언제 끊고 언제 다시 구독해야 하나', trend: 74, cpcTier: 'high' },
      { keyword: 'OTT 최저 구독 비용 2026 — 세 플랫폼 같이 구독하는 법', trend: 70, cpcTier: 'high' },
    ]
  }));
  process.exit(0);
}

const options = {
  hostname: 'openapi.naver.com',
  path: '/v1/datalab/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Naver-Client-Id': CLIENT_ID,
    'X-Naver-Client-Secret': CLIENT_SECRET,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      const trends = (result.results || []).map(r => ({
        keyword: r.title,
        trend: Math.round(r.data?.[r.data.length - 1]?.ratio || 0),
      })).sort((a, b) => b.trend - a.trend);

      // CPC 티어 매핑
      const highCpc = ['OTT구독', 'OTT비교', '넷플릭스요금제', '디즈니플러스요금제', '할인'];
      const medCpc = ['영화추천', '드라마추천', '넷플릭스추천', '애니추천'];

      const withCpc = trends.map(t => {
        let cpcTier = 'low';
        if (highCpc.some(k => t.keyword.includes(k))) cpcTier = 'high';
        else if (medCpc.some(k => t.keyword.includes(k))) cpcTier = 'medium';
        return { ...t, cpcTier };
      });

      // 고단가 우선 정렬
      const tierOrder = { high: 0, medium: 1, low: 2 };
      withCpc.sort((a, b) => tierOrder[a.cpcTier] - tierOrder[b.cpcTier] || b.trend - a.trend);

      console.log(JSON.stringify({ source: 'naver_datalab', keywords: withCpc }));
    } catch (e) {
      console.log(JSON.stringify({ source: 'error', keywords: [], error: e.message }));
    }
  });
});
req.write(body);
req.end();
STEP1

echo "$LOG_PREFIX 트렌드 키워드 수집 완료"

# ═══════════════════════════════════════════
# STEP 2: CPC 매핑 + 중복 제거
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [2/6] CPC 매핑 + 기존 포스팅 중복 제거..."

# 요약 파일 갱신 (최신 상태 반영)
node scripts/update-posts-summary.js

FILTERED_KEYWORDS_FILE=$(mktemp)

node << STEP2 > "$FILTERED_KEYWORDS_FILE"
const fs = require('fs');
const trendData = JSON.parse(fs.readFileSync('$TREND_KEYWORDS_FILE', 'utf-8'));
// posts-summary.json 사용 (posts.js 전체 로드 대신 경량 요약)
const summary = JSON.parse(fs.readFileSync('./data/posts-summary.json', 'utf-8'));

// 기존 포스팅 제목으로 중복 확인
const existingTexts = summary.allTitles.map(t => t.toLowerCase());

// 중복 필터: 기존 포스팅과 80% 이상 겹치는 키워드 제거
const filtered = (trendData.keywords || []).filter(kw => {
  const kwLower = kw.keyword.toLowerCase();
  const isDuplicate = existingTexts.some(text => {
    const words = kwLower.replace(/[^가-힣a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 1);
    const matchCount = words.filter(w => text.includes(w)).length;
    return words.length > 0 && matchCount / words.length >= 0.8;
  });
  return !isDuplicate;
});

console.log(JSON.stringify({
  source: trendData.source,
  total: trendData.keywords.length,
  filtered: filtered.length,
  keywords: filtered.slice(0, $POSTS_PER_RUN), // 최대 POSTS_PER_RUN개
}));
STEP2

echo "$LOG_PREFIX 중복 제거 완료"

# ═══════════════════════════════════════════
# STEP 3: 현재 상태 확인
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [3/6] 프로젝트 상태 확인..."

CURRENT_MAX_ID=$(node -e "
  const summary = JSON.parse(require('fs').readFileSync('./data/posts-summary.json', 'utf-8'));
  console.log(summary.lastId);
")
START_ID=$((CURRENT_MAX_ID + 1))

KEYWORD_LIST=$(node -e "
  const data = JSON.parse(require('fs').readFileSync('$FILTERED_KEYWORDS_FILE', 'utf-8'));
  console.log((data.keywords || []).map(k => k.keyword + '(' + k.cpcTier + ')').join(', '));
")

KEYWORD_COUNT=$(node -e "
  const data = JSON.parse(require('fs').readFileSync('$FILTERED_KEYWORDS_FILE', 'utf-8'));
  console.log((data.keywords || []).length);
")

END_ID=$((START_ID + KEYWORD_COUNT - 1))

echo "$LOG_PREFIX 시작 ID: $START_ID, 종료 ID: $END_ID"
echo "$LOG_PREFIX 키워드: $KEYWORD_LIST"

if [ "$KEYWORD_COUNT" -eq 0 ]; then
  echo "$LOG_PREFIX 생성할 키워드 없음. 종료."
  exit 0
fi

# ═══════════════════════════════════════════
# STEP 4: Claude Code로 포스팅 생성
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [4/6] Claude Code로 ${KEYWORD_COUNT}개 포스팅 생성..."

KEYWORDS_JSON=$(cat "$FILTERED_KEYWORDS_FILE")

SUMMARY_JSON=$(cat data/posts-summary.json)

claude --model sonnet -p "
CLAUDE-AUTO.md를 읽고 규칙을 따르세요. data/posts-summary.json은 아래에 포함되어 있으니 파일을 다시 읽지 마세요.

## 요약 데이터
$SUMMARY_JSON

## 트렌드 키워드
$KEYWORDS_JSON

## 작업
ID ${START_ID}부터 정확히 ${KEYWORD_COUNT}개(최대 2개) 포스팅 생성.

### 1순위 — OTT 구독/비교/요금제 고단가 포스팅 (cpcTier: high 우선)
키워드가 OTT 구독·비교·요금제·할인·해지 관련이면:
- contentType: 'OTT정리형'
- 반드시 실제 요금 수치·플랜명·혜택을 포함
- 각 플랫폼별 취향 기준(드라마 중심 vs 영화 중심 등) 비교 포함
- RPM 최적화: 구독 서비스 광고가 붙도록 구체적인 CTA 포함

### 2순위 — OTT 신작/트렌드 포스팅 (cpcTier: medium)
최신 화제작·주간 OTT 가이드 등

### 공통 규칙
각 포스트: posts/{id}.js 생성 + data/posts.js 메타 추가 + node --check 검증.
마무리: node scripts/update-posts-summary.js 실행.
완료 시 AUTO_POST_DONE 출력.
" --allowedTools "Edit,Write,Bash" --max-turns 40

# ═══════════════════════════════════════════
# STEP 5: 검증
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [5/6] 파일 검증..."
ERRORS=0

for f in posts/*.js; do
  if ! node --check "$f" 2>/dev/null; then
    echo "$LOG_PREFIX ❌ 구문 에러: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

if ! node --check data/posts.js 2>/dev/null; then
  echo "$LOG_PREFIX ❌ data/posts.js 구문 에러"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
  echo "$LOG_PREFIX ⚠️ $ERRORS개 에러. git push 중단."
  exit 1
fi

NEW_COUNT=$(node -e "
  const summary = JSON.parse(require('fs').readFileSync('./data/posts-summary.json', 'utf-8'));
  console.log(summary.lastId >= ${START_ID} ? summary.lastId - ${START_ID} + 1 : 0);
")

echo "$LOG_PREFIX ✅ 검증 통과. 새 포스팅: ${NEW_COUNT}개"

if [ "$NEW_COUNT" -eq 0 ]; then
  echo "$LOG_PREFIX 새 포스팅 없음. 종료."
  exit 0
fi

# ═══════════════════════════════════════════
# STEP 6: 로그 기록 + Git push
# ═══════════════════════════════════════════
echo "$LOG_PREFIX [6/6] 로그 기록 + Git push..."

# 생성 로그 기록 (JSON)
node << LOGSCRIPT
const fs = require('fs');
const logPath = '$LOG_FILE';
let log = { runs: [], keywords: {} };
try { log = JSON.parse(fs.readFileSync(logPath, 'utf-8')); } catch(e) {}

const kwData = JSON.parse(fs.readFileSync('$FILTERED_KEYWORDS_FILE', 'utf-8'));
const summary = JSON.parse(fs.readFileSync('./data/posts-summary.json', 'utf-8'));
const newPosts = summary.recentPosts.filter(p => p.id >= ${START_ID});

log.runs.unshift({
  date: new Date().toISOString(),
  trendSource: kwData.source,
  startId: ${START_ID},
  endId: ${START_ID} + newPosts.length - 1,
  postsCreated: newPosts.map(p => ({ id: p.id, slug: p.slug, title: p.title })),
  keywords: (kwData.keywords || []).map(k => ({
    keyword: k.keyword, cpcTier: k.cpcTier, trend: k.trend,
    postId: newPosts.find(np => np.tags?.some(t => k.keyword.includes(t)))?.id || null,
  })),
});
if (log.runs.length > 200) log.runs = log.runs.slice(0, 200);

// 키워드 집계
for (const kw of (kwData.keywords || [])) {
  const key = kw.keyword;
  if (!log.keywords[key]) log.keywords[key] = { count: 0, posts: [], firstSeen: new Date().toISOString(), cpcTier: kw.cpcTier };
  log.keywords[key].count++;
}

fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');
console.log('Log saved: ' + newPosts.length + ' posts recorded');
LOGSCRIPT

# 요약 파일 갱신 (새 포스트 반영)
node scripts/update-posts-summary.js

# Git
git add posts/ data/ public/sitemap.xml
git commit -m "[auto]: ${NEW_COUNT}개 포스팅 자동 생성 (ID ${START_ID}~)
// 트렌드 키워드: ${KEYWORD_LIST}
// auto-post.sh ${TODAY}"

git push origin main

echo "$LOG_PREFIX 🎉 완료! ${NEW_COUNT}개 포스팅 push됨."

# 임시 파일 정리
rm -f "$TREND_KEYWORDS_FILE" "$FILTERED_KEYWORDS_FILE"
