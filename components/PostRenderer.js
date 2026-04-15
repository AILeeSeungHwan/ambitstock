import AdUnit from './AdUnit'

/* ─── 상단 광고 2개 나란히 ─── */
function TopAdsRow({ adKey }) {
  return (
    <div
      key={adKey}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 8,
        margin: '20px 0',
      }}
    >
      <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
      <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
    </div>
  )
}

/* ─── 섹션 렌더러 (h2마다 광고 + TOC 앞 상단 광고 2개 나란히) ─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  let h2Count = 0
  let tocSeen = false
  let topAdInserted = false

  // 포스트 파일에 기존 ad 섹션이 있으면 자동 삽입 비활성
  const existingAdCount = filtered.filter(s => s.type === 'ad').length
  const autoAdsEnabled = existingAdCount === 0

  for (let i = 0; i < filtered.length; i++) {
    const section = filtered[i]

    // 기존 ad 섹션 그대로 렌더링
    if (section.type === 'ad') {
      elements.push(<AdUnit key={'ad-existing-' + i} slot={section.slot || '6297515693'} format={section.format || 'auto'} />)
      continue
    }

    // TOC 앞에 상단 광고 2개 나란히
    if (section.type === 'toc') {
      if (!topAdInserted && autoAdsEnabled) {
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

    // h2마다 광고 1개 삽입
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
      if (autoAdsEnabled) {
        elements.push(<AdUnit key={'ad-h2-' + i} slot="6297515693" format="auto" />)
      }
      continue
    }

    // TOC 없이 intro로 시작할 때 → intro 뒤에 상단 광고 2개 나란히
    if (!topAdInserted && !tocSeen && section.type === 'intro' && autoAdsEnabled) {
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

  // h2 없는 페이지 — 중간 광고 2개 반드시 보장
  if (h2Count === 0 && autoAdsEnabled) {
    const total = elements.length
    const idx1 = Math.floor(total / 3)
    const idx2 = Math.floor((total * 2) / 3)
    // 뒤 인덱스부터 삽입해야 앞 인덱스가 밀리지 않음
    elements.splice(idx2, 0, <AdUnit key={'ad-fallback-2'} slot="6297515693" format="auto" />)
    elements.splice(idx1, 0, <AdUnit key={'ad-fallback-1'} slot="6297515693" format="auto" />)
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
