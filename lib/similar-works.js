/**
 * 비슷한 작품 추천 모듈
 * 태그 겹침 기반으로 유사 포스트를 찾는다.
 */

const GENERIC_TAGS = new Set([
  '넷플릭스', '디즈니플러스', '티빙', '쿠팡플레이',
  '트렌드', 'OTT', '영화 추천', '드라마 추천',
  '해외 반응', '로튼 토마토', '개봉 예정작', '현재 상영작',
  '영화', '드라마', '해외 평점', '평론가 후기',
])

function getSimilarWorks(currentPost, allPosts, maxResults = 3) {
  if (!currentPost || !currentPost.tags || currentPost.tags.length === 0) {
    return []
  }

  // 1. Get current post's non-generic tags
  const currentTags = new Set(
    currentPost.tags.filter(t => !GENERIC_TAGS.has(t))
  )

  if (currentTags.size === 0) {
    return []
  }

  // 2. Build set of slugs already in relatedSlugs (to exclude)
  const excludeSlugs = new Set(currentPost.relatedSlugs || [])
  excludeSlugs.add(currentPost.slug)

  // 3. Score each other post
  const scored = allPosts
    .filter(p => !excludeSlugs.has(p.slug) && p.tags && p.tags.length > 0)
    .map(p => {
      const otherTags = p.tags.filter(t => !GENERIC_TAGS.has(t))
      let sharedCount = 0
      for (const tag of otherTags) {
        if (currentTags.has(tag)) {
          sharedCount++
        }
      }

      // Bonus for same category
      const categoryBonus = p.category === currentPost.category ? 0.5 : 0

      return { post: p, score: sharedCount + categoryBonus }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Tie-break: newer first
      return new Date(b.post.date) - new Date(a.post.date)
    })

  // 4. Return top maxResults as lightweight objects
  return scored.slice(0, maxResults).map(item => ({
    id: item.post.id,
    slug: item.post.slug,
    tistorySlug: item.post.tistorySlug || null,
    title: item.post.title,
    category: item.post.category,
    contentType: item.post.contentType || null,
    thumbnail: item.post.thumbnail || null,
  }))
}

module.exports = { getSimilarWorks }
