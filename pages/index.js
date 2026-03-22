import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import PostCard, { FeaturedCard, ListCard } from '../components/PostCard'
import AdUnit from '../components/AdUnit'
import PageTracker from '../components/PageTracker'
import getPostUrl from '../lib/getPostUrl'

const POSTS_PER_PAGE = 12

const MOODS = [
  { label: '혼자 밤에 몰입', icon: '🌙', tags: ['스릴러', '미스터리', '범죄', 'K스릴러', '심리스릴러'] },
  { label: '데이트 영화', icon: '💑', tags: ['로맨스', '로맨틱코미디', '감성', '멜로'] },
  { label: '가족과 함께', icon: '👨‍👩‍👧‍👦', tags: ['가족', '애니메이션', '디즈니', '감동', '전체관람가'] },
  { label: '웃고 싶을 때', icon: '😂', tags: ['코미디', '시트콤', '예능', '유머'] },
  { label: '생각할 거리', icon: '🧠', tags: ['결말해석', 'SF', '철학', '반전', '다큐'] },
  { label: '액션 한 판', icon: '💥', tags: ['액션', '블록버스터', '마블', 'MCU', '전쟁'] },
]

const OTT_SECTIONS = [
  { label: '넷플릭스', icon: '🔴', color: '#e50914', tags: ['넷플릭스', '넷플릭스신작', '넷플릭스추천', '넷플릭스드라마'] },
  { label: '디즈니+', icon: '🏰', color: '#0057e7', tags: ['디즈니', '마블', 'MCU', '디즈니플러스'] },
  { label: '티빙', icon: '🟣', color: '#6b2fa0', tags: ['티빙', '한국드라마', '예능'] },
  { label: '쿠팡플레이', icon: '🟠', color: '#ff6900', tags: ['쿠팡플레이', '쿠팡'] },
]

const CATEGORY_ICONS = {
  '영화추천': '🎬',
  '해외반응후기': '🌍',
  '마블': '🦸',
  '드라마': '📺',
  '애니메이션': '🎨',
}

export async function getStaticProps() {
  const posts = require('../data/posts').default || require('../data/posts')
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
  const trendPosts = postsWithThumbnail
    .filter(p => p.tags && p.tags.some(t => t === 'trend' || t === '트렌드' || t === '오늘의트렌드'))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
  return { props: { posts: postsWithThumbnail, catCount, trendPosts } }
}

export default function Home({ posts, catCount, trendPosts }) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [showAllPosts, setShowAllPosts] = useState(false)

  // URL query param으로 카테고리 선택 지원
  useEffect(() => {
    if (router.query.cat) {
      setSelectedCat(router.query.cat)
      setShowAllPosts(true)
    }
  }, [router.query.cat])

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [posts])

  // 카테고리 필터
  const filtered = useMemo(() => {
    if (!selectedCat) return sorted
    return sorted.filter(p => p.category === selectedCat)
  }, [sorted, selectedCat])

  // 무드 필터 (태그 기반)
  const moodFiltered = useMemo(() => {
    if (selectedMood === null) return []
    const mood = MOODS[selectedMood]
    if (!mood) return []
    return sorted.filter(p =>
      p.tags && p.tags.some(t => mood.tags.some(mt => t.toLowerCase().includes(mt.toLowerCase())))
    ).slice(0, 8)
  }, [sorted, selectedMood])

  // 카테고리별 최신 포스트
  const byCategory = useMemo(() => {
    const result = {}
    Object.keys(catCount).forEach(cat => {
      result[cat] = sorted.filter(p => p.category === cat).slice(0, 4)
    })
    return result
  }, [sorted, catCount])

  // 트렌딩 (고정 포스트 + 최신)
  const PINNED_IDS = [564]
  const pinned = PINNED_IDS.map(id => sorted.find(p => p.id === id)).filter(Boolean)
  const rest = sorted.filter(p => !PINNED_IDS.includes(p.id)).slice(0, 6 - pinned.length)
  const trending = [...pinned, ...rest]

  // 페이지네이션용
  const listPosts = filtered
  const totalPages = Math.ceil(listPosts.length / POSTS_PER_PAGE)
  const paged = listPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const handleCat = (cat) => {
    setSelectedCat(cat === selectedCat ? null : cat)
    setSelectedMood(null)
    setCurrentPage(1)
    setShowAllPosts(true)
  }

  const handleMood = (idx) => {
    setSelectedMood(idx === selectedMood ? null : idx)
    setSelectedCat(null)
    setShowAllPosts(false)
  }

  const categories = Object.entries(catCount).sort((a, b) => b[1] - a[1])

  // 카테고리 또는 전체 목록 모드
  if (showAllPosts || selectedCat) {
    return (
      <Layout onCategoryChange={(cat) => {
        const labelMap = { 'movie-recommend': '영화추천', 'overseas-reaction': '해외반응후기', 'marvel': '마블', 'drama': '드라마', 'animation': '애니메이션' }
        handleCat(labelMap[cat] || null)
      }}>
        <PageTracker slug="main" />

        {/* 뒤로가기 */}
        <button onClick={() => { setShowAllPosts(false); setSelectedCat(null); setCurrentPage(1) }} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
          fontSize: 14, opacity: 0.6, marginBottom: 20, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← 추천 허브로 돌아가기
        </button>

        <div className="main-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, alignItems: 'flex-start',
        }}>
          <div>
            {/* 모바일 카테고리 */}
            <div className="mobile-cats" style={{
              display: 'none', gap: 8, marginBottom: 24,
              overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch',
            }}>
              <button onClick={() => handleCat(null)} style={mobileCatBtn(!selectedCat)}>전체</button>
              {categories.map(([cat]) => (
                <button key={cat} onClick={() => handleCat(cat)} style={mobileCatBtn(selectedCat === cat)}>{cat}</button>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 8, paddingBottom: 16, borderBottom: '2px solid var(--text-color, #1a1a2e)',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {selectedCat || '전체 포스팅'}
              </h2>
              <span style={{ fontSize: 13, opacity: 0.4 }}>{filtered.length}개의 글</span>
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={pageBtn(false, currentPage === 1)}>
                  &larr;
                </button>
                {pageNumbers(currentPage, totalPages).map((page, i) => (
                  page === '...' ? (
                    <span key={'dot' + i} style={{ padding: '0 4px', opacity: 0.3 }}>...</span>
                  ) : (
                    <button key={page} onClick={() => setCurrentPage(page)} style={pageBtn(page === currentPage, false)}>
                      {page}
                    </button>
                  )
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={pageBtn(false, currentPage === totalPages)}>
                  &rarr;
                </button>
              </nav>
            )}
          </div>

          <aside className="sidebar" style={{ position: 'sticky', top: 72 }}>
            <div style={{
              background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20,
              border: '1px solid var(--border-color, #eee)', marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px', opacity: 0.5 }}>카테고리</h3>
              <button onClick={() => { setSelectedCat(null); setCurrentPage(1) }} style={sidebarCatBtn(!selectedCat)}>
                <span>전체</span><span style={{ opacity: 0.4 }}>{posts.length}</span>
              </button>
              {categories.map(([cat, count]) => (
                <button key={cat} onClick={() => handleCat(cat)} style={sidebarCatBtn(selectedCat === cat)}>
                  <span>{cat}</span><span style={{ opacity: 0.4 }}>{count}</span>
                </button>
              ))}
            </div>
            <div style={{
              background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20,
              border: '1px solid var(--border-color, #eee)',
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px', opacity: 0.5 }}>추천 포스팅</h3>
              {sorted.slice(0, 5).map((post, i) => (
                <a key={post.id} href={getPostUrl(post)} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 0', textDecoration: 'none', color: 'inherit',
                  borderBottom: i < 4 ? '1px solid var(--border-color, #f0f0f0)' : 'none',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, opacity: 0.15, minWidth: 20, lineHeight: '20px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 500, lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{post.title}</span>
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

  // ─── 추천 허브 메인 ───
  return (
    <Layout onCategoryChange={(cat) => {
      const labelMap = { 'movie-recommend': '영화추천', 'overseas-reaction': '해외반응후기', 'marvel': '마블', 'drama': '드라마', 'animation': '애니메이션' }
      handleCat(labelMap[cat] || null)
    }}>
      <PageTracker slug="main" />

      {/* ─── 지금 뜨는 작품 ─── */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader icon="🔥" title="지금 뜨는 작품" />
        <div style={{ marginBottom: 16 }}>
          <FeaturedCard post={trending[0]} />
        </div>
        <div className="trending-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14,
        }}>
          {trending.slice(1, 6).map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* ─── 히어로: 오늘 뭐 볼까? ─── */}
      <section style={{
        textAlign: 'center', padding: '48px 20px 32px',
        marginBottom: 32,
      }}>
        <h1 style={{
          fontSize: 32, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.3,
          background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          오늘 뭐 볼까?
        </h1>
        <p style={{ fontSize: 15, opacity: 0.5, margin: '0 0 28px' }}>
          기분에 맞는 작품을 골라보세요
        </p>

        {/* 무드 버튼 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10,
          maxWidth: 600, margin: '0 auto',
        }}>
          {MOODS.map((mood, idx) => (
            <button key={mood.label} onClick={() => handleMood(idx)} style={{
              padding: '10px 18px', borderRadius: 24, cursor: 'pointer',
              border: selectedMood === idx ? '2px solid #e50914' : '1px solid var(--border-color, #ddd)',
              background: selectedMood === idx ? '#e5091411' : 'var(--card-bg, #fff)',
              color: 'inherit', fontSize: 13, fontWeight: selectedMood === idx ? 700 : 500,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: selectedMood === idx ? '0 2px 12px rgba(229,9,20,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <span style={{ fontSize: 16 }}>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 무드 결과 ─── */}
      {selectedMood !== null && moodFiltered.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader icon={MOODS[selectedMood].icon} title={MOODS[selectedMood].label + ' 추천'} />
          <div className="mood-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }}>
            {moodFiltered.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      {selectedMood !== null && moodFiltered.length === 0 && (
        <section style={{ textAlign: 'center', padding: '32px 20px 48px', opacity: 0.4 }}>
          <p style={{ fontSize: 14 }}>해당 분위기에 맞는 포스팅을 준비 중입니다.</p>
        </section>
      )}

      {/* ─── 오늘의 트렌드 배너 ─── */}
      {trendPosts && trendPosts.length > 0 && (
        <section style={{ marginBottom: 48, padding: '32px 0', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>오늘의 트렌드</h2>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>TODAY</span>
          </div>
          <div className="trend-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 24px 16px', scrollSnapType: 'x mandatory' }}>
            {trendPosts.map(post => (
              <a
                key={post.id}
                href={getPostUrl(post)}
                className="trend-card"
                style={{
                  flexShrink: 0,
                  width: 280,
                  borderRadius: 12,
                  overflow: 'hidden',
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  display: 'block',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  background: '#0d1117',
                  transition: 'transform 0.2s',
                }}
              >
                {/* 썸네일 영역 */}
                <div style={{ position: 'relative', width: '100%', height: 160, background: '#1e2330', overflow: 'hidden' }}>
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #e50914, #ff6b6b)',
                      fontSize: 40,
                    }}>🎬</div>
                  )}
                  {/* 오버레이 그라디언트 */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  }} />
                  {/* TODAY 배지 */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#e50914', color: '#fff',
                    fontSize: 10, fontWeight: 800, padding: '3px 8px',
                    borderRadius: 4, letterSpacing: '0.05em',
                  }}>TODAY</div>
                </div>
                {/* 텍스트 영역 */}
                <div style={{ padding: '12px 14px 14px' }}>
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{post.title}</p>
                  {post.date && (
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      {post.date}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <AdUnit slot="6297515693" format="auto" style={{ marginBottom: 48 }} />

      {/* ─── OTT별 탐색 ─── */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader icon="📺" title="OTT별 탐색" />
        <div className="ott-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
        }}>
          {OTT_SECTIONS.map(ott => {
            const ottPosts = sorted.filter(p =>
              p.tags && p.tags.some(t => ott.tags.some(ot => t.toLowerCase().includes(ot.toLowerCase())))
            )
            return (
              <div key={ott.label} style={{
                background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 20,
                border: '1px solid var(--border-color, #eee)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    background: ott.color + '15',
                  }}>{ott.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{ott.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.35, marginLeft: 'auto' }}>{ottPosts.length}편</span>
                </div>
                {ottPosts.slice(0, 3).map(post => (
                  <a key={post.id} href={getPostUrl(post)} style={{
                    display: 'block', padding: '8px 0', textDecoration: 'none', color: 'inherit',
                    borderTop: '1px solid var(--border-color, #f0f0f0)', fontSize: 13,
                    lineHeight: 1.4, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{post.title}</a>
                ))}
                {ottPosts.length === 0 && (
                  <p style={{ fontSize: 12, opacity: 0.35, padding: '8px 0' }}>준비 중</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── 카테고리별 탐색 ─── */}
      {categories.map(([cat, count]) => {
        const catPosts = byCategory[cat] || []
        if (catPosts.length === 0) return null
        return (
          <section key={cat} style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16,
            }}>
              <SectionHeader icon={CATEGORY_ICONS[cat] || '📄'} title={cat} />
              <button onClick={() => handleCat(cat)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#e50914', fontSize: 13, fontWeight: 600, padding: 0,
              }}>
                전체 보기 →
              </button>
            </div>
            <div className="cat-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
            }}>
              {catPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )
      })}

      <AdUnit slot="6297515693" format="auto" style={{ marginBottom: 48 }} />

      {/* ─── 전체 글 보기 버튼 ─── */}
      <section style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <button onClick={() => setShowAllPosts(true)} style={{
          padding: '14px 40px', borderRadius: 28, cursor: 'pointer',
          background: '#e50914', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 700, transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(229,9,20,0.3)',
        }}>
          전체 {posts.length}개 포스팅 보기
        </button>
      </section>

      <style jsx global>{`
        @media (max-width: 900px) {
          .mood-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trending-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .ott-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .trending-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .mood-grid { grid-template-columns: 1fr !important; }
          .ott-grid { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: 1fr !important; }
        }
        /* ─── 트렌드 스크롤 ─── */
        .trend-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .trend-scroll::-webkit-scrollbar {
          display: none;
        }
        .trend-card:hover {
          transform: translateY(-4px);
        }
        @media (max-width: 600px) {
          .trend-card {
            width: 240px !important;
          }
        }
      `}</style>
    </Layout>
  )
}

/* ─── 섹션 헤더 ─── */
function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 16, paddingBottom: 12,
      borderBottom: '2px solid var(--text-color, #1a1a2e)',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{title}</h2>
    </div>
  )
}

/* ─── 페이지네이션 번호 생성 ─── */
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  if (total > 1) pages.push(total)
  return pages
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
    cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
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
