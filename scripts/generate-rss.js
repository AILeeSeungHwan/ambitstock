#!/usr/bin/env node
/**
 * generate-rss.js — data/posts.js → public/rss.xml (RSS 2.0) 자동 생성
 * 실행: node scripts/generate-rss.js
 *
 * 최신 포스트 50개 (tistorySlug 없는 포스트 우선, 날짜 내림차순)
 */
const fs = require('fs')
const path = require('path')

const posts = require('../data/posts')
const BASE_URL = 'https://ambitstock.com'
const SITE_TITLE = 'R의 필름공장 — 영화 추천·결말 해석·해외반응 허브'
const SITE_DESC = '영화 추천, 결말 해석, 해외반응, 드라마·애니·마블 정보를 한곳에서. OTT 구독 가이드 포함.'
const RSS_MAX = 50

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrl(post) {
  if (post.tistorySlug) return `${BASE_URL}/entry/${post.tistorySlug}/`
  return `${BASE_URL}/${post.slug}/`
}

function toRfc822(dateStr) {
  if (!dateStr) return new Date().toUTCString()
  // dateStr: 'YYYY-MM-DD'
  return new Date(dateStr + 'T00:00:00+09:00').toUTCString()
}

// 최신순 정렬 후 상위 RSS_MAX개
const sorted = [...posts]
  .filter(p => p.slug && p.title)
  .sort((a, b) => {
    const da = a.date || '2020-01-01'
    const db = b.date || '2020-01-01'
    return db.localeCompare(da)
  })
  .slice(0, RSS_MAX)

const items = sorted.map(post => {
  const url = buildUrl(post)
  const desc = escapeXml(post.description || post.title)
  const title = escapeXml(post.title)
  const category = escapeXml(post.category || '')
  const tags = (post.tags || []).map(t => `      <category>${escapeXml(t)}</category>`).join('\n')

  return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <category>${category}</category>
${tags}
    </item>`
}).join('\n')

const buildDate = new Date().toUTCString()

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}/</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>ko</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/favicon.svg</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${BASE_URL}/</link>
    </image>
${items}
  </channel>
</rss>`

const outPath = path.join(__dirname, '..', 'public', 'rss.xml')
fs.writeFileSync(outPath, rss, 'utf8')
console.log(`rss.xml 생성 완료 — ${sorted.length}개 항목`)
