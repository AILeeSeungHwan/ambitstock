import AdUnit from './AdUnit'

/* ─── 섹션 렌더러
   규칙:
   1. 포스트 파일 내부의 { type:'ad' } 섹션은 무시 (새 자동 배치로 통일)
   2. 상단 광고 2개: [slug].js 에서 SummaryBox 직후 렌더링
   3. h2마다: 광고 1개
   4. h2 없는 페이지: 1/3, 2/3 지점에 광고 2개 보장
─── */
/* ─── 광고 배치 전략
   1번째 h2 뒤 → 인아티클 (slot: 4449961645)
   2번째 h2 뒤 → 멀티플렉스 (slot: 6297515693, format: autorelaxed)
   3번째 h2 뒤 → 인아티클
   4번째 h2 뒤 → 스킵
   5번째 h2 뒤 → 인아티클
   … (홀수 h2만 인아티클, 2번째만 멀티플렉스)
   상단 1개 (eager) + 본문 최대 4개 = 총 5개 한도
─── */
export function renderSections(sections, TOC) {
  const filtered = sections.filter(Boolean)
  const elements = []
  let h2Count = 0
  let adCount = 0
  const MAX_INLINE_ADS = 4

  for (let i = 0; i < filtered.length; i++) {
    const section = filtered[i]

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

      if (adCount < MAX_INLINE_ADS) {
        if (h2Count === 2) {
          // 두 번째 h2 → 멀티플렉스 (네이티브 추천 광고)
          elements.push(<AdUnit key={'ad-multiplex-' + i} slot="6297515693" format="autorelaxed" />)
          adCount++
        } else if (h2Count % 2 === 1) {
          // 홀수 h2 (1, 3, 5…) → 인아티클
          elements.push(<AdUnit key={'ad-h2-' + i} slot="4449961645" format="fluid" layout="in-article" />)
          adCount++
        }
      }
      continue
    }

    elements.push(renderSection(section, i))
  }

  // h2 없는 페이지 → 인아티클 1개 (중간)
  if (h2Count === 0) {
    const total = elements.length
    const idx = Math.floor(total / 2)
    elements.splice(idx, 0, <AdUnit key="ad-fallback-mid" slot="4449961645" format="fluid" layout="in-article" />)
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
