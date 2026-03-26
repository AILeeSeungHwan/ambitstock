const SPOILER_LEVELS = {
  none: { label: '스포일러 없음', color: '#10B981', icon: '🟢' },
  mild: { label: '약간의 스포일러', color: '#F59E0B', icon: '🟡' },
  heavy: { label: '강한 스포일러', color: '#EF4444', icon: '🔴' },
}

function SpoilerBadge({ level }) {
  const s = SPOILER_LEVELS[level]
  if (!s) return null

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600,
      padding: '3px 10px', borderRadius: 4,
      background: s.color + '15',
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      <span>{s.icon}</span>
      {s.label}
    </span>
  )
}

module.exports = SpoilerBadge
module.exports.SPOILER_LEVELS = SPOILER_LEVELS
