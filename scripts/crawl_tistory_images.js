#!/usr/bin/env node
/**
 * 티스토리 이미지 크롤러
 * 24ourstory.tistory.com에서 이미지를 가져와 posts/{id}.js에 삽입
 *
 * Usage:
 *   node scripts/crawl_tistory_images.js          # 이미지 없는 모든 포스트
 *   node scripts/crawl_tistory_images.js 51 60    # ID 51~60만
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const TISTORY_BASE = 'https://24ourstory.tistory.com/entry/'
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images')
const POSTS_DIR = path.join(__dirname, '..', 'posts')
const DATA_FILE = path.join(__dirname, '..', 'data', 'posts.js')

// Rate limiting
const DELAY_MS = 1500

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return await res.text()
}

function extractImages(html) {
  const images = []

  // Extract full kakao CDN URLs from img tags with data-origin-* or src attributes
  // Pattern: src="https://blog.kakaocdn.net/dna/..." with &amp; encoded params
  const imgTagRegex = /<img[^>]*src=["'](https?:\/\/blog\.kakaocdn\.net\/dna\/[^"']+)["'][^>]*>/gi
  const altRegex = /alt=["']([^"']*)["']/i
  const seen = new Set()
  let match

  while ((match = imgTagRegex.exec(html)) !== null) {
    let src = match[1].replace(/&amp;/g, '&')
    const altMatch = match[0].match(altRegex)
    const alt = altMatch ? altMatch[1] : ''

    // Extract the unique path part (before query params) to deduplicate
    const pathKey = src.split('?')[0]
    if (seen.has(pathKey)) continue
    seen.add(pathKey)

    images.push({ src, alt })
  }

  // Also try data-origin-src for lazy-loaded images
  const lazyRegex = /data-origin-src=["'](https?:\/\/blog\.kakaocdn\.net\/dna\/[^"']+)["']/gi
  while ((match = lazyRegex.exec(html)) !== null) {
    let src = match[1].replace(/&amp;/g, '&')
    const pathKey = src.split('?')[0]
    if (seen.has(pathKey)) continue
    seen.add(pathKey)
    images.push({ src, alt: '' })
  }

  // Also check for img1.daumcdn.net full-size images (older tistory format)
  const daumRegex = /<img[^>]*src=["'](https?:\/\/img1\.daumcdn\.net\/thumb\/R1280x0\/\?fname=[^"']+)["'][^>]*>/gi
  while ((match = daumRegex.exec(html)) !== null) {
    let src = match[1].replace(/&amp;/g, '&')
    const altMatch = match[0].match(altRegex)
    const alt = altMatch ? altMatch[1] : ''
    const pathKey = src.split('?')[0] + decodeURIComponent(src.split('fname=')[1] || '').split('?')[0]
    if (seen.has(pathKey)) continue
    seen.add(pathKey)
    images.push({ src, alt })
  }

  return images
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://24ourstory.tistory.com/',
    },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(filepath, buf)
}

function getImageExtension(url) {
  if (url.includes('.png') || url.includes('/img.png')) return '.png'
  if (url.includes('.gif') || url.includes('/img.gif')) return '.gif'
  if (url.includes('.webp') || url.includes('/img.webp')) return '.webp'
  return '.jpg'
}

function updatePostFile(postId, imageEntries) {
  const postPath = path.join(POSTS_DIR, postId + '.js')
  let content = fs.readFileSync(postPath, 'utf-8')

  // Find h2 sections and insert images after them
  // Strategy: insert images after the first body section following each h2

  // Parse sections to find insertion points
  const sectionRegex = /\{\s*type:\s*'(h2|body|ending)'/g
  const positions = []
  let m
  let lastH2Pos = -1
  let insertedAfterH2 = false

  while ((m = sectionRegex.exec(content)) !== null) {
    if (m[1] === 'h2') {
      lastH2Pos = m.index
      insertedAfterH2 = false
    } else if (m[1] === 'body' && lastH2Pos >= 0 && !insertedAfterH2) {
      // Find the end of this body section (closing })
      let depth = 0
      let pos = m.index
      for (let i = pos; i < content.length; i++) {
        if (content[i] === '{') depth++
        if (content[i] === '}') {
          depth--
          if (depth === 0) {
            positions.push(i + 1) // after the closing }
            insertedAfterH2 = true
            break
          }
        }
      }
    }
  }

  // If we have more images than positions, add remaining before ending
  // If fewer images, just use what we have

  // Insert images at positions (reverse order to maintain positions)
  const imageCount = imageEntries.length
  const posCount = positions.length

  // Distribute images across positions
  let imgIdx = 0
  const insertions = [] // {pos, imageEntry}

  if (posCount > 0) {
    for (let p = 0; p < posCount && imgIdx < imageCount; p++) {
      insertions.push({ pos: positions[p], img: imageEntries[imgIdx] })
      imgIdx++

      // If more images than positions, double up on later positions
      if (p === posCount - 1 && imgIdx < imageCount) {
        while (imgIdx < imageCount) {
          insertions.push({ pos: positions[p], img: imageEntries[imgIdx] })
          imgIdx++
        }
      }
    }
  } else {
    // No h2+body pattern found, insert before ending
    const endingPos = content.lastIndexOf("type: 'ending'")
    if (endingPos > 0) {
      // Find the { before type: 'ending'
      let bracePos = endingPos
      while (bracePos > 0 && content[bracePos] !== '{') bracePos--
      for (const img of imageEntries) {
        insertions.push({ pos: bracePos, img })
      }
    }
  }

  // Sort by position descending and insert
  insertions.sort((a, b) => b.pos - a.pos)

  for (const ins of insertions) {
    const imgSection = `,\n    { type: 'image', src: '${ins.img.localPath}', alt: '${ins.img.alt.replace(/'/g, "\\'")}', caption: '${ins.img.caption.replace(/'/g, "\\'")}' }`
    content = content.slice(0, ins.pos) + imgSection + content.slice(ins.pos)
  }

  fs.writeFileSync(postPath, content)
  return insertions.length
}

async function processPost(postId, tistorySlug, title) {
  const url = TISTORY_BASE + encodeURIComponent(tistorySlug).replace(/%2D/g, '-')

  console.log(`[${postId}] Fetching: ${tistorySlug.substring(0, 50)}...`)

  let html
  try {
    html = await fetchPage(url)
  } catch (e) {
    console.log(`[${postId}] SKIP: fetch failed (${e.message})`)
    return { id: postId, status: 'fetch_failed', images: 0 }
  }

  const images = extractImages(html)
  if (images.length === 0) {
    console.log(`[${postId}] SKIP: no images found`)
    return { id: postId, status: 'no_images', images: 0 }
  }

  console.log(`[${postId}] Found ${images.length} images, downloading...`)

  const imageEntries = []
  for (let i = 0; i < images.length; i++) {
    const ext = getImageExtension(images[i].src)
    const filename = `post${postId}_img${i + 1}${ext}`
    const filepath = path.join(IMAGE_DIR, filename)

    try {
      await downloadImage(images[i].src, filepath)
      const stats = fs.statSync(filepath)
      if (stats.size < 1000) {
        // Too small, probably an error
        fs.unlinkSync(filepath)
        continue
      }
      imageEntries.push({
        localPath: '/images/' + filename,
        alt: images[i].alt || title || '',
        caption: 'ⓒ R의 필름공장',
      })
    } catch (e) {
      console.log(`[${postId}]   img${i + 1} download failed: ${e.message}`)
    }
  }

  if (imageEntries.length === 0) {
    console.log(`[${postId}] SKIP: all downloads failed`)
    return { id: postId, status: 'download_failed', images: 0 }
  }

  // Update post file
  const inserted = updatePostFile(postId, imageEntries)
  console.log(`[${postId}] OK: ${imageEntries.length} downloaded, ${inserted} inserted`)

  return { id: postId, status: 'ok', images: imageEntries.length }
}

async function main() {
  const args = process.argv.slice(2)
  let startId = 51, endId = 474

  if (args.length === 2) {
    startId = parseInt(args[0])
    endId = parseInt(args[1])
  }

  // Load posts data
  const posts = require(DATA_FILE)

  // Find posts that need images (only SVG, no real images)
  const needsImages = []
  for (let id = startId; id <= endId; id++) {
    const meta = posts.find(p => p.id === id)
    if (!meta || !meta.tistorySlug) continue

    try {
      const mod = require(path.join(POSTS_DIR, id + '.js'))
      const post = mod.default || mod
      const realImages = post.sections.filter(s =>
        s.type === 'image' && s.src && !s.src.endsWith('.svg')
      )
      // Check if image files actually exist
      const existingImages = realImages.filter(img =>
        fs.existsSync(path.join(__dirname, '..', 'public', img.src))
      )
      if (existingImages.length < 2) {
        needsImages.push({ id, tistorySlug: meta.tistorySlug, title: meta.title })
      }
    } catch (e) {
      needsImages.push({ id, tistorySlug: meta.tistorySlug, title: meta.title })
    }
  }

  console.log(`\n=== Tistory Image Crawler ===`)
  console.log(`Range: ${startId}-${endId}`)
  console.log(`Posts needing images: ${needsImages.length}`)
  console.log(`Delay: ${DELAY_MS}ms between requests\n`)

  const results = { ok: 0, no_images: 0, fetch_failed: 0, download_failed: 0 }

  for (const post of needsImages) {
    const result = await processPost(post.id, post.tistorySlug, post.title)
    results[result.status] = (results[result.status] || 0) + 1
    await sleep(DELAY_MS)
  }

  console.log(`\n=== Results ===`)
  console.log(`OK: ${results.ok}`)
  console.log(`No images: ${results.no_images}`)
  console.log(`Fetch failed: ${results.fetch_failed}`)
  console.log(`Download failed: ${results.download_failed}`)
}

main().catch(console.error)
