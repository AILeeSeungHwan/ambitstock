import AdUnit from './AdUnit'

/* ─── 섹션 렌더러 (h2 뒤에만 광고) ─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  const h2s = filtered.filter(s => s.type === 'h2')
  const totalH2 = h2s.length
  let h2Count = 0

  // h2 개수에 따라 광고 간격 결정: 최대 3개 광고
  // h2가 3개 이하: 첫 h2 뒤에만 1개
  // h2가 4~6개: 첫 h2, 마지막 h2 뒤 = 2개
  // h2가 7개 이상: 첫 h2, 중간, 마지막 = 3개
  function shouldInsertAd(count) {
    if (totalH2 <= 3) return count === 1
    if (totalH2 <= 6) return count === 1 || count === totalH2
    const mid = Math.ceil(totalH2 / 2)
    return count === 1 || count === mid || count === totalH2
  }

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
      if (shouldInsertAd(h2Count)) {
        elements.push(<AdUnit key={'ad-after-h2-' + i} slot="6297515693" format="auto" />)
      }
      continue
    }

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
