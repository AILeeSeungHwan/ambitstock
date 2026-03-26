const CONTENT_TYPES = {
  '해석': { bg: '#8B5CF6', text: '#fff', icon: '🧠' },
  '추천': { bg: '#F59E0B', text: '#fff', icon: '⭐' },
  '후기': { bg: '#10B981', text: '#fff', icon: '💬' },
  '해외반응': { bg: '#3B82F6', text: '#fff', icon: '🌍' },
  '정보': { bg: '#6B7280', text: '#fff', icon: '📋' },
  '분석': { bg: '#EF4444', text: '#fff', icon: '📊' },
}

function ContentTypeBadge({ type, size = 'small' }) {
  const ct = CONTENT_TYPES[type]
  if (!ct) return null

  const isSmall = size === 'small'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: isSmall ? 3 : 4,
      fontSize: isSmall ? 10 : 11,
      fontWeight: 700,
      padding: isSmall ? '2px 6px' : '3px 10px',
      borderRadius: 4,
      background: ct.bg,
      color: ct.text,
      letterSpacing: '0.02em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      {!isSmall && <span style={{ fontSize: isSmall ? 10 : 12 }}>{ct.icon}</span>}
      {type}
    </span>
  )
}

module.exports = ContentTypeBadge
module.exports.CONTENT_TYPES = CONTENT_TYPES
