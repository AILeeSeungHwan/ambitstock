#!/usr/bin/env node
/**
 * generate-works.js
 *
 * Reads data/posts.js, groups posts by work-name tags,
 * and writes data/works.js with work hub data.
 *
 * Strategy: Conservative grouping. A tag is a "work name" only if it
 * clearly refers to a specific movie/drama/anime title. We use a
 * combination of blocklist filtering and heuristic validation.
 */

const path = require('path');
const fs = require('fs');

const posts = require(path.join(__dirname, '..', 'data', 'posts.js'));

// ══════════════════════════════════════════════════════════════
// BLOCKLIST: tags that are definitely NOT work names
// ══════════════════════════════════════════════════════════════

const BLOCKED_TAGS = new Set([
  // ── Platforms / OTT ──
  '넷플릭스', '디즈니플러스', '디즈니', '쿠팡플레이', '티빙', '웨이브', '왓챠',
  'OTT', 'KBS', 'ENA', 'tvN', 'SBS', 'MBC', 'JTBC', 'HBO', 'A24',
  // ── Platform compound ──
  'OTT비교', 'OTT추천', 'OTT선택', 'OTT할인',
  '넷플릭스 시청가능', '넷플릭스 드라마', '넷플릭스 드라마 추천',
  '넷플릭스 시리즈 추천', '넷플릭스 추천', '넷플릭스 애니메이션',
  '디즈니 플러스 드라마', '쿠팡플레이오리지널',
  // ── Category / genre descriptors ──
  '영화 추천', '드라마 추천', '해외 반응', '해외 평점', '해외 후기', '해외 리뷰',
  '해외 평론가', '해외 영화', '로튼 토마토', '평론가 후기', '평론가 평점', '평점',
  '트렌드', '영화', '드라마', '애니메이션', '리뷰', '영화리뷰', '결말해석',
  '개봉 예정작', '현재 상영작', '개봉 예정 영화', '개봉일', '극장개봉', '극장추천', '극장영화',
  '오블완', '티스토리챌린지', '비교', '시사회 후기', '시사회',
  '공포 영화', 'SF영화', '가족영화', '명작 추천', '애니메이션추천', '애니메이션 영화',
  '프랑스 영화', '일본 영화', '한국영화', '한국 영화', 'K드라마', '한국드라마',
  '영국드라마', '범죄드라마', '가족드라마', '힐링드라마', '로맨스', '호러', '스릴러',
  '코미디', '액션', '판타지', '드라마영화', '다큐멘터리', '로맨틱코미디', '로맨스스릴러',
  '액션 영화', '액션영화', 'K로맨스',
  // ── Generic descriptors ──
  '기대작', '수상작', '재개봉', '시청률', '시청순서', '시리즈가이드', '입문가이드',
  '박스오피스', '흥행분석', '흥행', '역대순위', '반전분석', '시청가이드',
  '결말', '순위', '명작', '줄거리', '다시보기', '요금제', '구독비교',
  '주말영화', '혼자볼영화', '데이트영화', '관람평', '극장판', '속편',
  '원작비교', '원작 소설', '천만영화', '만화원작', '웹툰원작', '웹툰 원작',
  '실사드라마', '개봉예정', '타임라인', '영화비교', '스트리밍', '영화관',
  '블록버스터', '제목 뜻', '글로벌1위', '월화드라마', '역대시청률', '주말 드라마',
  '공개 예정', '손익분기점', '유출 사건', '등장인물', '예고편', '쿠키',
  '중국영화', '홍콩영화', '재개봉 영화', '일본 여행', '작품상', 'TOP10', '3PACK',
  // ── Year / date tags ──
  '2024년', '2024', '2025년', '2025년 1월', '2025영화',
  '2026영화', '2026드라마', '2026봄드라마', '2026넷플릭스', '2026영화추천',
  '4월신작', '열린결말',
  // ── Marvel generic ──
  'MCU', '마블', '마블 영화', '마블영화', '마블순서', '마블시청순서',
  '마블페이즈6', 'MCU시청순서', '페이즈6', '페이즈5',
  // ── Ratings / metrics ──
  'IMDB', 'IMDb', 'MyDramaList', '4DX', 'IMAX',
  '일본 반응', '1500만', '역대흥행', '매출1위',
  // ── People (actors, directors) ──
  '유해진', '조인성', '박민영', '위하준', '주지훈', '하지원', '나나',
  '지수', '서인국', '이병헌', '봉준호', '박찬욱', '강동원', '조정석',
  '유연석', '이솜', '이수경', '박성웅', '킬리언머피', '라이언고슬링',
  '로버트 다우니 주니어', '로버트다우니주니어', '크리스토퍼 놀란',
  '마고로비', '제이콥엘로디', '에메랄드페넬', '니키리', '이선균',
  '아이유', '변우석', '샤를리즈테론', '이동진', '앤디위어',
  '최민식', '손예진', '지창욱', '송강호', '톰행크스',
  '정해인', '박평식', '박정민', '박지훈', '설경구', '이동욱',
  '김고은', '로다주', '손석구', '톰크루즈', '성룡', '류승완',
  '김정현', '류준열', '황동혁', '이정재', '하정우', '심은경',
  '송중기', '이희준', '노상현', '김성철', '황정민', '김윤석',
  '구교환', '이제훈', '이도현', '마동석', '김희애', '백종원', '안성재',
  '로버트 패틴슨', '이동진 평론가', '티모시 샬라메', '스티븐 연',
  '아리아나 그란데', '라이언 레이놀즈', '레오나르도 디카프리오',
  '호아킨 피닉스', '메릴스트립', '앤해서웨이', '에밀리블런트',
  '니콜 키드먼', '다코타 패닝', '킬리언 머피', '미야자키하야오',
  '신카이마코토', '페데 알바레즈', '쿠엔틴타란티노',
  // ── Studio / franchise generic ──
  '지브리', '지브리 애니메이션', '픽사',
  '일본 애니메이션', '일본애니메이션',
  // ── Misc non-work tags ──
  '시즌 2', '시즌3', '오스카', '아카데미', '칸영화제', '칸 영화제',
  '롯데시네마', 'SNL코리아', '왓챠피디아', '사극', '단종',
  '공유', '한강', '호프', '테넷', '트럼프', '비틀즈', '세븐틴',
  '크리스마스',
  // ── Tags that look like works but are descriptors/meta ──
  '결말 후기', '넷플릭스요금제', '스튜디오지브리', '픽사신작',
  '박평식 평론가', '어벤져스 둠스데이',
  '아이언맨', '명량', '극한직업', '리들리 스콧', 'SNL코리아',
  '지브리시청순서',
]);

// Regex patterns that indicate non-work tags
const BLOCKED_PATTERNS = [
  /^\d{4}/, // starts with year
  /추천$/, // ends with 추천
  /^해외/, // starts with 해외
  /^평론/, // starts with 평론
  /^넷플릭스\s/, // netflix + space
  /^영화\s/, // movie + space
  /^드라마\s/, // drama + space
  /^애니메이션\s/, // animation + space
  /^한국\s/, // korea + space
  /^일본\s/, // japan + space
  /분석$/, // ends with 분석
  /정리$/, // ends with 정리
  /가이드$/, // ends with 가이드
];

function isBlocked(tag) {
  if (BLOCKED_TAGS.has(tag)) return true;
  for (const pat of BLOCKED_PATTERNS) {
    if (pat.test(tag)) return true;
  }
  // Block single-character tags and very short generic words
  if (tag.length <= 1) return true;
  return false;
}

// ══════════════════════════════════════════════════════════════
// ALLOWLIST: tags we KNOW are work names (manually verified)
// Maps Korean tag -> English slug
// ══════════════════════════════════════════════════════════════

const KNOWN_WORKS = {
  '왕과사는남자': 'king-and-man',
  '왕사남': 'king-and-man',  // alias -> merge
  '프로젝트헤일메리': 'project-hail-mary',
  '피키블라인더스': 'peaky-blinders',
  '불멸의남자': 'peaky-blinders',  // part of Peaky Blinders franchise
  '원피스': 'one-piece',
  '원피스실사': 'one-piece',  // merge into 원피스
  '원피스시즌2': 'one-piece',  // merge into 원피스
  '세이렌': 'siren',
  '월간남친': 'monthly-boyfriend',
  '신이랑법률사무소': 'shin-irang-law-office',
  '클라이맥스': 'climax',
  '오징어게임': 'squid-game',
  '오징어 게임': 'squid-game',
  '기생충': 'parasite',
  '닥터둠': 'doctor-doom',
  '둠스데이': 'avengers',  // merge: Doomsday = Avengers franchise
  '호퍼스': 'hoppers',
  '경성크리처': 'gyeongseong-creature',
  '조커 2': 'joker-2',
  '베테랑 2': 'veteran-2',
  '미키17': 'mickey-17',
  '미키 17': 'mickey-17',
  '더 플랫폼': 'the-platform',
  '나우 유 씨미': 'now-you-see-me',
  '악마는프라다를입는다2': 'devil-wears-prada-2',
  '어벤져스': 'avengers',
  '건물주되는법': 'how-to-become-landlord',
  '휴민트': 'humint',
  '위키드': 'wicked',
  '어프렌티스': 'the-apprentice',
  '브리저튼': 'bridgerton',
  '인터스텔라': 'interstellar',
  '파이널레코닝': 'mission-impossible-final-reckoning',
  '미션임파서블': 'mission-impossible-final-reckoning',
  '와일드 로봇': 'the-wild-robot',
  '최애의 아이': 'oshi-no-ko',
  '대도시의 사랑법': 'lovestruck-in-the-city',
  '레이디 가가': 'joker-2',  // merge: Lady Gaga tagged posts are Joker 2
  '브리저튼시즌4': 'bridgerton',  // merge into bridgerton
  '어벤져스5': 'avengers',       // merge into avengers
  '어벤져스둠스데이': 'avengers', // merge into avengers
  '들쥐': 'deulji',
  '베놈': 'venom',
  '파묘': 'pamyo',
  '샤이닝': 'shining',
  '컨저링': 'conjuring',
  '하얼빈': 'harbin',
  '아노라': 'anora',
  '원더풀스': 'wonderfools',
  '유포리아': 'euphoria',
  '슬램덩크': 'slam-dunk',
  '브라이드': 'bride',
  '시빌 워': 'civil-war',
  '롱레그스': 'longlegs',
  '귀멸의칼날': 'demon-slayer',
  '모아나 2': 'moana-2',
  '채식주의자': 'the-vegetarian',
  '레트리뷰션': 'retribution',
  '이매지너리': 'imaginary',
  '만달로리안': 'mandalorian',
  '글래디에이터': 'gladiator',
  '보통의 가족': 'ordinary-family',
  '노 웨이 업': 'no-way-up',
  '스파이더맨': 'spider-man',
  '캡틴 아메리카': 'captain-america',
  '반지의 제왕': 'lord-of-the-rings',
  '해리포터 시리즈': 'harry-potter',
  '스픽 노 이블': 'speak-no-evil',
  '섀도우의 13': 'thirteen-of-shadow',
  '월레스와 그로밋': 'wallace-and-gromit',
  '미스터 플랑크톤': 'mr-plankton',
  '에일리언 로물루스': 'alien-romulus',
  '더 인플루언서': 'the-influencer',
  '이오 카피타노': 'io-capitano',
  '악이 도사리고 있을 때': 'when-evil-lurks',
  '더러운 돈에 손대지 마라': 'dirty-money',
  '탈출 : 프로젝트 사일런스': 'project-silence',
  '쇼생크탈출': 'shawshank-redemption',
  '폭풍의언덕': 'wuthering-heights',
  '사냥개들시즌2': 'bloodhounds-season2',
  'Beef시즌2': 'beef-season2',
  '21세기대군부인': '21st-century-grand-princess',
  '심우면연리리': 'simumyeon-yeonriri',
  '언더톤': 'undertone',
  '아비주': 'undertone',  // merge: Abyzou is from Undertone
};

// ══════════════════════════════════════════════════════════════
// Step 1: Build tag -> posts mapping, only for non-blocked tags
// ══════════════════════════════════════════════════════════════

const tagToPosts = {};
for (const post of posts) {
  if (!post.tags) continue;
  for (const tag of post.tags) {
    if (isBlocked(tag)) continue;
    if (!tagToPosts[tag]) tagToPosts[tag] = [];
    tagToPosts[tag].push(post);
  }
}

// ══════════════════════════════════════════════════════════════
// Step 2: Group by work using KNOWN_WORKS mapping
//         + discover additional work-name tags heuristically
// ══════════════════════════════════════════════════════════════

// Slug -> hub data
const hubMap = {}; // slug -> { title, postSet, categories, platforms }

function getOrCreateHub(slug, title) {
  if (!hubMap[slug]) {
    hubMap[slug] = { title, postSet: new Set(), categories: [], platforms: [] };
  }
  return hubMap[slug];
}

// Pass 1: Process known works
for (const [tag, slug] of Object.entries(KNOWN_WORKS)) {
  if (!tagToPosts[tag]) continue;
  const hub = getOrCreateHub(slug, tag);
  for (const post of tagToPosts[tag]) {
    if (!hub.postSet.has(post.id)) {
      hub.postSet.add(post.id);
      hub.categories.push(post.category);
      if (post.platform) hub.platforms.push(post.platform);
    }
  }
}

// For hubs created by merging multiple tags, pick the best title
// (prefer the tag that contributed the most posts)
for (const slug of Object.keys(hubMap)) {
  const hub = hubMap[slug];
  // Find all KNOWN_WORKS tags that map to this slug
  const tagCandidates = Object.entries(KNOWN_WORKS)
    .filter(([t, s]) => s === slug && tagToPosts[t])
    .map(([t]) => ({ tag: t, count: tagToPosts[t].length }))
    .sort((a, b) => b.count - a.count);
  if (tagCandidates.length > 0) {
    hub.title = tagCandidates[0].tag;
  }
}

// Pass 2: Discover additional work hubs from tags with 2+ posts
// that look like proper work names (not in KNOWN_WORKS, not blocked)
const DISCOVERED_MIN_POSTS = 2;

for (const [tag, tagPosts] of Object.entries(tagToPosts)) {
  if (tagPosts.length < DISCOVERED_MIN_POSTS) continue;
  if (KNOWN_WORKS[tag]) continue; // already handled
  if (isBlocked(tag)) continue;

  // Heuristic: work names are typically 2+ characters, contain Korean,
  // and are NOT generic descriptors
  const hasKorean = /[가-힣]/.test(tag);
  const isLongEnough = tag.length >= 2;

  // Skip tags that are just person names (2-3 Korean chars, very common pattern)
  // Person names are typically 2-3 chars pure Korean
  const isProbablyPersonName = /^[가-힣]{2,3}$/.test(tag) && tagPosts.length <= 3;

  // Skip tags that are clearly descriptive (end with common suffixes)
  const isDescriptive = /[영화드라마시즌순서비교추천정리]$/.test(tag) && tag.length <= 4;

  if (!hasKorean && !/^[A-Z]/.test(tag)) continue; // must have Korean or start with uppercase English
  if (!isLongEnough) continue;
  if (isProbablyPersonName) continue;
  if (isDescriptive) continue;

  // Generate slug from post slugs
  const slug = deriveSlugFromPosts(tag, tagPosts);
  if (!slug) continue;

  // Check this slug isn't already used
  if (hubMap[slug]) {
    // Merge into existing
    const hub = hubMap[slug];
    for (const post of tagPosts) {
      if (!hub.postSet.has(post.id)) {
        hub.postSet.add(post.id);
        hub.categories.push(post.category);
        if (post.platform) hub.platforms.push(post.platform);
      }
    }
    continue;
  }

  const hub = getOrCreateHub(slug, tag);
  for (const post of tagPosts) {
    if (!hub.postSet.has(post.id)) {
      hub.postSet.add(post.id);
      hub.categories.push(post.category);
      if (post.platform) hub.platforms.push(post.platform);
    }
  }
}

function deriveSlugFromPosts(tag, tagPosts) {
  const slugs = tagPosts.map(p => p.slug);

  // Try to find a common meaningful slug fragment across posts
  if (slugs.length >= 2) {
    // Try all 2-5 word prefixes from each slug
    for (const s of slugs) {
      const words = s.split('-');
      for (let len = Math.min(words.length, 4); len >= 2; len--) {
        const candidate = words.slice(0, len).join('-');
        if (candidate.length < 4) continue;
        // Skip generic slug fragments
        if (/^(netflix|disney|spring|2026|march|april|best|top|guide|review|ending|overseas|rating|reaction|recommend)/.test(candidate)) continue;
        const matchCount = slugs.filter(sl => sl.includes(candidate)).length;
        if (matchCount >= Math.ceil(slugs.length * 0.5) && matchCount >= 2) {
          return candidate;
        }
      }
    }
  }

  // Fallback: first post slug, first 3 meaningful words
  const words = slugs[0].split('-').filter(w =>
    !['2026', '2025', 'netflix', 'review', 'ending', 'guide', 'analysis', 'overseas', 'reaction', 'rating', 'recommend', 'top', 'best', 'march', 'april', 'spring'].includes(w)
  );
  if (words.length >= 2) return words.slice(0, 3).join('-');
  return null;
}

function mostCommon(arr) {
  const counts = {};
  arr.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

// ══════════════════════════════════════════════════════════════
// Step 3: Filter hubs with < 2 posts, then build output
// ══════════════════════════════════════════════════════════════

const works = [];

for (const [slug, hub] of Object.entries(hubMap)) {
  if (hub.postSet.size < 2) continue;

  works.push({
    slug,
    title: hub.title,
    posts: [...hub.postSet].sort((a, b) => a - b),
    category: mostCommon(hub.categories) || '영화추천',
    platform: mostCommon(hub.platforms) || null,
  });
}

// Sort by post count descending, then by title
works.sort((a, b) => b.posts.length - a.posts.length || a.title.localeCompare(b.title));

// ══════════════════════════════════════════════════════════════
// Step 4: Write data/works.js
// ══════════════════════════════════════════════════════════════

const outputPath = path.join(__dirname, '..', 'data', 'works.js');

let output = 'const works = [\n';
for (const w of works) {
  const postsStr = JSON.stringify(w.posts);
  const platformStr = w.platform ? `'${w.platform}'` : 'null';
  output += `  { slug: '${w.slug}', title: '${w.title}', posts: ${postsStr}, category: '${w.category}', platform: ${platformStr} },\n`;
}
output += ']\n\nmodule.exports = works\n';

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`Wrote ${outputPath}`);

// ══════════════════════════════════════════════════════════════
// Step 5: Print stats
// ══════════════════════════════════════════════════════════════

console.log(`\n=== Work Hub Stats ===`);
console.log(`Total work hubs: ${works.length}`);
console.log(`Total posts covered: ${new Set(works.flatMap(w => w.posts)).size} / ${posts.length}`);

console.log(`\nTop 10 by post count:`);
works.slice(0, 10).forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.title} (${w.slug}) — ${w.posts.length} posts [${w.category}] [${w.platform || 'N/A'}]`);
});

console.log(`\nAll hubs (${works.length}):`);
works.forEach(w => {
  console.log(`  [${w.posts.length}] ${w.title} (${w.slug}) — posts: ${w.posts.join(', ')}`);
});
