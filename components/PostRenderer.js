import AdUnit from './AdUnit'

/* ─── 섹션 렌더러 (h2 2개마다 광고 + toc 직후 상단 광고) ─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  let h2Count = 0
  let tocSeen = false
  let topAdInserted = false

  // 포스트 파일에 기존 ad 섹션이 몇 개나 있는지 세기 (중복 방지용)
  const existingAdCount = filtered.filter(s => s.type === 'ad').length

  // 기존 ad 섹션이 이미 있으면 자동 삽입 비활성 (단, toc 뒤 상단 광고는 항상 보장)
  const autoAdsEnabled = existingAdCount === 0

  for (let i = 0; i < filtered.length; i++) {
    const section = filtered[i]

    // 포스트 파일의 ad 섹션 — 기존 광고는 그대로 렌더링
    if (section.type === 'ad') {
      elements.push(<AdUnit key={'ad-existing-' + i} slot={section.slot || '6297515693'} format={section.format || 'auto'} />)
      continue
    }

    if (section.type === 'toc') {
      elements.push(<TOC key={'toc-' + i} sections={filtered} />)
      tocSeen = true
      // toc 다음에 상단 광고 보장 (자동모드이거나, 기존 ad가 없는 경우)
      if (!topAdInserted) {
        elements.push(<AdUnit key={'ad-top'} slot="6297515693" format="auto" />)
        topAdInserted = true
      }
      continue
    }

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

      // h2 2개마다 광고 삽입 (자동모드 전용, toc 직후 상단 광고 이미 삽입된 것 제외)
      if (autoAdsEnabled && h2Count % 2 === 0) {
        elements.push(<AdUnit key={'ad-h2-' + i} slot="6297515693" format="auto" />)
      }
      continue
    }

    // toc 없이 바로 본문이 시작될 경우 첫 h2 전에 상단 광고 삽입
    if (!topAdInserted && !tocSeen && section.type === 'intro') {
      elements.push(renderSection(section, i))
      elements.push(<AdUnit key={'ad-top-no-toc'} slot="6297515693" format="auto" />)
      topAdInserted = true
      continue
    }

    elements.push(renderSection(section, i))
  }

  // h2가 없고 toc도 없는 경우 — 중간에 광고 1개 보장
  if (!topAdInserted && autoAdsEnabled) {
    const midIdx = Math.floor(elements.length / 2)
    elements.splice(midIdx, 0, <AdUnit key={'ad-mid-fallback'} slot="6297515693" format="auto" />)
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
