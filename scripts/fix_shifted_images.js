#!/usr/bin/env node
/**
 * 크롤러가 이미지를 역순 삽입하면서 1칸씩 밀린 포스트를 수정한다.
 *
 * 문제 패턴:
 * - 크롤러가 h2+body 뒤에 이미지를 삽입할 때, 첫 번째 h2+body 뒤에 여분 이미지가 들어감
 * - 마지막에 이미지 2개가 연속으로 옴 (원래 마지막 이미지 + 밀린 이미지)
 *
 * 수정 방법:
 * - 첫 번째 크롤러 이미지를 제거 (여분)
 * - 마지막 연속 이미지 중 첫 번째를 제거 (밀린 것)
 * - 결과적으로 이미지가 올바른 위치로 정렬됨
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

  // Find crawler-inserted images (_imgN pattern)
  const crawlerImgIndices = []
  sections.forEach((s, i) => {
    if (s.type === 'image' && s.src && s.src.match(/_img\d+\./)) {
      crawlerImgIndices.push(i)
    }
  })

  if (crawlerImgIndices.length < 2) return null

  // Check for consecutive images at the end
  let lastContentIdx = sections.length - 1
  while (lastContentIdx >= 0 && ['ad', 'cta', 'ending'].includes(sections[lastContentIdx].type)) {
    lastContentIdx--
  }

  if (lastContentIdx < 1) return null
  if (sections[lastContentIdx].type !== 'image' || sections[lastContentIdx - 1].type !== 'image') return null
  if (!sections[lastContentIdx].src?.match(/_img\d+\./) || !sections[lastContentIdx - 1].src?.match(/_img\d+\./)) return null

  // Strategy: remove the first crawler image (extra one that shifted everything)
  // and remove one of the last two consecutive images (the shifted duplicate)

  const firstCrawlerIdx = crawlerImgIndices[0]
  const secondLastImgIdx = lastContentIdx - 1

  // Remove in reverse order to maintain indices
  const toRemove = new Set()
  toRemove.add(firstCrawlerIdx)
  toRemove.add(secondLastImgIdx)

  // If firstCrawlerIdx === secondLastImgIdx, only remove once
  sections = sections.filter((_, i) => !toRemove.has(i))

  // Rebuild file
  const lines = ['const post = {', '  id: ' + id + ',', '  sections: [']

  for (const s of sections) {
    if (s.type === 'h2') {
      lines.push('    { type: \'h2\', id: ' + JSON.stringify(s.id) + ', text: ' + JSON.stringify(s.text) + ', gradientStyle: ' + JSON.stringify(s.gradientStyle || 'linear-gradient(135deg, #7c4dff, #448aff)') + ' },')
    } else if (s.type === 'ad') {
      lines.push('    { type: \'ad\', slot: \'' + (s.slot || '6297515693') + '\', format: \'' + (s.format || 'auto') + '\' },')
    } else if (s.type === 'toc') {
      lines.push('    { type: \'toc\' },')
    } else if (s.type === 'image') {
      lines.push('    { type: \'image\', src: ' + JSON.stringify(s.src) + ', alt: ' + JSON.stringify(s.alt || '') + ', caption: ' + JSON.stringify(s.caption || '') + ' },')
    } else if (s.type === 'cta') {
      lines.push('    { type: \'cta\', href: ' + JSON.stringify(s.href || '#') + ', text: ' + JSON.stringify(s.text || '') + ' },')
    } else {
      lines.push('    { type: \'' + s.type + '\', html: ' + JSON.stringify(s.html || '') + ' },')
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

// Also handle post 63 separately (special case with img11+img10)
// and post 87 (img7+img6)

let fixed = 0
for (let id = 51; id <= 474; id++) {
  const result = fixPost(id)
  if (result) fixed++
}

console.log('Fixed:', fixed, 'posts')

// Verify syntax
const { execSync } = require('child_process')
let fails = 0
for (let id = 51; id <= 474; id++) {
  try {
    execSync('node --check posts/' + id + '.js', { stdio: 'pipe' })
  } catch(e) {
    fails++
    console.log('SYNTAX FAIL:', id)
  }
}
console.log('Syntax failures:', fails)
