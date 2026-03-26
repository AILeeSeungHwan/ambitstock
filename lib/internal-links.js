const getPostUrl = require('./getPostUrl')

const CATEGORY_SLUG_MAP = {
  '영화추천': 'movie',
  '드라마': 'drama',
  '애니메이션': 'anime',
  '마블': 'marvel',
  '해외반응후기': 'overseas-reaction',
}

const OTT_SLUG_MAP = {
  '넷플릭스': 'netflix',
  '디즈니플러스': 'disney-plus',
  '티빙': 'tving',
  '쿠팡플레이': 'coupang-play',
  '극장': 'theater',
}

/**
 * Given a post and all posts data, return structured internal links.
 *
 * @param {object} currentPost - post metadata from data/posts.js
 * @param {object[]} allPosts - full posts array from data/posts.js
 * @param {object[]} works - works array from data/works.js
 * @returns {{ sameWork: object[], sameTopic: object[], parentHub: {href:string, label:string}, ottHub: {href:string, label:string}|null, nextRead: object|null }}
 */
function getInternalLinks(currentPost, allPosts, works) {
  const currentId = currentPost.id

  // 1. Same work posts (max 3)
  const work = works.find(w => w.posts.includes(currentId))
  const sameWorkIds = work
    ? work.posts.filter(pid => pid !== currentId)
    : []
  const sameWork = sameWorkIds
    .map(pid => allPosts.find(p => p.id === pid))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)

  const excludeIds = new Set([currentId, ...sameWork.map(p => p.id)])

  // 2. Same contentType posts (max 3) - most recent, excluding current and sameWork
  const sameTopic = currentPost.contentType
    ? allPosts
        .filter(p => !excludeIds.has(p.id) && p.contentType === currentPost.contentType)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
    : []

  // 3. Parent hub link - work hub if exists, otherwise category hub
  let parentHub
  if (work) {
    parentHub = { href: '/work/' + work.slug, label: work.title }
  } else {
    const catSlug = CATEGORY_SLUG_MAP[currentPost.category] || 'movie'
    parentHub = { href: '/category/' + catSlug, label: currentPost.category }
  }

  // 4. OTT hub link - if post has platform
  let ottHub = null
  const platform = currentPost.platform || (work ? work.platform : null)
  if (platform && OTT_SLUG_MAP[platform]) {
    ottHub = { href: '/ott/' + OTT_SLUG_MAP[platform], label: platform }
  }

  // 5. Next read suggestion - first from sameWork, then sameTopic
  const nextRead = sameWork.length > 0
    ? sameWork[0]
    : (sameTopic.length > 0 ? sameTopic[0] : null)

  return {
    sameWork,
    sameTopic,
    parentHub,
    ottHub,
    nextRead,
  }
}

module.exports = { getInternalLinks }
