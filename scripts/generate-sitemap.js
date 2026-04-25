#!/usr/bin/env node
/**
 * generate-sitemap.js — data/posts.js → public/sitemap.xml 자동 생성
 * 실행: node scripts/generate-sitemap.js
 *
 * URL 규칙:
 *   - tistorySlug 있는 포스트: https://ambitstock.com/entry/{tistorySlug}/
 *   - 일반 포스트: https://ambitstock.com/{slug}/
 */
const fs = require('fs')
const path = require('path')

const posts = require('../data/posts')
const BASE_URL = 'https://ambitstock.com'
const today = new Date().toISOString().slice(0, 10)

// priority: tistorySlug 없는 최신 포스트는 0.9, 나머지 0.8
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrl(post) {
  if (post.tistorySlug) return `${BASE_URL}/entry/${escapeXml(post.tistorySlug)}/`
  return `${BASE_URL}/${escapeXml(post.slug)}/`
}

const urlEntries = []

// 홈페이지
urlEntries.push(`  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`)

// 포스트 (최신순)
const sorted = [...posts].sort((a, b) => {
  const da = a.date || '2020-01-01'
  const db = b.date || '2020-01-01'
  return db.localeCompare(da)
})

for (const post of sorted) {
  const lastmod = post.date || today
  const isRecent = lastmod >= thirtyDaysAgo
  const priority = isRecent ? '0.9' : '0.8'
  const changefreq = isRecent ? 'weekly' : 'monthly'

  urlEntries.push(`  <url>
    <loc>${buildUrl(post)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml, 'utf8')
console.log(`sitemap.xml 생성 완료 — ${urlEntries.length}개 URL (포스트 ${posts.length}개)`)
