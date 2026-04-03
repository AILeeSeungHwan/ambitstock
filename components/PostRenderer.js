import AdUnit from './AdUnit'

/* ─── 상단 2열 광고 ─── */
export function TopAdPair() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      margin: '20px 0 28px',
    }}>
      <AdUnit slot="6297515693" format="rectangle" />
      <AdUnit slot="6297515693" format="rectangle" />
    </div>
  )
}

/* ─── 섹션 렌더러 (h2 뒤 자동 광고 포함) ─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  let h2Count = 0

  for (let i = 0; i < filtered.length; i++) {
    const section = filtered[i]

    // 포스트 파일의 ad 섹션은 스킵 (자동 배치로 대체)
    if (section.type === 'ad') continue

    if (section.type === 'toc') {
      elements.push(<TOC key={'toc-' + i} sections={filtered} />)
      continue
    }

    if (section.type === 'h2') {
      h2Count++
      // h2 렌더링
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
      // 첫 번째 h2 뒤 + 이후 3개마다 광고 삽입
      if (h2Count === 1 || h2Count % 3 === 1) {
        elements.push(<AdUnit key={'ad-after-h2-' + i} slot="6297515693" format="auto" />)
      }
      continue
    }

    // 나머지 섹션 타입
    elements.push(renderSection(section, i))
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
