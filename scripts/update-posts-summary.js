#!/usr/bin/env node
/**
 * data/posts.js → data/posts-summary.json 요약 파일 생성
 * 자동 포스팅 시 토큰 절약 목적: posts.js 전체를 읽지 않고 요약만 참조
 * 실행: node scripts/update-posts-summary.js
 */
const fs = require('fs')
const path = require('path')

const posts = require('../data/posts')
const today = new Date()
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

const lastId = Math.max(...posts.map(p => p.id))
const totalCount = posts.length

const recentPosts = posts
  .filter(p => p.date && new Date(p.date) >= thirtyDaysAgo)
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(p => ({ id: p.id, title: p.title, slug: p.slug, date: p.date, category: p.category, tags: p.tags || [] }))

const allTitles = posts.map(p => p.title)

const categoryCount = {}
posts.forEach(p => { categoryCount[p.category] = (categoryCount[p.category] || 0) + 1 })

const summary = {
  lastId,
  totalCount,
  updatedAt: today.toISOString().slice(0, 10),
  recentPosts,
  allTitles,
  categoryCount,
}

const outPath = path.join(__dirname, '..', 'data', 'posts-summary.json')
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8')
console.log('posts-summary.json 생성 완료 — lastId:', lastId, 'total:', totalCount, 'recent30d:', recentPosts.length)
