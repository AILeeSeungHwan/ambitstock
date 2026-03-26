const posts = require('../../data/posts')
const getPostUrl = require('../../lib/getPostUrl')

let works = []
try { works = require('../../data/works') } catch (e) {}
let topics = []
try { topics = require('../../data/topics') } catch (e) {}

const OTT_SLUGS = ['netflix', 'disney-plus', 'tving', 'coupang-play', 'theater']
const CATEGORY_SLUGS = ['movie', 'drama', 'anime', 'marvel', 'overseas-reaction']

function getTop50Tags(posts) {
  const tagCount = {}
  posts.forEach(p => {
    if (p.tags) p.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1 })
  })
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([tag]) => tag)
}

export default function handler(req, res) {
  const baseUrl = 'https://ambitstock.com'
  const today = new Date().toISOString().slice(0, 10)

  const top50Tags = getTop50Tags(posts)

  const allUrls = [
    // Home
    { loc: baseUrl + '/', lastmod: today, changefreq: 'daily', priority: '1.0' },

    // Work hub pages
    ...works.map(w => ({
      loc: baseUrl + '/work/' + w.slug + '/',
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.7',
    })),

    // Topic hub pages
    ...topics.map(t => ({
      loc: baseUrl + '/topic/' + t.slug + '/',
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8',
    })),

    // OTT pages
    ...OTT_SLUGS.map(slug => ({
      loc: baseUrl + '/ott/' + slug + '/',
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.7',
    })),

    // Category pages
    ...CATEGORY_SLUGS.map(slug => ({
      loc: baseUrl + '/category/' + slug + '/',
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8',
    })),

    // Tag pages (top 50 only)
    ...top50Tags.map(tag => ({
      loc: baseUrl + '/tag/' + encodeURIComponent(tag) + '/',
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5',
    })),

    // Posts
    ...posts.map(p => ({
      loc: baseUrl + getPostUrl(p),
      lastmod: p.date || today,
      changefreq: isRecent(p.date) ? 'weekly' : 'monthly',
      priority: '0.6',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}

function isRecent(dateStr) {
  if (!dateStr) return false
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 30 * 24 * 60 * 60 * 1000 // 30 days
}
