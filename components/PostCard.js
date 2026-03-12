const CATEGORY_COLORS = {
  '영화추천': { bg: '#e3f2fd', text: '#1565c0', icon: '🎬' },
  '해외반응후기': { bg: '#ffebee', text: '#c62828', icon: '🌍' },
  '마블': { bg: '#ede7f6', text: '#4527a0', icon: '🦸' },
  '드라마': { bg: '#f3e5f5', text: '#7b1fa2', icon: '📺' },
  '애니메이션': { bg: '#e0f2f1', text: '#00695c', icon: '🎨' },
}

function PlaceholderSVG({ category, size }) {
  const cat = CATEGORY_COLORS[category] || { bg: '#f5f5f5', text: '#666', icon: '🎬' }
  return (
    <div style={{
      background: 'linear-gradient(135deg, ' + cat.bg + ', ' + cat.bg + 'cc)',
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: size === 'large' ? 56 : 36 }}>{cat.icon}</span>
    </div>
  )
}

function truncate(text, maxLen) {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '...'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  return months[d.getMonth()] + ' ' + d.getDate() + '일, ' + d.getFullYear()
}

/* ─── Featured Card (가로형, 메인 상단) ─── */
export function FeaturedCard({ post }) {
  const cat = CATEGORY_COLORS[post.category] || { bg: '#f5f5f5', text: '#666' }

  return (
    <a href={'/' + post.slug + '/'} className="featured-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 0,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--border-color, #dee2e6)',
        background: 'var(--card-bg, #fff)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        minHeight: 280,
      }}>
        {/* 이미지 */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} loading="lazy" style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }} />
          ) : (
            <PlaceholderSVG category={post.category} size="large" />
          )}
        </div>
        {/* 텍스트 */}
        <div style={{
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <span style={{
            display: 'inline-block', background: cat.bg, color: cat.text,
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
            marginBottom: 14, alignSelf: 'flex-start',
          }}>{post.category}</span>
          <h2 style={{
            fontSize: 22, fontWeight: 800, lineHeight: 1.35, margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{post.title}</h2>
          <p style={{
            fontSize: 14, opacity: 0.55, lineHeight: 1.6, margin: '0 0 16px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{truncate(post.description, 100)}</p>
          <time style={{ fontSize: 12, opacity: 0.35 }}>{formatDate(post.date)}</time>
        </div>
      </article>

      <style jsx>{`
        .featured-card:hover article { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .featured-card:hover img { transform: scale(1.03); }
        @media (max-width: 768px) {
          .featured-card article { grid-template-columns: 1fr !important; min-height: auto !important; }
          .featured-card article > div:first-child { height: 200px; }
          .featured-card article > div:last-child { padding: 20px !important; }
          .featured-card h2 { font-size: 18px !important; }
        }
      `}</style>
    </a>
  )
}

/* ─── List Card (가로형, 리스트) ─── */
export function ListCard({ post }) {
  const cat = CATEGORY_COLORS[post.category] || { bg: '#f5f5f5', text: '#666' }

  return (
    <a href={'/' + post.slug + '/'} className="list-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article style={{
        display: 'flex',
        gap: 20,
        padding: '20px 0',
        borderBottom: '1px solid var(--border-color, #eee)',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}>
        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
              background: cat.bg, color: cat.text,
            }}>{post.category}</span>
            <time style={{ fontSize: 11, opacity: 0.35 }}>{formatDate(post.date)}</time>
          </div>
          <h3 style={{
            fontSize: 16, fontWeight: 700, lineHeight: 1.4, margin: '0 0 6px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{post.title}</h3>
          <p style={{
            fontSize: 13, opacity: 0.5, lineHeight: 1.5, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{truncate(post.description, 100)}</p>
        </div>
        {/* 썸네일 */}
        <div style={{
          width: 160, height: 108, flexShrink: 0, borderRadius: 10, overflow: 'hidden',
        }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} loading="lazy" style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }} />
          ) : (
            <PlaceholderSVG category={post.category} size="small" />
          )}
        </div>
      </article>

      <style jsx>{`
        .list-card:hover h3 { color: var(--primary-color, #e50914); }
        .list-card:hover img { transform: scale(1.05); }
        @media (max-width: 600px) {
          .list-card article > div:last-child { width: 100px !important; height: 72px !important; }
          .list-card h3 { font-size: 14px !important; }
        }
      `}</style>
    </a>
  )
}

/* ─── Grid Card (세로형, 기존 호환) ─── */
export default function PostCard({ post }) {
  const cat = CATEGORY_COLORS[post.category] || { bg: '#f5f5f5', text: '#666' }

  return (
    <a href={'/' + post.slug + '/'} className="grid-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--border-color, #eee)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer', height: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} loading="lazy" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover', transition: 'transform 0.4s ease',
            }} />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <PlaceholderSVG category={post.category} size="small" />
            </div>
          )}
        </div>
        <div style={{
          padding: '14px 16px', flex: 1,
          display: 'flex', flexDirection: 'column', minHeight: 120,
        }}>
          <span style={{
            display: 'inline-block', background: cat.bg, color: cat.text,
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            marginBottom: 8, alignSelf: 'flex-start',
          }}>{post.category}</span>
          <h3 style={{
            fontSize: 14, fontWeight: 700, lineHeight: 1.4, margin: '0 0 6px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{post.title}</h3>
          <p style={{
            fontSize: 12, opacity: 0.5, lineHeight: 1.5, margin: '0 0 auto',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{truncate(post.description, 80)}</p>
          <time style={{ fontSize: 10, opacity: 0.3, marginTop: 8 }}>{formatDate(post.date)}</time>
        </div>
      </article>

      <style jsx>{`
        .grid-card:hover article { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
        .grid-card:hover img { transform: scale(1.04); }
      `}</style>
    </a>
  )
}
