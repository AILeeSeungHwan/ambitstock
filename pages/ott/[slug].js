import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import ContentTypeBadge from '../../components/ContentTypeBadge'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const OTT_MAP = {
  'netflix': { name: '넷플릭스', icon: '🔴', color: '#e50914', description: '넷플릭스에서 볼 수 있는 영화·드라마·시리즈. 추천, 해석, 해외반응을 모았습니다.' },
  'disney-plus': { name: '디즈니플러스', icon: '🏰', color: '#0057e7', description: '디즈니플러스 오리지널과 마블, 스타워즈, 픽사까지.' },
  'tving': { name: '티빙', icon: '🟣', color: '#6b2fa0', description: '티빙 오리지널과 tvN, JTBC 드라마.' },
  'coupang-play': { name: '쿠팡플레이', icon: '🟠', color: '#ff6900', description: '쿠팡플레이 오리지널 시리즈와 독점 콘텐츠.' },
  'theater': { name: '극장', icon: '🎬', color: '#333333', description: '현재 극장에서 상영 중이거나 개봉 예정인 영화.' },
}

const TABS = [
  { label: '전체', value: null },
  { label: '🧠 해석', value: '해석' },
  { label: '⭐ 추천', value: '추천' },
  { label: '💬 후기', value: '후기' },
  { label: '🌍 해외반응', value: '해외반응' },
  { label: '📋 정보', value: '정보' },
  { label: '📊 분석', value: '분석' },
]

export async function getStaticPaths() {
  const paths = Object.keys(OTT_MAP).map(slug => ({ params: { slug } }))
  return { paths, fallback: false }
}

const GENRE_LIST = ['SF', '호러', '로맨스', '액션', '스릴러', '코미디', '범죄', '드라마', '애니메이션', '다큐']

export async function getStaticProps({ params }) {
  const ott = OTT_MAP[params.slug]
  if (!ott) return { notFound: true }

  const posts = require('../../data/posts').default || require('../../data/posts')
  const filteredPosts = posts
    .filter(p => p.platform === ott.name)
    .map(p => {
      let thumb = p.thumbnail || null
      if (!thumb) {
        try {
          const mod = require('../../posts/' + p.id + '.js')
          const pd = mod.default || mod
          const img = pd.sections.find(s => s.type === 'image')
          thumb = img ? img.src : null
        } catch (e) {}
      }
      return {
        id: p.id,
        slug: p.slug,
        tistorySlug: p.tistorySlug || null,
        title: p.title,
        description: p.description || null,
        date: p.date || null,
        category: p.category || null,
        contentType: p.contentType || null,
        tags: p.tags || [],
        thumbnail: thumb,
      }
    })
    .sort((a, b) => {
      if (a.date && b.date) return new Date(b.date) - new Date(a.date)
      return 0
    })
    .slice(0, 48)

  // 이 OTT 포스트들에서 실제 존재하는 장르 태그만 추출
  const genreSet = new Set()
  filteredPosts.forEach(p => {
    if (p.tags) {
      p.tags.forEach(t => {
        GENRE_LIST.forEach(g => {
          if (t.toLowerCase().includes(g.toLowerCase())) genreSet.add(g)
        })
      })
    }
  })
  const availableGenres = GENRE_LIST.filter(g => genreSet.has(g))

  return {
    props: {
      slug: params.slug,
      ottName: ott.name,
      ottIcon: ott.icon,
      ottColor: ott.color,
      ottDescription: ott.description,
      posts: filteredPosts,
      availableGenres,
    },
  }
}

export default function OttHubPage({ slug, ottName, ottIcon, ottColor, ottDescription, posts, availableGenres }) {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedGenres, setSelectedGenres] = useState([])

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const filteredPosts = useMemo(() => {
    let result = posts
    const tab = TABS[activeTab]
    if (tab.value) {
      result = result.filter(p => p.contentType === tab.value)
    }
    if (selectedGenres.length > 0) {
      result = result.filter(p =>
        p.tags && selectedGenres.some(genre =>
          p.tags.some(t => t.toLowerCase().includes(genre.toLowerCase()))
        )
      )
    }
    return result
  }, [activeTab, posts, selectedGenres])

  const contentTypes = useMemo(() => {
    const types = new Set()
    posts.forEach(p => { if (p.contentType) types.add(p.contentType) })
    return types
  }, [posts])

  const visibleTabs = TABS.filter(t => !t.value || contentTypes.has(t.value))

  const pageTitle = ottName + ' 콘텐츠 모음 — R의 필름공장'
  const pageDesc = ottDescription
  const pageUrl = 'https://ambitstock.com/ott/' + slug + '/'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: ottName + ' 콘텐츠 모음',
    description: pageDesc,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: 'https://ambitstock.com' + getPostUrl(p),
        name: p.title,
      })),
    },
  }

  return (
    <Layout title={pageTitle} description={pageDesc}>
      <Head>
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <PageTracker />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 60px' }}>
        {/* ─── Header ─── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span style={{
              fontSize: 48, lineHeight: 1,
              width: 64, height: 64, borderRadius: 16,
              background: ottColor + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{ottIcon}</span>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
                {ottName}
              </h1>
              <span style={{ fontSize: 13, opacity: 0.5 }}>
                {posts.length}개의 콘텐츠
              </span>
            </div>
          </div>
          <p style={{
            fontSize: 15, lineHeight: 1.7, opacity: 0.7, margin: 0,
            maxWidth: 640,
          }}>
            {ottDescription}
          </p>
        </div>

        {/* ─── Tab Filter ─── */}
        {visibleTabs.length > 1 && (
          <div style={{
            display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto',
            paddingBottom: 4, WebkitOverflowScrolling: 'touch',
          }}>
            {visibleTabs.map((t) => {
              const tabIdx = TABS.indexOf(t)
              const isActive = activeTab === tabIdx
              return (
                <button key={t.label} onClick={() => setActiveTab(tabIdx)} style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                  border: isActive ? '2px solid ' + ottColor : '1px solid var(--border-color, #ddd)',
                  background: isActive ? ottColor : 'var(--card-bg, #fff)',
                  color: isActive ? '#fff' : 'inherit',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {t.label}
                </button>
              )
            })}
          </div>
        )}

        {/* ─── Genre Filter ─── */}
        {availableGenres && availableGenres.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto',
            paddingBottom: 4, WebkitOverflowScrolling: 'touch', flexWrap: 'wrap',
          }}>
            <button onClick={() => setSelectedGenres([])} style={{
              padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
              border: selectedGenres.length === 0 ? '1.5px solid ' + ottColor : '1px solid var(--border-color, #ddd)',
              background: selectedGenres.length === 0 ? ottColor + '18' : 'transparent',
              color: selectedGenres.length === 0 ? ottColor : 'inherit',
              fontSize: 12, fontWeight: selectedGenres.length === 0 ? 700 : 400,
              transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              전체
            </button>
            {availableGenres.map(genre => {
              const isActive = selectedGenres.includes(genre)
              return (
                <button key={genre} onClick={() => toggleGenre(genre)} style={{
                  padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
                  border: isActive ? '1.5px solid ' + ottColor : '1px solid var(--border-color, #ddd)',
                  background: isActive ? ottColor + '18' : 'transparent',
                  color: isActive ? ottColor : 'inherit',
                  fontSize: 12, fontWeight: isActive ? 700 : 400,
                  transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {genre}
                </button>
              )
            })}
          </div>
        )}

        {/* ─── Post Grid ─── */}
        {filteredPosts.length > 0 ? (
          <div className="ott-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}>
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px', opacity: 0.4,
          }}>
            <p style={{ fontSize: 16 }}>해당 유형의 콘텐츠가 없습니다.</p>
          </div>
        )}

        {/* ─── Back to Home ─── */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="/" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 8,
            border: '1px solid var(--border-color, #ddd)',
            background: 'var(--card-bg, #fff)',
            color: 'inherit', textDecoration: 'none',
            fontSize: 14, fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            홈으로 돌아가기
          </a>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .ott-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .ott-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .ott-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
