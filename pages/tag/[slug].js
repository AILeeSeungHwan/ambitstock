import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import ContentTypeBadge from '../../components/ContentTypeBadge'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const POSTS_PER_LOAD = 12

/* tag → topic hub 매핑 */
const TAG_TO_TOPIC = {
  '넷플릭스': { href: '/ott/netflix/', label: '넷플릭스 허브' },
  '넷플릭스신작': { href: '/ott/netflix/', label: '넷플릭스 허브' },
  '넷플릭스추천': { href: '/ott/netflix/', label: '넷플릭스 허브' },
  '넷플릭스드라마': { href: '/ott/netflix/', label: '넷플릭스 허브' },
  '디즈니': { href: '/ott/disney-plus/', label: '디즈니플러스 허브' },
  '디즈니플러스': { href: '/ott/disney-plus/', label: '디즈니플러스 허브' },
  '티빙': { href: '/ott/tving/', label: '티빙 허브' },
  '쿠팡플레이': { href: '/ott/coupang-play/', label: '쿠팡플레이 허브' },
  '쿠팡': { href: '/ott/coupang-play/', label: '쿠팡플레이 허브' },
  '마블': { href: '/category/marvel/', label: '마블 카테고리' },
  'MCU': { href: '/category/marvel/', label: '마블 카테고리' },
  '애니메이션': { href: '/category/anime/', label: '애니메이션 카테고리' },
  '드라마': { href: '/category/drama/', label: '드라마 카테고리' },
  '한국드라마': { href: '/category/drama/', label: '드라마 카테고리' },
}

export async function getStaticPaths() {
  const posts = require('../../data/posts').default || require('../../data/posts')
  const tagSet = new Set()
  posts.forEach(p => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach(t => tagSet.add(t))
    }
  })
  // 소문자 slug로 통일 (macOS 파일시스템 대소문자 충돌 방지)
  const slugMap = {}
  Array.from(tagSet).forEach(tag => {
    const slug = encodeURIComponent(tag).toLowerCase()
    if (!slugMap[slug]) slugMap[slug] = tag
  })
  const paths = Object.keys(slugMap).map(slug => ({
    params: { slug },
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const allPosts = require('../../data/posts').default || require('../../data/posts')
  // slug를 소문자로 받으므로 원래 태그 역매핑
  const slugLower = params.slug.toLowerCase()
  const tagSet = new Set()
  allPosts.forEach(p => { if (p.tags) p.tags.forEach(t => tagSet.add(t)) })
  const tagName = Array.from(tagSet).find(t => encodeURIComponent(t).toLowerCase() === slugLower) || decodeURIComponent(params.slug)
  const filteredPosts = allPosts
    .filter(p => p.tags && Array.isArray(p.tags) && p.tags.includes(tagName))
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

  const topicLink = TAG_TO_TOPIC[tagName] || null

  return {
    props: {
      slug: params.slug,
      tagName,
      posts: filteredPosts,
      topicLink,
    },
  }
}

export default function TagPage({ slug, tagName, posts, topicLink }) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_LOAD)

  const visiblePosts = posts.slice(0, visibleCount)
  const hasMore = visibleCount < posts.length

  const pageTitle = '#' + tagName + ' — R의 필름공장'
  const pageDesc = tagName + ' 관련 영화·드라마·애니메이션 콘텐츠를 모았습니다. 총 ' + posts.length + '편.'
  const pageUrl = 'https://ambitstock.com/tag/' + slug + '/'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '#' + tagName,
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
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, margin: '0 0 12px' }}>
            <span style={{ color: 'var(--primary-color, #e50914)' }}>#</span>{tagName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>
              {posts.length}개의 콘텐츠
            </span>
            {topicLink && (
              <a href={topicLink.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 600,
                color: 'var(--primary-color, #e50914)',
                textDecoration: 'none',
                padding: '4px 12px', borderRadius: 16,
                border: '1px solid var(--primary-color, #e50914)',
                transition: 'all 0.2s',
              }}>
                {topicLink.label} &rarr;
              </a>
            )}
          </div>
        </div>

        {/* ─── Post Grid ─── */}
        {visiblePosts.length > 0 ? (
          <div className="tag-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}>
            {visiblePosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px', opacity: 0.4,
          }}>
            <p style={{ fontSize: 16 }}>태그에 해당하는 콘텐츠가 없습니다.</p>
          </div>
        )}

        {/* ─── Load More ─── */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button
              onClick={() => setVisibleCount(c => c + POSTS_PER_LOAD)}
              style={{
                padding: '12px 32px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid var(--border-color, #ddd)',
                background: 'var(--card-bg, #fff)',
                color: 'inherit',
                fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              더 보기 ({posts.length - visibleCount}개 남음)
            </button>
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
          .tag-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .tag-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .tag-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
