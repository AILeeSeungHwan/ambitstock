import AdUnit from './AdUnit'

/* ─── 섹션 렌더러
   규칙:
   1. 포스트 파일 내부의 { type:'ad' } 섹션은 무시 (새 자동 배치로 통일)
   2. TOC 있는 포스트: TOC 직전에 광고 2개 나란히
   3. TOC 없는 포스트: intro 뒤에 광고 2개 나란히
   4. h2마다: 광고 1개
   5. h2 없는 페이지: 1/3, 2/3 지점에 광고 2개 보장
─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  let h2Count = 0
  let tocSeen = false
  let topAdInserted = false

  // TOC가 있는 포스트인지 사전 탐지
  const hasToc = filtered.some(s => s.type === 'toc')

  for (let i = 0; i < filtered.length; i++) {
    const section = filtered[i]

    // 포스트 파일 내부 ad 섹션 → 무시 (자동 배치로 대체)
    if (section.type === 'ad') continue

    // ── TOC가 있는 포스트: TOC 직전에 광고 2개 ──
    if (section.type === 'toc') {
      if (!topAdInserted) {
        elements.push(
          <div key="ad-top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, margin: '20px 0' }}>
            <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
            <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
          </div>
        )
        topAdInserted = true
      }
      elements.push(<TOC key={'toc-' + i} sections={filtered} />)
      tocSeen = true
      continue
    }

    // h2마다 광고 1개
    if (section.type === 'h2') {
      h2Count++
      elements.push(
        <h2 key={'h2-' + i} id={section.id} style={{
          fontSize: 22, fontWeight: 800, margin: '48px 0 16px', lineHeight: 1.4,
          paddingTop: 16,
          ...(section.gradientStyle ? {
            background: section.gradientStyle, color: '#fff',
            padding: '16px 24px', borderRadius: 12, marginTop: 48,
          } : {}),
        }}>
          {section.text}
        </h2>
      )
      elements.push(<AdUnit key={'ad-h2-' + i} slot="6297515693" format="auto" />)
      continue
    }

    // ── TOC 없는 포스트: intro 뒤에 광고 2개 ──
    if (!hasToc && !topAdInserted && section.type === 'intro') {
      elements.push(renderSection(section, i))
      elements.push(
        <div key="ad-top-row-notoc" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, margin: '20px 0' }}>
          <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
          <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
        </div>
      )
      topAdInserted = true
      continue
    }

    elements.push(renderSection(section, i))
  }

  // h2 없는 페이지 → 1/3, 2/3 지점에 중간 광고 2개 보장
  if (h2Count === 0) {
    const total = elements.length
    const idx1 = Math.floor(total / 3)
    const idx2 = Math.floor((total * 2) / 3)
    elements.splice(idx2, 0, <AdUnit key="ad-fallback-2" slot="6297515693" format="auto" />)
    elements.splice(idx1, 0, <AdUnit key="ad-fallback-1" slot="6297515693" format="auto" />)
  }

  return elements
}

function renderSection(section, i) {
  switch (section.type) {
    case 'intro':
      return <div key={'intro-' + i} style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 24, opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: section.html }} />
    case 'cta':
      return (
        <a key={'cta-' + i} href={section.href} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', textAlign: 'center', padding: '14px 24px',
          background: 'linear-gradient(135deg, var(--primary-color, #e50914), var(--accent-color, #ff4d4d))',
          color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15,
          textDecoration: 'none', margin: '24px 0',
          boxShadow: '0 4px 16px rgba(229,9,20,0.25)',
        }}>
          {section.text}
        </a>
      )
    case 'body':
      return <div key={'body-' + i} className="post-body" style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: section.html }} />
    case 'image':
      return (
        <figure key={'img-' + i} style={{ margin: '32px 0', textAlign: 'center' }}>
          <img src={section.src} alt={section.alt || ''} style={{
            maxWidth: '100%', borderRadius: 10,
            border: '1px solid rgba(128,128,128,0.1)',
          }} loading="lazy" />
          {section.caption && (
            <figcaption style={{ fontSize: 12, opacity: 0.4, marginTop: 8, fontStyle: 'italic' }}>{section.caption}</figcaption>
          )}
        </figure>
      )
    case 'ending':
      return (
        <div key={'ending-' + i} style={{
          fontSize: 16, lineHeight: 1.9, marginTop: 32, padding: '24px',
          background: 'var(--secondary-color, rgba(229,9,20,0.04))', borderRadius: 12,
          borderLeft: '4px solid var(--primary-color, #e50914)',
        }} dangerouslySetInnerHTML={{ __html: section.html }} />
      )
    default:
      return null
  }
}
