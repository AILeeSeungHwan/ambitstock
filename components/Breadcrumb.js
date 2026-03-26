function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="breadcrumb" style={{
      fontSize: 12, marginBottom: 16, display: 'flex',
      alignItems: 'center', gap: 6, flexWrap: 'wrap',
      opacity: 0.5,
    }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
          {item.href ? (
            <a href={item.href} style={{
              textDecoration: 'none', color: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {item.label}
            </a>
          ) : (
            <span style={{ fontWeight: 600 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

module.exports = Breadcrumb
