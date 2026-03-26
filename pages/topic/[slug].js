import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const POSTS_PER_PAGE = 12

export async function getStaticPaths() {
  const topics = require('../../data/topics').default || require('../../data/topics')
  return {
    paths: topics.map(t => ({ params: { slug: t.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const topics = require('../../data/topics').default || require('../../data/topics')
  const posts = require('../../data/posts').default || require('../../data/posts')
  const topic = topics.find(t => t.slug === params.slug)
  if (!topic) return { notFound: true }

  // Filter posts by topic filter criteria
  const filtered = posts.filter(p => {
    const f = topic.filter
    if (f.contentType && p.contentType !== f.contentType) return false
    if (f.category && p.category !== f.category) return false
    if (f.platform && p.platform !== f.platform) return false
    return true
  })

  // Sort by date descending, limit to 24
  const sorted = filtered
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 24)

  // Resolve thumbnails (same pattern as index.js)
  const postsWithThumbnail = sorted.map(post => {
    if (post.thumbnail) return post
    try {
      const mod = require('../../posts/' + post.id + '.js')
      const postData = mod.default || mod
      const firstImage = postData.sections.find(s => s.type === 'image')
      return { ...post, thumbnail: firstImage ? firstImage.src : null }
    } catch (e) {
      return post
    }
  })

  return {
    props: {
      topic,
      posts: postsWithThumbnail,
      totalCount: filtered.length,
    },
  }
}

export default function TopicHub({ topic, posts, totalCount }) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visibleCount)
  }, [posts, visibleCount])

  const hasMore = visibleCount < posts.length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.title,
    description: topic.description,
    url: 'https://ambitstock.com/topic/' + topic.slug + '/',
    numberOfItems: totalCount,
    provider: {
      '@type': 'Organization',
      name: 'R의 필름공장',
      url: 'https://ambitstock.com',
    },
  }

  return (
    <Layout>
      <Head>
        <title>{topic.title} — R의 필름공장</title>
        <meta name="description" content={topic.description} />
        <meta property="og:title" content={topic.title + ' — R의 필름공장'} />
        <meta property="og:description" content={topic.description} />
        <meta property="og:url" content={'https://ambitstock.com/topic/' + topic.slug + '/'} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={'https://ambitstock.com/topic/' + topic.slug + '/'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageTracker slug={'topic-' + topic.slug} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 60px' }}>
        {/* Back link */}
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--primary-color, #e50914)',
          textDecoration: 'none', marginBottom: 24, opacity: 0.8,
        }}>
          <span style={{ fontSize: 16 }}>&larr;</span> 홈으로 돌아가기
        </a>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{
              fontSize: 40, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56, borderRadius: 14,
              background: 'var(--secondary-color, #f5f5f5)',
            }}>
              {topic.icon}
            </span>
            <h1 style={{
              fontSize: 28, fontWeight: 800, margin: 0,
              color: 'var(--text-color, #1a1a2e)',
              lineHeight: 1.3,
            }}>
              {topic.title}
            </h1>
          </div>
          <p style={{
            fontSize: 15, lineHeight: 1.7, margin: '0 0 12px',
            color: 'var(--text-color, #666)', opacity: 0.7,
            maxWidth: 640,
          }}>
            {topic.description}
          </p>
          <span style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 600,
            color: 'var(--primary-color, #e50914)',
            background: 'var(--secondary-color, #fff0f0)',
            padding: '4px 10px', borderRadius: 6,
          }}>
            {totalCount}개의 글
          </span>
        </div>

        {/* Post Grid */}
        {visiblePosts.length > 0 ? (
          <div className="topic-grid" style={{
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
            textAlign: 'center', padding: '60px 20px',
            color: 'var(--text-color, #999)', opacity: 0.6,
          }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>{topic.icon}</p>
            <p style={{ fontSize: 15 }}>아직 이 주제의 글이 없습니다.</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button
              onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
              style={{
                background: 'var(--primary-color, #e50914)',
                color: '#fff',
                border: 'none',
                padding: '12px 36px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.85' }}
              onMouseLeave={e => { e.target.style.opacity = '1' }}
            >
              더 보기 ({posts.length - visibleCount}개 남음)
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .topic-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1024px) {
          .topic-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .topic-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  )
}
