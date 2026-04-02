/**
 * 포스트 상세 페이지용 getStaticProps 공통 로직
 * [slug].js와 entry/[slug].js에서 공유
 */
function getPostProps(meta) {
  const posts = require('../data/posts')
  const works = require('../data/works')
  const getOgImage = require('./getOgImage')
  const { getInternalLinks } = require('./internal-links')
  const { getSimilarWorks } = require('./similar-works')

  let postData = null
  try {
    const mod = require('../posts/' + meta.id + '.js')
    postData = mod.default || mod
    postData.sections = Array.from(postData.sections).filter(Boolean)
  } catch (e) {
    return null
  }

  const ogImage = getOgImage(meta, postData)
  const firstImage = postData.sections.find(s => s.type === 'image')
  const thumbnail = meta.thumbnail || (firstImage ? firstImage.src : null)

  const serializePost = (p) => {
    let relThumb = p.thumbnail
    if (!relThumb) {
      try {
        const rm = require('../posts/' + p.id + '.js')
        const rd = rm.default || rm
        const ri = rd.sections.find(s => s.type === 'image')
        relThumb = ri ? ri.src : null
      } catch (e) {}
    }
    return { id: p.id, slug: p.slug, tistorySlug: p.tistorySlug || null, title: p.title, date: p.date, category: p.category, contentType: p.contentType || null, thumbnail: relThumb }
  }

  // 관련글
  const relatedBySlug = (meta.relatedSlugs || [])
    .map(slug => posts.find(p => p.slug === slug))
    .filter(Boolean)
    .slice(0, 4)
  const relatedByCat = relatedBySlug.length >= 4 ? [] : posts
    .filter(p => p.id !== meta.id && p.category === meta.category && !relatedBySlug.find(r => r.id === p.id))
    .sort((a, b) => {
      const aScore = a.contentType === meta.contentType ? 1 : 0
      const bScore = b.contentType === meta.contentType ? 1 : 0
      if (aScore !== bScore) return bScore - aScore
      return new Date(b.date) - new Date(a.date)
    })
    .slice(0, 4 - relatedBySlug.length)
  const related = [...relatedBySlug, ...relatedByCat].map(serializePost)

  // Internal links
  const internalLinks = getInternalLinks(meta, posts, works)
  const serializedLinks = {
    sameWork: internalLinks.sameWork.map(serializePost),
    sameTopic: internalLinks.sameTopic.map(serializePost),
    parentHub: internalLinks.parentHub,
    ottHub: internalLinks.ottHub,
    nextRead: internalLinks.nextRead ? serializePost(internalLinks.nextRead) : null,
  }

  // 비슷한 작품
  const similarRaw = getSimilarWorks(meta, posts, 3)
  const similarPosts = similarRaw.map(p => {
    let thumb = p.thumbnail
    if (!thumb) {
      try {
        const rm = require('../posts/' + p.id + '.js')
        const rd = rm.default || rm
        const ri = rd.sections.find(s => s.type === 'image')
        thumb = ri ? ri.src : null
      } catch (e) {}
    }
    return { ...p, thumbnail: thumb }
  })

  const safeMeta = Object.fromEntries(Object.entries({ ...meta, thumbnail, ogImage }).filter(([, v]) => v !== undefined))
  return { meta: safeMeta, postData, related, internalLinks: serializedLinks, similarPosts }
}

module.exports = getPostProps
