import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import ContentTypeBadge from '../../components/ContentTypeBadge'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const POSTS_PER_PAGE = 12

const CATEGORY_MAP = {
  'movie': {
    name: '영화추천',
    icon: '🎬',
    color: '#1565c0',
    intro: '장르별, 취향별, OTT별 영화 추천. 지금 극장에서 볼 수 있는 작품부터 넷플릭스 숨은 명작까지, 다음에 볼 영화를 찾아보세요.',
  },
  'drama': {
    name: '드라마',
    icon: '📺',
    color: '#7b1fa2',
    intro: 'K드라마부터 해외 시리즈까지. 시청순서 가이드, 결말 해석, 시청률 분석까지 드라마의 모든 것을 다룹니다.',
  },
  'anime': {
    name: '애니메이션',
    icon: '🎨',
    color: '#00695c',
    intro: '극장판 애니메이션부터 TV 시리즈까지. 지브리, 디즈니, 일본 애니 명작과 신작 정보.',
  },
  'marvel': {
    name: '마블',
    icon: '🦸',
    color: '#4527a0',
    intro: 'MCU 타임라인 정리부터 디즈니+ 마블 드라마, 개봉 예정작 정보까지. 마블 유니버스 완벽 가이드.',
  },
  'overseas-reaction': {
    name: '해외반응후기',
    icon: '🌍',
    color: '#c62828',
    intro: '한국 영화·드라마에 대한 해외 평론가와 관객의 실제 반응. 로튼토마토, IMDB, 해외 커뮤니티 반응을 정리합니다.',
  },
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
  const paths = Object.keys(CATEGORY_MAP).map(slug => ({ params: { slug } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const cat = CATEGORY_MAP[params.slug]
  if (!cat) return { notFound: true }

  const posts = require('../../data/posts').default || require('../../data/posts')
  const filteredPosts = posts
    .filter(p => p.category === cat.name)
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
        thumbnail: thumb,
      }
    })
    .sort((a, b) => {
      if (a.date && b.date) return new Date(b.date) - new Date(a.date)
      return 0
    })
    .slice(0, 48)

  return {
    props: {
      slug: params.slug,
      catName: cat.name,
      catIcon: cat.icon,
      catColor: cat.color,
      catIntro: cat.intro,
      posts: filteredPosts,
    },
  }
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export default function CategoryHubPage({ slug, catName, catIcon, catColor, catIntro, posts }) {
  const [activeTab, setActiveTab] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPosts = useMemo(() => {
    const tab = TABS[activeTab]
    if (!tab.value) return posts
    return posts.filter(p => p.contentType === tab.value)
  }, [activeTab, posts])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const pagedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  const contentTypes = useMemo(() => {
    const types = new Set()
    posts.forEach(p => { if (p.contentType) types.add(p.contentType) })
    return types
  }, [posts])

  const visibleTabs = TABS.filter(t => !t.value || contentTypes.has(t.value))

  const handleTabChange = (tabIdx) => {
    setActiveTab(tabIdx)
    setCurrentPage(1)
  }

  const pageTitle = catName + ' — R의 필름공장'
  const pageDesc = catIntro
  const pageUrl = 'https://ambitstock.com/category/' + slug + '/'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: catName,
    description: pageDesc,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 20).map((p, i) => ({
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
              background: catColor + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{catIcon}</span>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
                {catName}
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
            {catIntro}
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
                <button key={t.label} onClick={() => handleTabChange(tabIdx)} style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                  border: isActive ? '2px solid ' + catColor : '1px solid var(--border-color, #ddd)',
                  background: isActive ? catColor : 'var(--card-bg, #fff)',
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

        {/* ─── Post Grid ─── */}
        {pagedPosts.length > 0 ? (
          <div className="cat-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}>
            {pagedPosts.map(post => (
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

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <nav style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 4, marginTop: 32, flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px', borderRadius: 6, cursor: currentPage === 1 ? 'default' : 'pointer',
                border: '1px solid var(--border-color, #ddd)',
                background: 'var(--card-bg, #fff)', color: 'inherit',
                fontSize: 13, opacity: currentPage === 1 ? 0.3 : 1,
                transition: 'all 0.2s',
              }}
            >
              &larr;
            </button>
            {pageNumbers(currentPage, totalPages).map((page, i) => (
              page === '...' ? (
                <span key={'dot' + i} style={{ padding: '0 4px', opacity: 0.3 }}>...</span>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)} style={{
                  padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                  border: page === currentPage ? '2px solid ' + catColor : '1px solid var(--border-color, #ddd)',
                  background: page === currentPage ? catColor : 'var(--card-bg, #fff)',
                  color: page === currentPage ? '#fff' : 'inherit',
                  fontSize: 13, fontWeight: page === currentPage ? 700 : 400,
                  transition: 'all 0.2s', minWidth: 36,
                }}>
                  {page}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px', borderRadius: 6, cursor: currentPage === totalPages ? 'default' : 'pointer',
                border: '1px solid var(--border-color, #ddd)',
                background: 'var(--card-bg, #fff)', color: 'inherit',
                fontSize: 13, opacity: currentPage === totalPages ? 0.3 : 1,
                transition: 'all 0.2s',
              }}
            >
              &rarr;
            </button>
          </nav>
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
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .cat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
