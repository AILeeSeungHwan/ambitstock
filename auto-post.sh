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
POSTS_PER_RUN=20
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
// 우리 영역의 핵심 키워드 그룹
const keywordGroups = [
  { groupName: 'OTT플랫폼', keywords: ['넷플릭스', '디즈니플러스', '티빙', '쿠팡플레이', '웨이브'] },
  { groupName: '추천일반', keywords: ['영화추천', '드라마추천', '애니추천', '볼만한영화'] },
  { groupName: '장르', keywords: ['스릴러영화', '로맨스드라마', '가족영화', '액션영화', '공포영화'] },
  { groupName: '작품성', keywords: ['이동진추천', '로튼토마토', 'IMDB평점', '해외반응'] },
  { groupName: 'OTT운영', keywords: ['넷플릭스요금제', '넷플릭스할인', 'OTT비교'] },
];

const endDate = new Date().toISOString().slice(0, 10);
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const body = JSON.stringify({
  startDate, endDate, timeUnit: 'week',
  keywordGroups: keywordGroups.map(g => ({ groupName: g.groupName, keywords: g.keywords })),
});

if (CLIENT_ID === 'YOUR_CLIENT_ID') {
  // API 키 없으면 기본 키워드 목록 사용
  console.log(JSON.stringify({
    source: 'fallback',
    keywords: [
      { keyword: 'OTT구독비교2026', trend: 95, cpcTier: 'high' },
      { keyword: '넷플릭스요금제비교', trend: 90, cpcTier: 'high' },
      { keyword: '디즈니플러스요금제', trend: 85, cpcTier: 'high' },
      { keyword: 'OTT비교추천', trend: 80, cpcTier: 'high' },
      { keyword: '넷플릭스할인방법', trend: 75, cpcTier: 'high' },
      { keyword: '영화추천2026', trend: 70, cpcTier: 'medium' },
      { keyword: '넷플릭스추천드라마', trend: 68, cpcTier: 'medium' },
      { keyword: '드라마추천2026', trend: 65, cpcTier: 'medium' },
      { keyword: '애니추천넷플릭스', trend: 60, cpcTier: 'medium' },
      { keyword: '볼만한영화추천', trend: 55, cpcTier: 'medium' },
      { keyword: '해외반응화제작', trend: 50, cpcTier: 'low' },
      { keyword: 'IMDB평점높은영화', trend: 48, cpcTier: 'low' },
      { keyword: '로튼토마토추천', trend: 45, cpcTier: 'low' },
      { keyword: '결말해석스릴러', trend: 42, cpcTier: 'low' },
      { keyword: '이동진추천영화', trend: 40, cpcTier: 'low' },
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

FILTERED_KEYWORDS_FILE=$(mktemp)

node << STEP2 > "$FILTERED_KEYWORDS_FILE"
const fs = require('fs');
const trendData = JSON.parse(fs.readFileSync('$TREND_KEYWORDS_FILE', 'utf-8'));
const posts = require('./data/posts.js').default;

// 기존 포스팅 키워드 수집 (title + tags + description)
const existingTexts = posts.map(p =>
  (p.title + ' ' + (p.tags || []).join(' ') + ' ' + (p.description || '')).toLowerCase()
);

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
  const posts = require('./data/posts.js').default;
  console.log(Math.max(...posts.map(p => p.id)));
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

claude -p "
당신은 ambitstock.com 영화/드라마/OTT 블로그 'R의 필름공장'의 포스팅 생성기입니다.

## 트렌드 키워드 데이터
$KEYWORDS_JSON

## 작업
위 키워드 데이터를 바탕으로 ID ${START_ID}부터 최대 ${KEYWORD_COUNT}개의 포스팅을 생성하세요.
각 키워드에 대해 하나의 포스팅을 만들되, cpcTier가 'high'인 키워드를 우선 처리하세요.

## 포스팅 구조 규칙

### slug 규칙 (SEO 최적화)
- 영문 소문자 + 하이픈, 3~6단어
- 핵심 키워드 반영 (예: netflix-movie-recommend-2026-march)
- 연도 포함

### 파일 구조 (posts/[id].js)
\`\`\`
const post = {
  id: [번호],
  sections: [
    { type: 'intro', html: '<p>2~3문단 인트로</p>' },
    { type: 'image', src: '/images/placeholder.svg', alt: '[SEO alt]', caption: '[설명]' },
    { type: 'toc' },
    { type: 'h2', id: '[section-id]', text: '[소제목]', gradientStyle: 'linear-gradient(to right, [색1], [색2])' },
    { type: 'body', html: '<p>[최소 150자 본문]</p>' },
    // h2 + body 반복 (4~6개)
    { type: 'ad', slot: '6297515693', format: 'auto' },
    { type: 'cta', href: '[관련 URL]', text: '[CTA 텍스트]' },
    { type: 'ending', html: '<p>[마무리 1~2문단]</p>' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
  ]
}
export default post
\`\`\`

### 필수 체크
- h2 다음에 반드시 body (빈 body 절대 금지, 최소 150자)
- intro 2~3문단, ending 필수
- ad 슬롯: 중간 1개 + 끝 1개 (slot: '6297515693')
- 이미지 src: '/images/placeholder.svg'
- alt/caption 반드시 작성 (SEO 키워드 포함)
- html 안 따옴표는 &quot; 사용
- JS 문자열 안 실제 줄바꿈 금지
- 기존 포스팅 16번을 구조 참고

### data/posts.js 업데이트
기존 포스팅 배열 앞에 새 포스팅 메타데이터를 추가하세요:
{
  id: [번호],
  slug: '[seo-keyword-slug]',
  title: '[60자 이내, 키워드 포함 SEO 타이틀]',
  description: '[120자 이내 메타 설명]',
  category: '[영화추천|드라마|해외반응후기|마블|애니메이션]',
  date: '${TODAY}',
  tags: ['키워드1', '키워드2', ...],
  thumbnail: null,
}

### sitemap.xml
public/sitemap.xml에 새 포스팅 URL 추가:
<url><loc>https://ambitstock.com/[slug]/</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>

## 최종 확인
1. node --check로 모든 JS 파일 검증
2. 완료 후 'AUTO_POST_DONE' 출력
" --allowedTools "Edit,Write,Bash" --max-turns 80

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
  const posts = require('./data/posts.js').default;
  const n = posts.filter(p => p.id >= ${START_ID}).length;
  console.log(n);
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
const posts = require('./data/posts.js').default;
const newPosts = posts.filter(p => p.id >= ${START_ID});

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

# Git
git add posts/ data/ public/sitemap.xml
git commit -m "[auto]: ${NEW_COUNT}개 포스팅 자동 생성 (ID ${START_ID}~)
// 트렌드 키워드: ${KEYWORD_LIST}
// auto-post.sh ${TODAY}"

git push origin main

echo "$LOG_PREFIX 🎉 완료! ${NEW_COUNT}개 포스팅 push됨."

# 임시 파일 정리
rm -f "$TREND_KEYWORDS_FILE" "$FILTERED_KEYWORDS_FILE"
