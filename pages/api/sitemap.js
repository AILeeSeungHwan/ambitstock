const posts = require('../../data/posts')
const getPostUrl = require('../../lib/getPostUrl')

export default function handler(req, res) {
  const baseUrl = 'https://ambitstock.com'
  const today = new Date().toISOString().slice(0, 10)

  const allUrls = [
    { loc: baseUrl + '/', lastmod: today, changefreq: 'daily', priority: '1.0' },
    ...posts.map(p => ({
      loc: baseUrl + getPostUrl(p),
      lastmod: p.date || today,
      changefreq: isRecent(p.date) ? 'weekly' : 'monthly',
      priority: '0.8',
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
