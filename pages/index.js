import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { FeaturedCard, ListCard } from '../components/PostCard'
import AdUnit from '../components/AdUnit'
import PageTracker from '../components/PageTracker'

const POSTS_PER_PAGE = 10

export async function getStaticProps() {
  const posts = require('../data/posts').default
  const postsWithThumbnail = posts.map(post => {
    if (post.thumbnail) return post
    try {
      const mod = require('../posts/' + post.id + '.js')
      const postData = mod.default || mod
      const firstImage = postData.sections.find(s => s.type === 'image')
      return { ...post, thumbnail: firstImage ? firstImage.src : null }
    } catch (e) {
      return post
    }
  })
  const catCount = {}
  postsWithThumbnail.forEach(p => {
    catCount[p.category] = (catCount[p.category] || 0) + 1
  })
  return { props: { posts: postsWithThumbnail, catCount } }
}

export default function Home({ posts, catCount }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCat, setSelectedCat] = useState(null)

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [posts])

  const filtered = useMemo(() => {
    if (!selectedCat) return sorted
    return sorted.filter(p => p.category === selectedCat)
  }, [sorted, selectedCat])

  const featured = !selectedCat ? sorted[0] : null
  const listPosts = featured ? filtered.filter(p => p.id !== featured.id) : filtered

  const totalPages = Math.ceil(listPosts.length / POSTS_PER_PAGE)
  const paged = listPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const handleCat = (cat) => {
    setSelectedCat(cat === selectedCat ? null : cat)
    setCurrentPage(1)
  }

  const categories = Object.entries(catCount).sort((a, b) => b[1] - a[1])

  return (
    <Layout>
      <PageTracker slug="main" />

      {featured && (
        <section style={{ marginBottom: 40 }}>
          <FeaturedCard post={featured} />
        </section>
      )}

      <div className="main-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 40,
        alignItems: 'flex-start',
      }}>
        <div>
          <div className="mobile-cats" style={{
            display: 'none',
            gap: 8, marginBottom: 24,
            overflowX: 'auto', paddingBottom: 8,
            WebkitOverflowScrolling: 'touch',
          }}>
            <button onClick={() => handleCat(null)} style={mobileCatBtn(!selectedCat)}>
              전체
            </button>
            {categories.map(([cat]) => (
              <button key={cat} onClick={() => handleCat(cat)} style={mobileCatBtn(selectedCat === cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 8, paddingBottom: 16, borderBottom: '2px solid var(--text-color, #1a1a2e)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              {selectedCat || '최신 포스팅'}
            </h2>
            <span style={{ fontSize: 13, opacity: 0.4 }}>
              {filtered.length}개의 글
            </span>
          </div>

          {paged.map(post => (
            <ListCard key={post.id} post={post} />
          ))}

          {paged.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.4 }}>
              <p style={{ fontSize: 14 }}>해당 카테고리에 포스팅이 없습니다.</p>
            </div>
          )}

          <AdUnit slot="6297515693" format="auto" style={{ marginTop: 24 }} />

          {totalPages > 1 && (
            <nav style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 4, marginTop: 32, flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={pageBtn(false, currentPage === 1)}
              >
                &larr;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} style={pageBtn(page === currentPage, false)}>
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={pageBtn(false, currentPage === totalPages)}
              >
                &rarr;
              </button>
            </nav>
          )}
        </div>

        <aside className="sidebar" style={{ position: 'sticky', top: 72 }}>
          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: 12, padding: 20,
            border: '1px solid var(--border-color, #eee)',
            marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px', opacity: 0.5, letterSpacing: 0.5 }}>
              카테고리
            </h3>
            <button onClick={() => handleCat(null)} style={sidebarCatBtn(!selectedCat)}>
              <span>전체</span>
              <span style={{ opacity: 0.4 }}>{posts.length}</span>
            </button>
            {categories.map(([cat, count]) => (
              <button key={cat} onClick={() => handleCat(cat)} style={sidebarCatBtn(selectedCat === cat)}>
                <span>{cat}</span>
                <span style={{ opacity: 0.4 }}>{count}</span>
              </button>
            ))}
          </div>

          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: 12, padding: 20,
            border: '1px solid var(--border-color, #eee)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px', opacity: 0.5, letterSpacing: 0.5 }}>
              추천 포스팅
            </h3>
            {sorted.slice(0, 5).map((post, i) => (
              <a key={post.id} href={'/' + post.slug + '/'} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 0', textDecoration: 'none', color: 'inherit',
                borderBottom: i < 4 ? '1px solid var(--border-color, #f0f0f0)' : 'none',
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 800, opacity: 0.15, minWidth: 20,
                  lineHeight: '20px',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 500, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {post.title}
                </span>
              </a>
            ))}
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .sidebar { display: none !important; }
          .mobile-cats { display: flex !important; }
        }
      `}</style>
    </Layout>
  )
}

function pageBtn(active, disabled) {
  return {
    width: 36, height: 36, borderRadius: '50%',
    border: active ? 'none' : '1px solid var(--border-color, rgba(128,128,128,0.15))',
    background: active ? 'var(--primary-color, #e50914)' : 'transparent',
    color: active ? '#fff' : 'inherit',
    fontSize: 13, fontWeight: active ? 700 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.25 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  }
}

function sidebarCatBtn(active) {
  return {
    display: 'flex', justifyContent: 'space-between', width: '100%',
    padding: '8px 10px', marginBottom: 2, borderRadius: 8,
    border: 'none', background: active ? 'var(--primary-color, #e50914)11' : 'transparent',
    color: 'inherit', fontSize: 13, fontWeight: active ? 700 : 400,
    cursor: 'pointer', transition: 'background 0.15s',
    textAlign: 'left',
  }
}

function mobileCatBtn(active) {
  return {
    padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
    border: active ? '2px solid var(--primary-color, #e50914)' : '1px solid var(--border-color, #ddd)',
    background: active ? 'var(--primary-color, #e50914)' : 'transparent',
    color: active ? '#fff' : 'inherit',
    fontSize: 12, fontWeight: active ? 700 : 400,
    cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
  }
}
