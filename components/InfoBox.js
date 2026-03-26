const ContentTypeBadge = require('./ContentTypeBadge')
const SpoilerBadge = require('./SpoilerBadge')

const PLATFORM_STYLES = {
  '넷플릭스': { icon: '🔴', color: '#e50914' },
  '디즈니플러스': { icon: '🏰', color: '#0057e7' },
  '티빙': { icon: '🟣', color: '#6b2fa0' },
  '쿠팡플레이': { icon: '🟠', color: '#ff6900' },
  '극장': { icon: '🎬', color: '#1a73e8' },
}

function InfoBox({ meta }) {
  if (!meta) return null

  const platform = meta.platform
  const contentType = meta.contentType
  const spoilerLevel = meta.spoilerLevel
  const ps = platform ? PLATFORM_STYLES[platform] : null

  const hasInfo = contentType || platform || (spoilerLevel && spoilerLevel !== 'none')
  if (!hasInfo) return null

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      background: 'rgba(128,128,128,0.04)',
      borderRadius: 10,
      border: '1px solid var(--border-color, rgba(128,128,128,0.1))',
      marginBottom: 20,
    }}>
      {contentType && <ContentTypeBadge type={contentType} size="medium" />}
      {platform && ps && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600,
          padding: '3px 10px', borderRadius: 4,
          background: ps.color + '12',
          color: ps.color,
        }}>
          <span>{ps.icon}</span>
          {platform}
        </span>
      )}
      {spoilerLevel && spoilerLevel !== 'none' && <SpoilerBadge level={spoilerLevel} />}
    </div>
  )
}

module.exports = InfoBox
