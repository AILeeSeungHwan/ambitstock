function SummaryBox({ sections }) {
  if (!sections || !Array.isArray(sections)) return null

  const h2s = sections.filter(function(s) { return s && s.type === 'h2' && s.text })
  if (h2s.length === 0) return null

  const items = h2s.slice(0, 3)

  return (
    <div style={{
      background: 'rgba(128,128,128,0.04)',
      borderLeft: '3px solid var(--primary-color, #e50914)',
      borderRadius: 10,
      padding: '20px 24px',
      margin: '0 0 32px',
    }}>
      <strong style={{
        fontSize: 14,
        fontWeight: 700,
        display: 'block',
        marginBottom: 14,
        opacity: 0.75,
        letterSpacing: 0.3,
      }}>
        {'\uD83D\uDCCB'} 이 글에서 다루는 것
      </strong>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}>
        {items.map(function(s, i) {
          return (
            <li key={i} style={{
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: i < items.length - 1 ? 6 : 0,
              opacity: 0.7,
              paddingLeft: 16,
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}>&bull;</span>
              {s.text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

module.exports = SummaryBox
