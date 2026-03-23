#!/usr/bin/env node
/**
 * 포스트 구조 자동 수정 스크립트
 * - CTA를 ending 앞으로 이동
 * - body/intro 안의 <h3> 태그를 h2 섹션으로 분리
 * - 연속 광고 제거
 * - ending 없는 포스트에 기본 ending 추가
 *
 * 내용은 절대 변경하지 않음. 구조만 재배치.
 */

const fs = require('fs')
const path = require('path')

const POSTS_DIR = path.join(__dirname, '..', 'posts')

function fixPost(id) {
  const filepath = path.join(POSTS_DIR, id + '.js')
  let mod
  try {
    delete require.cache[require.resolve(filepath)]
    mod = require(filepath)
  } catch(e) { return null }

  const post = mod.default || mod
  let sections = Array.from(post.sections).filter(Boolean)
  let changed = false

  // 1. Split h3 tags out of body/intro sections into h2 + body sections
  const newSections = []
  for (const section of sections) {
    if ((section.type === 'body' || section.type === 'intro') && section.html && section.html.includes('<h3>')) {
      // Split by <h3> tags
      const parts = section.html.split(/<h3>/gi)

      if (parts[0].trim()) {
        // Content before first h3
        const cleanedFirst = parts[0].replace(/<\/h3>/gi, '').trim()
        if (cleanedFirst.replace(/<[^>]*>/g, '').trim().length > 10) {
          newSections.push({ type: section.type, html: cleanedFirst })
        }
      }

      for (let i = 1; i < parts.length; i++) {
        const h3Content = parts[i]
        const h3EndMatch = h3Content.match(/^(.*?)<\/h3>/si)

        if (h3EndMatch) {
          const h3Text = h3EndMatch[1].replace(/<[^>]*>/g, '').trim()
          const bodyAfter = h3Content.substring(h3EndMatch[0].length).trim()

          if (h3Text) {
            // Create h2 section
            const h2Id = 'section-' + h3Text.replace(/[^a-zA-Z0-9가-힣]/g, '-').substring(0, 30).toLowerCase()
            newSections.push({
              type: 'h2',
              id: h2Id,
              text: h3Text,
              gradientStyle: 'linear-gradient(135deg, #7c4dff, #448aff)'
            })
          }

          if (bodyAfter.replace(/<[^>]*>/g, '').trim().length > 10) {
            newSections.push({ type: 'body', html: bodyAfter })
          }
        } else {
          // No closing h3 tag, just add as body
          const cleaned = h3Content.trim()
          if (cleaned.replace(/<[^>]*>/g, '').trim().length > 10) {
            newSections.push({ type: 'body', html: cleaned })
          }
        }
      }
      changed = true
    } else {
      newSections.push(section)
    }
  }
  sections = newSections

  // 2. Move CTAs that are before intro/body to after the last body (before ending)
  const ctasBefore = []
  const rest = []
  let foundContent = false

  for (const section of sections) {
    if (!foundContent && section.type === 'cta') {
      ctasBefore.push(section)
    } else {
      if (section.type === 'intro' || section.type === 'body' || section.type === 'h2') {
        foundContent = true
      }
      rest.push(section)
    }
  }

  if (ctasBefore.length > 0) {
    // Insert CTAs before ending or at end
    const endingIdx = rest.findIndex(s => s.type === 'ending')
    if (endingIdx >= 0) {
      rest.splice(endingIdx, 0, ...ctasBefore)
    } else {
      rest.push(...ctasBefore)
    }
    sections = rest
    changed = true
  }

  // 3. Remove consecutive ads (keep first of each pair)
  const deduped = []
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].type === 'ad' && i > 0 && deduped[deduped.length - 1]?.type === 'ad') {
      changed = true
      continue // skip consecutive ad
    }
    deduped.push(sections[i])
  }
  sections = deduped

  // 4. Add ending if missing
  const hasEnding = sections.some(s => s.type === 'ending')
  if (!hasEnding) {
    // Insert before last ad if exists, otherwise at end
    const lastAdIdx = sections.length - 1
    if (sections[lastAdIdx]?.type === 'ad') {
      sections.splice(lastAdIdx, 0, { type: 'ending', html: '<p>이 글이 도움이 되셨다면 관련 포스팅도 확인해보세요.</p>' })
    } else {
      sections.push({ type: 'ending', html: '<p>이 글이 도움이 되셨다면 관련 포스팅도 확인해보세요.</p>' })
    }
    changed = true
  }

  // 5. Ensure ad count is max 3
  let adCount = sections.filter(s => s.type === 'ad').length
  while (adCount > 3) {
    // Remove last ad
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].type === 'ad') {
        sections.splice(i, 1)
        adCount--
        changed = true
        break
      }
    }
  }

  if (!changed) return null

  // Rebuild the file
  const lines = ['const post = {', '  id: ' + id + ',', '  sections: [']

  for (const s of sections) {
    if (s.type === 'h2') {
      lines.push("    { type: 'h2', id: " + JSON.stringify(s.id) + ", text: " + JSON.stringify(s.text) + ", gradientStyle: " + JSON.stringify(s.gradientStyle || 'linear-gradient(135deg, #7c4dff, #448aff)') + " },")
    } else if (s.type === 'ad') {
      lines.push("    { type: 'ad', slot: '" + (s.slot || '6297515693') + "', format: '" + (s.format || 'auto') + "' },")
    } else if (s.type === 'toc') {
      lines.push("    { type: 'toc' },")
    } else if (s.type === 'image') {
      lines.push("    { type: 'image', src: " + JSON.stringify(s.src) + ", alt: " + JSON.stringify(s.alt || '') + ", caption: " + JSON.stringify(s.caption || '') + " },")
    } else if (s.type === 'cta') {
      lines.push("    { type: 'cta', href: " + JSON.stringify(s.href || '#') + ", text: " + JSON.stringify(s.text || '') + " },")
    } else {
      // intro, body, ending - preserve html exactly
      lines.push("    { type: '" + s.type + "', html: " + JSON.stringify(s.html || '') + " },")
    }
  }

  lines.push('  ]')
  lines.push('}')
  lines.push('')
  lines.push('module.exports = post')
  lines.push('')

  fs.writeFileSync(filepath, lines.join('\n'))
  return true
}

// Run
const args = process.argv.slice(2)
let startId = 51, endId = 474
if (args.length === 2) {
  startId = parseInt(args[0])
  endId = parseInt(args[1])
}

let fixed = 0, failed = 0
for (let id = startId; id <= endId; id++) {
  const result = fixPost(id)
  if (result === true) {
    fixed++
  } else if (result === null) {
    // no change needed or file not found
  }
}

console.log('Fixed:', fixed, 'posts')

// Verify syntax
let syntaxFails = 0
for (let id = startId; id <= endId; id++) {
  try {
    const { execSync } = require('child_process')
    execSync('node --check posts/' + id + '.js', { stdio: 'pipe' })
  } catch(e) {
    syntaxFails++
    console.log('SYNTAX FAIL:', id)
  }
}
console.log('Syntax failures:', syntaxFails)
