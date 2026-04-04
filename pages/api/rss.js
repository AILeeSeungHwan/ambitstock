const posts = require('../../data/posts')
const getPostUrl = require('../../lib/getPostUrl')

function escapeXml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export default function handler(req, res) {
  const baseUrl = 'https://ambitstock.com'
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))

  const items = sorted.map(p => {
    const url = baseUrl + getPostUrl(p)
    const pubDate = new Date(p.date).toUTCString()
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${escapeXml(p.category)}</category>
    <description>${escapeXml(p.description || '')}</description>
  </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>R의 필름공장</title>
  <link>${baseUrl}</link>
  <description>영화 추천, 결말 해석, 해외반응, 드라마·애니·마블 정보를 한곳에서</description>
  <language>ko</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
