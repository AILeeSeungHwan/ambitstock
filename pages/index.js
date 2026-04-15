import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'
import PostCard, { FeaturedCard, ListCard } from '../components/PostCard'
import AdUnit from '../components/AdUnit'
import PageTracker from '../components/PageTracker'
import SearchBar from '../components/SearchBar'
import ContentTypeBadge from '../components/ContentTypeBadge'
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

const GENRE_CHIPS = [
  { label: 'SF', tags: ['SF', 'SF영화'] },
  { label: '호러', tags: ['호러', '공포 영화', '공포'] },
  { label: '로맨스', tags: ['로맨스', '멜로', '로맨틱코미디'] },
  { label: '액션', tags: ['액션', '블록버스터'] },
  { label: '스릴러', tags: ['스릴러', '심리스릴러', 'K스릴러'] },
  { label: '코미디', tags: ['코미디', '시트콤'] },
  { label: '범죄', tags: ['범죄', '범죄드라마', '미스터리'] },
  { label: '애니', tags: ['애니메이션', '애니메이션 영화'] },
]

const OTT_CHIPS = [
  { label: '넷플릭스', platform: '넷플릭스' },
  { label: '디즈니+', platform: '디즈니플러스' },
  { label: '티빙', platform: '티빙' },
  { label: '쿠팡', platform: '쿠팡플레이' },
  { label: '극장', platform: '극장' },
]

const CATEGORY_ICONS = {
  '영화추천': '🎬',
  '해외반응후기': '🌍',
  '마블': '🦸',
  '드라마': '📺',
  '애니메이션': '🎨',
}

export async function getStaticProps() {
  const allPosts = require('../data/posts').default || require('../data/posts')
  const works = require('../data/works').default || require('../data/works')

  const postsWithThumbnail = allPosts.map(post => {
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
    .map(toLightPost)

  const topWorks = [...works]
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 4)
    .map(w => {
      const workPosts = w.posts
        .map(id => postsWithThumbnail.find(p => p.id === id))
        .filter(Boolean)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      const recentThumb = workPosts.find(p => p.thumbnail)
      return {
        slug: w.slug,
        title: w.title,
        postCount: w.posts.length,
        category: w.category,
        thumbnail: recentThumb ? recentThumb.thumbnail : null,
      }
    })

  const sorted = [...postsWithThumbnail]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(toLightPost)

  return { props: { posts: sorted, catCount, trendPosts, topWorks, totalCount: postsWithThumbnail.length } }
}

function toLightPost(p) {
  const light = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    category: p.category,
    tags: (p.tags || []).slice(0, 5),
  }
  if (p.tistorySlug) light.tistorySlug = p.tistorySlug
  if (p.contentType) light.contentType = p.contentType
  if (p.platform) light.platform = p.platform
  if (p.thumbnail) light.thumbnail = p.thumbnail
  if (p.description) light.description = p.description.length > 200 ? p.description.slice(0, 200) : p.description
  return light
}

export default function Home({ posts, catCount, trendPosts, topWorks, totalCount }) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [showAllPosts, setShowAllPosts] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedOtts, setSelectedOtts] = useState([])

  useEffect(() => {
    if (router.query.cat) {
      setSelectedCat(router.query.cat)
      setShowAllPosts(true)
    }
  }, [router.query.cat])

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [posts])

  const filtered = useMemo(() => {
    let result = sorted
    if (selectedCat) {
      result = result.filter(p => p.category === selectedCat)
    }
    if (selectedOtts.length > 0) {
      result = result.filter(p => selectedOtts.some(oi => {
        const section = OTT_SECTIONS[oi]
        if (!section) return false
        return p.tags && p.tags.some(t => section.tags.some(st => t.toLowerCase().includes(st.toLowerCase())))
      }))
    }
    return result
  }, [sorted, selectedCat, selectedOtts])

  const moodFiltered = useMemo(() => {
    if (selectedMood === null) return []
    const mood = MOODS[selectedMood]
    if (!mood) return []
    return sorted.filter(p =>
      p.tags && p.tags.some(t => mood.tags.some(mt => t.toLowerCase().includes(mt.toLowerCase())))
    ).slice(0, 8)
  }, [sorted, selectedMood])

  const genreOttFiltered = useMemo(() => {
    if (selectedGenres.length === 0 && selectedOtts.length === 0) return []
    return sorted.filter(p => {
      var matchGenre = selectedGenres.length === 0 || selectedGenres.some(gi => {
        var chip = GENRE_CHIPS[gi]
        return p.tags && p.tags.some(t => chip.tags.some(ct => t.toLowerCase().includes(ct.toLowerCase())))
      })
      var matchOtt = selectedOtts.length === 0 || selectedOtts.some(oi => {
        var chip = OTT_CHIPS[oi]
        return p.platform === chip.platform
      })
      return matchGenre && matchOtt
    }).slice(0, 16)
  }, [sorted, selectedGenres, selectedOtts])

  const byCategory = useMemo(() => {
    const result = {}
    Object.keys(catCount).forEach(cat => {
      result[cat] = sorted.filter(p => p.category === cat).slice(0, 4)
    })
    return result
  }, [sorted, catCount])

  const PINNED_IDS = [564]
  const pinned = PINNED_IDS.map(id => sorted.find(p => p.id === id)).filter(Boolean)
  const rest = sorted.filter(p => !PINNED_IDS.includes(p.id)).slice(0, 6 - pinned.length)
  const trending = [...pinned, ...rest]

  const listPosts = filtered
  const totalPages = Math.ceil(listPosts.length / POSTS_PER_PAGE)
  const paged = listPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const handleCat = (cat) => {
    setSelectedCat(cat === selectedCat ? null : cat)
    setSelectedMood(null)
    setSelectedGenres([])
    setSelectedOtts([])
    setCurrentPage(1)
    setShowAllPosts(true)
  }

  const handleMood = (idx) => {
    setSelectedMood(idx === selectedMood ? null : idx)
    setSelectedCat(null)
    setSelectedGenres([])
    setSelectedOtts([])
    setShowAllPosts(false)
  }

  const toggleGenre = (idx) => {
    setSelectedGenres(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
    setSelectedMood(null)
    setSelectedCat(null)
    setShowAllPosts(false)
  }

  const toggleOtt = (idx) => {
    setSelectedOtts(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
    setSelectedMood(null)
    setSelectedCat(null)
    setShowAllPosts(false)
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedOtts([])
  }

  const hasActiveFilters = selectedGenres.length > 0 || selectedOtts.length > 0

  const categories = Object.entries(catCount).sort((a, b) => b[1] - a[1])

  /* ─── 전체 목록 / 카테고리 뷰 ─── */
  if (showAllPosts || selectedCat) {
    return (
      <Layout onCategoryChange={(cat) => {
        const labelMap = { 'movie-recommend': '영화추천', 'overseas-reaction': '해외반응후기', 'marvel': '마블', 'drama': '드라마', 'animation': '애니메이션' }
        handleCat(labelMap[cat] || null)
      }}>
        <PageTracker slug="main" />

        {/* 뒤로가기 */}
        <button onClick={() => { setShowAllPosts(false); setSelectedCat(null); setSelectedOtts([]); setSelectedGenres([]); setCurrentPage(1) }} className="lv-back">
          ← 추천 허브로 돌아가기
        </button>

        {/* 카테고리 스크롤 (모바일) */}
        <div className="lv-cat-scroll">
          <button onClick={() => { setSelectedCat(null); setCurrentPage(1) }} className={'lv-cat-pill' + (!selectedCat ? ' active' : '')}>전체</button>
          {categories.map(([cat]) => (
            <button key={cat} onClick={() => handleCat(cat)} className={'lv-cat-pill' + (selectedCat === cat ? ' active' : '')}>{cat}</button>
          ))}
        </div>

        <div className="lv-layout">
          {/* 메인 콘텐츠 */}
          <div className="lv-main">
            <div className="lv-header">
              <h2 className="lv-title">
                {selectedCat || (selectedOtts.length > 0 ? OTT_SECTIONS[selectedOtts[0]]?.label + ' 포스팅' : '전체 포스팅')}
              </h2>
              <span className="lv-count">{filtered.length}개의 글</span>
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
              <nav className="lv-pagination">
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

          {/* 사이드바 (데스크탑 전용) */}
          <aside className="lv-sidebar">
            <div className="lv-sidebar-box">
              <h3 className="lv-sidebar-title">카테고리</h3>
              <button onClick={() => { setSelectedCat(null); setCurrentPage(1) }} style={sidebarCatBtn(!selectedCat)}>
                <span>전체</span><span style={{ opacity: 0.4 }}>{totalCount || posts.length}</span>
              </button>
              {categories.map(([cat, count]) => (
                <button key={cat} onClick={() => handleCat(cat)} style={sidebarCatBtn(selectedCat === cat)}>
                  <span>{cat}</span><span style={{ opacity: 0.4 }}>{count}</span>
                </button>
              ))}
            </div>
            <div className="lv-sidebar-box">
              <h3 className="lv-sidebar-title">추천 포스팅</h3>
              {sorted.slice(0, 5).map((post, i) => (
                <a key={post.id} href={getPostUrl(post)} className="lv-sidebar-link" style={{ borderBottom: i < 4 ? '1px solid var(--border-color, #f0f0f0)' : 'none' }}>
                  <span className="lv-sidebar-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lv-sidebar-text">{post.title}</span>
                </a>
              ))}
            </div>
          </aside>
        </div>

        <style jsx global>{`
          .lv-back {
            background: none; border: none; cursor: pointer; color: inherit;
            font-size: 14px; opacity: 0.6; margin-bottom: 16px; padding: 0;
            display: flex; align-items: center; gap: 6px;
          }
          .lv-cat-scroll {
            display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
            margin-bottom: 20px; -webkit-overflow-scrolling: touch;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .lv-cat-scroll::-webkit-scrollbar { display: none; }
          .lv-cat-pill {
            padding: 6px 14px; border-radius: 20px; white-space: nowrap; flex-shrink: 0;
            border: 1px solid var(--border-color, #ddd);
            background: transparent; color: inherit;
            font-size: 12px; font-weight: 400; cursor: pointer;
          }
          .lv-cat-pill.active {
            border: 2px solid var(--primary-color, #e50914);
            background: var(--primary-color, #e50914);
            color: #fff; font-weight: 700;
          }
          .lv-layout {
            display: grid; grid-template-columns: 1fr; gap: 0;
          }
          .lv-main {}
          .lv-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; padding-bottom: 16px;
            border-bottom: 2px solid var(--text-color, #1a1a2e);
          }
          .lv-title { font-size: 18px; font-weight: 800; margin: 0; }
          .lv-count { font-size: 13px; opacity: 0.4; }
          .lv-pagination {
            display: flex; justify-content: center; align-items: center;
            gap: 4px; margin-top: 32px; flex-wrap: wrap;
          }
          .lv-sidebar { display: none; }
          .lv-sidebar-box {
            background: var(--card-bg, #fff); border-radius: 12px; padding: 20px;
            border: 1px solid var(--border-color, #eee); margin-bottom: 20px;
          }
          .lv-sidebar-title { font-size: 13px; font-weight: 700; margin: 0 0 14px; opacity: 0.5; }
          .lv-sidebar-link {
            display: flex; gap: 10px; align-items: flex-start;
            padding: 10px 0; text-decoration: none; color: inherit;
          }
          .lv-sidebar-num { font-size: 14px; font-weight: 800; opacity: 0.15; min-width: 20px; line-height: 20px; }
          .lv-sidebar-text {
            font-size: 13px; font-weight: 500; line-height: 1.4;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
          }
          @media (min-width: 900px) {
            .lv-layout { grid-template-columns: 1fr 280px; gap: 40px; align-items: flex-start; }
            .lv-sidebar { display: block; position: sticky; top: 72px; }
            .lv-cat-scroll { display: none; }
          }
        `}</style>
      </Layout>
    )
  }

  /* ─── 추천 허브 메인 ─── */
  return (
    <Layout onCategoryChange={(cat) => {
      const labelMap = { 'movie-recommend': '영화추천', 'overseas-reaction': '해외반응후기', 'marvel': '마블', 'drama': '드라마', 'animation': '애니메이션' }
      handleCat(labelMap[cat] || null)
    }}>
      <Head>
        <meta property="og:title" content="R의 필름공장 — 영화 추천·결말 해석·해외반응 허브" />
        <meta property="og:description" content="영화 추천, 결말 해석, 해외반응, 드라마·애니·마블 정보를 한곳에서. 589편+ 작품 가이드." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ambitstock.com" />
        <link rel="canonical" href="https://ambitstock.com/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'R의 필름공장',
          'alternateName': '영화 추천·결말 해석·해외반응 허브',
          'url': 'https://ambitstock.com',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://ambitstock.com/?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'R의 필름공장 — 영화 추천·결말 해석·해외반응 허브',
          'description': '영화 추천, 결말 해석, 해외반응, 드라마·애니·마블 정보를 한곳에서. 589편+ 작품 가이드.',
          'url': 'https://ambitstock.com',
          'mainEntity': {
            '@type': 'ItemList',
            'itemListElement': trending.slice(0, 6).map((p, i) => ({
              '@type': 'ListItem',
              'position': i + 1,
              'name': p.title,
              'url': 'https://ambitstock.com' + getPostUrl(p),
              ...(p.thumbnail ? { 'image': 'https://ambitstock.com' + p.thumbnail } : {})
            }))
          }
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          'name': ['영화추천', '해외반응후기', '마블', '드라마', '애니메이션'],
          'url': [
            'https://ambitstock.com/?cat=영화추천',
            'https://ambitstock.com/?cat=해외반응후기',
            'https://ambitstock.com/?cat=마블',
            'https://ambitstock.com/?cat=드라마',
            'https://ambitstock.com/?cat=애니메이션'
          ]
        }) }} />
      </Head>
      <PageTracker slug="main" />

      {/* ─── Hero ─── */}
      <section className="hub-hero">
        <p className="hub-eyebrow">영화 · 드라마 · 애니 가이드</p>
        <h1 className="hub-title">
          지금 볼 영화, 해석이 필요한 영화,<br className="hub-br" />반응이 궁금한 영화까지
        </h1>
        <p className="hub-desc">영화 추천 · 결말 해석 · 해외반응 · OTT 가이드를 한곳에서</p>
        <div className="hub-search">
          <SearchBar posts={posts} />
        </div>
        <div className="hub-quicklinks">
          {[
            { label: '지금 인기', icon: '🔥', action: () => { const el = document.getElementById('trending-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }) } },
            { label: '결말 해석', icon: '🧠', action: () => handleCat('해석') },
            { label: '해외반응', icon: '🌍', action: () => handleCat('해외반응후기') },
          ].map(link => (
            <button key={link.label} onClick={link.action} className="hub-ql-btn">
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 상단 광고 ─── */}
      <AdUnit slot="6297515693" format="auto" style={{ marginBottom: 32 }} />

      {/* ─── 지금 뜨는 작품 ─── */}
      <section id="trending-section" style={{ marginBottom: 48 }}>
        <SectionHeader icon="🔥" title="지금 뜨는 작품" />

        {/* 모바일: 가로 스크롤 카드 */}
        <div className="mob-trend-scroll">
          {trending.map(post => (
            <a key={post.id} href={getPostUrl(post)} className="mob-trend-card">
              <div className="mob-trend-img">
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e50914, #ff6b6b)', fontSize: 28 }}>🎬</div>
                )}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</p>
                {post.category && <p style={{ margin: '4px 0 0', fontSize: 10, opacity: 0.45 }}>{post.category}</p>}
              </div>
            </a>
          ))}
        </div>

        {/* 데스크탑: FeaturedCard + 5열 그리드 */}
        <div className="dt-trending">
          <div style={{ marginBottom: 16 }}>
            <FeaturedCard post={trending[0]} />
          </div>
          <div className="dt-trending-grid">
            {trending.slice(1, 6).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 무드별 추천 ─── */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader icon="✨" title="무드별 추천" />
        <div className="mood-btns">
          {MOODS.map((mood, idx) => (
            <button key={mood.label} onClick={() => handleMood(idx)} className={'mood-btn' + (selectedMood === idx ? ' active' : '')}>
              <span style={{ fontSize: 16 }}>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 장르 + OTT 필터 (데스크탑 전용) ─── */}
      <section className="desktop-filter" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.5, whiteSpace: 'nowrap' }}>장르</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GENRE_CHIPS.map((chip, idx) => (
              <button key={chip.label} onClick={() => toggleGenre(idx)} className={'filter-chip' + (selectedGenres.includes(idx) ? ' active' : '')}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.5, whiteSpace: 'nowrap' }}>OTT</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {OTT_CHIPS.map((chip, idx) => (
              <button key={chip.label} onClick={() => toggleOtt(idx)} className={'filter-chip' + (selectedOtts.includes(idx) ? ' active' : '')}>
                {chip.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{
              padding: '6px 12px', borderRadius: 16, cursor: 'pointer',
              border: '1px solid var(--border-color, #ddd)',
              background: 'transparent', color: '#e50914',
              fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 4,
            }}>
              필터 초기화
            </button>
          )}
        </div>
      </section>

      {/* ─── 장르/OTT 필터 결과 ─── */}
      {hasActiveFilters && genreOttFiltered.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader icon="🎯" title={'필터 결과 (' + genreOttFiltered.length + '개)'} />
          <div className="card-grid">
            {genreOttFiltered.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      {hasActiveFilters && genreOttFiltered.length === 0 && (
        <section style={{ textAlign: 'center', padding: '32px 20px 48px', opacity: 0.4 }}>
          <p style={{ fontSize: 14 }}>선택한 필터에 맞는 포스팅을 준비 중입니다.</p>
        </section>
      )}

      {/* ─── 무드 결과 ─── */}
      {selectedMood !== null && moodFiltered.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader icon={MOODS[selectedMood].icon} title={MOODS[selectedMood].label + ' 추천'} />
          <div className="card-grid">
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
        <TrendBanner trendPosts={trendPosts} getPostUrl={getPostUrl} />
      )}

      <AdUnit slot="6297515693" format="auto" style={{ marginBottom: 48 }} />

      {/* ─── OTT별 탐색 ─── */}
      <OTTSection sorted={sorted} getPostUrl={getPostUrl} onViewAll={(ottIndex) => {
        setSelectedOtts([ottIndex])
        setSelectedGenres([])
        setSelectedMood(null)
        setSelectedCat(null)
        setShowAllPosts(true)
        setCurrentPage(1)
      }} />

      {/* ─── 지금 반응 오는 작품 ─── */}
      {topWorks && topWorks.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader icon="🎯" title="지금 반응 오는 작품" />
          <div className="works-grid">
            {topWorks.map(w => (
              <a key={w.slug} href={'/work/' + w.slug + '/'} className="work-card">
                <div className="work-card-img">
                  {w.thumbnail ? (
                    <img src={w.thumbnail} alt={w.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <span style={{ position: 'absolute', top: 10, right: 10, background: '#e50914', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 10 }}>{w.postCount}편</span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{w.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.45 }}>{w.category}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── 인기 콘텐츠 ─── */}
      <PopularTabSection categories={categories} byCategory={byCategory} handleCat={handleCat} />

      {/* ─── 하단 CTA ─── */}
      <section className="hub-cta">
        <p style={{ fontSize: 14, opacity: 0.5, margin: '0 0 16px' }}>
          {totalCount || posts.length}편의 작품 가이드가 준비되어 있습니다
        </p>
        <button onClick={() => setShowAllPosts(true)} className="hub-cta-btn">
          전체 작품 가이드 보기
        </button>
        <div className="hub-cta-links">
          {[
            { label: '🧠 결말 해석', cat: '영화추천' },
            { label: '🌍 해외반응', cat: '해외반응후기' },
            { label: '📺 드라마', cat: '드라마' },
          ].map(link => (
            <button key={link.label} onClick={() => handleCat(link.cat)} className="hub-cta-link">
              {link.label}
            </button>
          ))}
        </div>
      </section>

      <style jsx global>{`
        body { overflow-x: hidden; }

        /* ─── Hero ─── */
        .hub-hero {
          text-align: center;
          padding: 24px 16px 20px;
          margin-bottom: 32px;
          background: linear-gradient(180deg, rgba(229,9,20,0.04) 0%, transparent 100%);
          border-radius: 16px;
        }
        .hub-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: #e50914; margin: 0 0 10px; text-transform: uppercase;
        }
        .hub-title {
          font-size: 22px; font-weight: 900; margin: 0 0 8px; line-height: 1.3;
          color: var(--text-color, #1a1a2e);
        }
        .hub-br { display: none; }
        .hub-desc {
          font-size: 13px; opacity: 0.5; margin: 0 0 18px; line-height: 1.6;
        }
        .hub-search { max-width: 520px; margin: 0 auto 16px; }
        .hub-quicklinks {
          display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
        }
        .hub-ql-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 20px;
          border: 1px solid var(--border-color, #ddd);
          background: var(--card-bg, #fff);
          color: inherit; font-size: 12px; font-weight: 600;
          cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        /* ─── 모바일 트렌드 스크롤 ─── */
        .mob-trend-scroll {
          display: flex; gap: 12px; overflow-x: auto;
          padding-bottom: 8px; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .mob-trend-scroll::-webkit-scrollbar { display: none; }
        .mob-trend-card {
          flex-shrink: 0; width: 140px; border-radius: 10px; overflow: hidden;
          text-decoration: none; color: inherit;
          border: 1px solid var(--border-color, #eee);
          background: var(--card-bg, #fff); display: block;
        }
        .mob-trend-img {
          height: 100px; overflow: hidden;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
        }
        .dt-trending { display: none; }

        /* ─── 무드 버튼 ─── */
        .mood-btns {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
        }
        .mood-btn {
          padding: 10px 12px; border-radius: 24px; cursor: pointer;
          border: 1px solid var(--border-color, #ddd);
          background: var(--card-bg, #fff);
          color: inherit; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .mood-btn.active {
          border: 2px solid #e50914;
          background: rgba(229,9,20,0.07);
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(229,9,20,0.15);
        }

        /* ─── 장르/OTT 필터 (데스크탑 전용) ─── */
        .desktop-filter { display: none; }
        .filter-chip {
          padding: 7px 14px; border-radius: 20px; cursor: pointer;
          border: 1px solid var(--border-color, #ddd);
          background: var(--card-bg, #fff);
          color: inherit; font-size: 12px; font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .filter-chip.active {
          border: 2px solid #e50914;
          background: rgba(229,9,20,0.07);
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(229,9,20,0.15);
        }

        /* ─── 범용 카드 그리드 ─── */
        .card-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }

        /* ─── 작품 허브 그리드 ─── */
        .works-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
        }
        .work-card {
          display: block; text-decoration: none; color: inherit;
          border-radius: 12px; overflow: hidden;
          border: 1px solid var(--border-color, #eee);
          background: var(--card-bg, #fff);
        }
        .work-card-img {
          height: 110px; overflow: hidden;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          position: relative;
        }

        /* ─── 하단 CTA ─── */
        .hub-cta {
          text-align: center; padding: 32px 16px;
          background: linear-gradient(135deg, rgba(229,9,20,0.03), rgba(229,9,20,0.08));
          border-radius: 16px; margin-top: 20px;
        }
        .hub-cta-btn {
          padding: 13px 32px; border-radius: 28px; cursor: pointer;
          background: linear-gradient(135deg, #e50914, #ff4d4d);
          color: #fff; border: none; font-size: 14px; font-weight: 700;
          box-shadow: 0 4px 16px rgba(229,9,20,0.3);
        }
        .hub-cta-links {
          margin-top: 14px; display: flex; justify-content: center;
          gap: 12px; flex-wrap: wrap;
        }
        .hub-cta-link {
          background: none; border: none; cursor: pointer;
          color: var(--primary-color, #e50914); font-size: 13px; font-weight: 600;
          opacity: 0.7;
        }

        /* ─── 트렌드 스크롤 공통 ─── */
        .trend-scroll, .ott-scroll {
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .ott-scroll::-webkit-scrollbar,
        .trend-scroll::-webkit-scrollbar { display: none; }
        .trend-card:hover { transform: translateY(-4px); }

        /* ────────────────────────────
           768px+ (태블릿/데스크탑)
        ──────────────────────────── */
        @media (min-width: 768px) {
          .hub-hero {
            padding: 40px 20px 32px;
            margin-bottom: 40px;
            border-radius: 20px;
          }
          .hub-eyebrow { font-size: 13px; }
          .hub-title {
            font-size: 34px;
            background: linear-gradient(135deg, var(--text-color, #1a1a2e), var(--primary-color, #e50914));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hub-br { display: inline; }
          .hub-desc { font-size: 15px; }
          .hub-ql-btn { font-size: 13px; padding: 8px 16px; }

          /* 트렌드: 모바일 숨김, 데스크탑 표시 */
          .mob-trend-scroll { display: none; }
          .dt-trending { display: block; }
          .dt-trending-grid {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
          }

          /* 무드 버튼 */
          .mood-btns {
            display: flex; flex-wrap: wrap; gap: 10px;
          }
          .mood-btn { padding: 10px 18px; }

          /* 장르/OTT 필터 표시 */
          .desktop-filter { display: block; }

          /* 카드 그리드 */
          .card-grid { grid-template-columns: repeat(4, 1fr); }
          .works-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .work-card-img { height: 140px; }

          /* OTT 카드 */
          .ott-card-grid { grid-template-columns: repeat(3, 1fr) !important; }

          /* 인기 */
          .popular-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }

        /* ────────────────────────────
           480px–767px (중간)
        ──────────────────────────── */
        @media (min-width: 480px) and (max-width: 767px) {
          .mob-trend-card { width: 160px; }
          .mob-trend-img { height: 110px; }
          .card-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ─── OTT / 인기 모바일 기본 ─── */
        .ott-card-grid { grid-template-columns: 1fr !important; }
        @media (min-width: 480px) {
          .ott-card-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .popular-grid { grid-template-columns: repeat(2, 1fr) !important; }
      `}</style>
    </Layout>
  )
}

/* ─── OTT별 탐색 ─── */
function OTTSection({ sorted, getPostUrl, onViewAll }) {
  const [activeOtt, setActiveOtt] = useState(0)
  const ott = OTT_SECTIONS[activeOtt]
  const ottPosts = useMemo(() => {
    if (!ott) return []
    return sorted.filter(p =>
      p.tags && p.tags.some(t => ott.tags.some(ot => t.toLowerCase().includes(ot.toLowerCase())))
    ).slice(0, 6)
  }, [sorted, ott])

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader icon="📺" title="OTT별 탐색" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {OTT_SECTIONS.map((o, idx) => (
          <button key={o.label} onClick={() => setActiveOtt(idx)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
            border: activeOtt === idx ? '2px solid ' + o.color : '1px solid var(--border-color, #ddd)',
            background: activeOtt === idx ? o.color + '12' : 'var(--card-bg, #fff)',
            color: activeOtt === idx ? o.color : 'inherit',
            fontSize: 13, fontWeight: activeOtt === idx ? 700 : 500,
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <span>{o.icon}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <div className="ott-card-grid" style={{ display: 'grid', gap: 14 }}>
        {ottPosts.map(post => (
          <a key={post.id} href={getPostUrl(post)} style={{
            textDecoration: 'none', color: 'inherit',
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--border-color, #eee)',
            background: 'var(--card-bg, #fff)',
            display: 'block',
          }}>
            <div style={{ height: 120, overflow: 'hidden', background: ott.color + '10' }}>
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{ott.icon}</div>
              )}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {post.contentType && <ContentTypeBadge type={post.contentType} />}
              </div>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{post.title}</p>
            </div>
          </a>
        ))}
      </div>
      {ottPosts.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 13, opacity: 0.4, padding: '20px 0' }}>해당 OTT 관련 포스팅을 준비 중입니다.</p>
      )}
      {ottPosts.length > 0 && onViewAll && (
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <button onClick={() => onViewAll(activeOtt)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: ott.color || 'var(--primary-color, #e50914)', fontSize: 13, fontWeight: 600,
          }}>
            {ott.label} 전체 보기 →
          </button>
        </div>
      )}
    </section>
  )
}

/* ─── 인기 콘텐츠 탭 ─── */
function PopularTabSection({ categories, byCategory, handleCat }) {
  const TABS = [
    { label: '🧠 해석', filter: (posts) => posts.filter(p => p.contentType === '해석').slice(0, 4) },
    { label: '⭐ 추천', filter: (posts) => posts.filter(p => p.contentType === '추천').slice(0, 4) },
    { label: '🌍 해외반응', filter: (posts) => posts.filter(p => p.contentType === '해외반응').slice(0, 4) },
    { label: '📺 드라마', cat: '드라마' },
    { label: '🎨 애니', cat: '애니메이션' },
    { label: '🦸 마블', cat: '마블' },
  ]
  const [activeTab, setActiveTab] = useState(0)
  const allPosts = useMemo(() => {
    const all = []
    Object.values(byCategory).forEach(posts => all.push(...posts))
    return all
  }, [byCategory])

  const allSorted = useMemo(() => {
    const seen = new Set()
    return allPosts.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [allPosts])

  const tab = TABS[activeTab]
  const tabPosts = useMemo(() => {
    if (tab.filter) return tab.filter(allSorted)
    if (tab.cat) return (byCategory[tab.cat] || []).slice(0, 4)
    return []
  }, [tab, allSorted, byCategory])

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader icon="📌" title="인기 콘텐츠" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {TABS.map((t, idx) => (
          <button key={t.label} onClick={() => setActiveTab(idx)} style={{
            padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
            border: activeTab === idx ? '2px solid var(--primary-color, #e50914)' : '1px solid var(--border-color, #ddd)',
            background: activeTab === idx ? 'var(--primary-color, #e50914)' : 'var(--card-bg, #fff)',
            color: activeTab === idx ? '#fff' : 'inherit',
            fontSize: 13, fontWeight: activeTab === idx ? 700 : 500,
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="popular-grid" style={{ display: 'grid', gap: 14 }}>
        {tabPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {tab.cat && (
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <button onClick={() => handleCat(tab.cat)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--primary-color, #e50914)', fontSize: 13, fontWeight: 600,
          }}>
            {tab.cat} 전체 보기 →
          </button>
        </div>
      )}
    </section>
  )
}

/* ─── 트렌드 배너 ─── */
function TrendBanner({ trendPosts, getPostUrl }) {
  const scrollRef = useRef(null)
  const autoTimerRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const scrollToIdx = useCallback((idx) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.children[idx]
    if (!card) return
    el.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const scrollLeft = el.scrollLeft + 24
      let closest = 0
      let minDist = Infinity
      Array.from(el.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - scrollLeft)
        if (dist < minDist) { minDist = dist; closest = i }
      })
      setActiveIdx(closest)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const start = () => {
      autoTimerRef.current = setInterval(() => {
        setActiveIdx(prev => {
          const next = prev + 1 >= trendPosts.length ? 0 : prev + 1
          scrollToIdx(next)
          return next
        })
      }, 4000)
    }
    start()
    return () => clearInterval(autoTimerRef.current)
  }, [trendPosts.length, scrollToIdx])

  const pauseAuto = useCallback(() => { clearInterval(autoTimerRef.current) }, [])
  const resumeAuto = useCallback(() => {
    clearInterval(autoTimerRef.current)
    autoTimerRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = prev + 1 >= trendPosts.length ? 0 : prev + 1
        scrollToIdx(next)
        return next
      })
    }, 4000)
  }, [trendPosts.length, scrollToIdx])

  return (
    <section style={{ marginBottom: 48, padding: '32px 0', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16 }}>
      <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>오늘의 트렌드</h2>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>TODAY</span>
      </div>
      <div
        ref={scrollRef}
        className="trend-scroll"
        style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 24px 16px', scrollSnapType: 'x mandatory' }}
        onTouchStart={pauseAuto}
        onTouchEnd={() => setTimeout(resumeAuto, 3000)}
        onMouseDown={pauseAuto}
        onMouseUp={() => setTimeout(resumeAuto, 3000)}
      >
        {trendPosts.map(post => (
          <a
            key={post.id}
            href={getPostUrl(post)}
            className="trend-card"
            style={{
              flexShrink: 0, width: 240, borderRadius: 12, overflow: 'hidden',
              scrollSnapAlign: 'start', textDecoration: 'none', display: 'block',
              position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              background: '#0d1117', transition: 'transform 0.2s',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: 150, background: '#1e2330', overflow: 'hidden' }}>
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e50914, #ff6b6b)', fontSize: 40 }}>🎬</div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, background: '#e50914', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>TODAY</div>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</p>
              {post.date && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{post.date}</p>
              )}
            </div>
          </a>
        ))}
      </div>
      {trendPosts.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          {trendPosts.map((_, i) => (
            <button
              key={i}
              onClick={() => { scrollToIdx(i); setActiveIdx(i); pauseAuto(); setTimeout(resumeAuto, 3000) }}
              style={{
                width: activeIdx === i ? 20 : 8, height: 8, borderRadius: 4,
                border: 'none', padding: 0, cursor: 'pointer',
                background: activeIdx === i ? '#e50914' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s',
              }}
              aria-label={'트렌드 ' + (i + 1) + '번째로 이동'}
            />
          ))}
        </div>
      )}
    </section>
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

/* ─── 페이지네이션 ─── */
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
