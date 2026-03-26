import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import ContentTypeBadge from '../../components/ContentTypeBadge'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const works = require('../../data/works')
const posts = require('../../data/posts')

const CATEGORY_COLORS = {
  '영화추천': { bg: '#e3f2fd', text: '#1565c0' },
  '해외반응후기': { bg: '#ffebee', text: '#c62828' },
  '마블': { bg: '#ede7f6', text: '#4527a0' },
  '드라마': { bg: '#f3e5f5', text: '#7b1fa2' },
  '애니메이션': { bg: '#e0f2f1', text: '#00695c' },
}

const PLATFORM_COLORS = {
  '넷플릭스': { bg: '#e50914', text: '#fff' },
  '디즈니플러스': { bg: '#113ccf', text: '#fff' },
  '쿠팡플레이': { bg: '#e44232', text: '#fff' },
  '극장': { bg: '#333', text: '#fff' },
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
  const paths = works.map(w => ({ params: { slug: w.slug } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const work = works.find(w => w.slug === params.slug)
  if (!work) return { notFound: true }

  const relatedPosts = work.posts
    .map(id => posts.find(p => p.id === id))
    .filter(Boolean)
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

  return {
    props: {
      work: { slug: work.slug, title: work.title, category: work.category, platform: work.platform || null },
      relatedPosts,
    },
  }
}

export default function WorkHubPage({ work, relatedPosts }) {
  const [activeTab, setActiveTab] = useState(0)

  const filteredPosts = useMemo(() => {
    const tab = TABS[activeTab]
    if (!tab.value) return relatedPosts
    return relatedPosts.filter(p => p.contentType === tab.value)
  }, [activeTab, relatedPosts])

  const contentTypes = useMemo(() => {
    const types = new Set()
    relatedPosts.forEach(p => { if (p.contentType) types.add(p.contentType) })
    return types
  }, [relatedPosts])

  const visibleTabs = TABS.filter(t => !t.value || contentTypes.has(t.value))

  const cat = CATEGORY_COLORS[work.category] || { bg: '#f5f5f5', text: '#666' }
  const plat = work.platform ? (PLATFORM_COLORS[work.platform] || { bg: '#666', text: '#fff' }) : null

  const pageTitle = work.title + ' 관련 콘텐츠 모음 — R의 필름공장'
  const pageDesc = work.title + ' 관련 해석, 추천, 후기, 해외반응 등 콘텐츠를 한곳에서 확인하세요.'
  const pageUrl = 'https://ambitstock.com/work/' + work.slug + '/'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: work.title + ' 관련 콘텐츠 모음',
    description: pageDesc,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: relatedPosts.length,
      itemListElement: relatedPosts.map((p, i) => ({
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
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, margin: '0 0 16px' }}>
            {work.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', background: cat.bg, color: cat.text,
              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
            }}>{work.category}</span>
            {plat && (
              <span style={{
                display: 'inline-block', background: plat.bg, color: plat.text,
                fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
              }}>{work.platform}</span>
            )}
            <span style={{ fontSize: 13, opacity: 0.5 }}>
              {relatedPosts.length}개의 콘텐츠
            </span>
          </div>
        </div>

        {/* ─── Tab Filter ─── */}
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
                border: isActive ? '2px solid var(--primary-color, #e50914)' : '1px solid var(--border-color, #ddd)',
                background: isActive ? 'var(--primary-color, #e50914)' : 'var(--card-bg, #fff)',
                color: isActive ? '#fff' : 'inherit',
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ─── Post Grid ─── */}
        {filteredPosts.length > 0 ? (
          <div className="work-grid" style={{
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
          .work-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .work-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .work-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
