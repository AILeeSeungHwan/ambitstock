import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Fuse from 'fuse.js'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import SearchBar from '../components/SearchBar'
import PageTracker from '../components/PageTracker'

export async function getStaticProps() {
  const allPosts = require('../data/posts').default || require('../data/posts')
  const posts = allPosts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 150)
    .map(p => {
      let thumb = p.thumbnail || null
      if (!thumb) {
        try {
          const mod = require('../posts/' + p.id + '.js')
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
        category: p.category || null,
        contentType: p.contentType || null,
        date: p.date || null,
        thumbnail: thumb,
        tags: p.tags || [],
      }
    })
  return { props: { posts } }
}

export default function SearchPage({ posts }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)

  var fuse = useMemo(function () {
    if (!posts || posts.length === 0) return null
    return new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tags', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 1,
    })
  }, [posts])

  useEffect(function () {
    var q = router.query.q
    if (q && typeof q === 'string' && q.trim()) {
      setQuery(q.trim())
      if (fuse) {
        var found = fuse.search(q.trim())
        setResults(found.map(function (r) { return r.item }))
      }
    } else if (router.isReady) {
      setQuery('')
      setResults(null)
    }
  }, [router.query.q, router.isReady, fuse])

  var pageTitle = query ? '"' + query + '" 검색 결과 — R의 필름공장' : '검색 — R의 필름공장'
  var pageDesc = query
    ? '"' + query + '" 검색 결과 — 영화·드라마·애니 추천, 결말 해석, 해외반응'
    : '영화·드라마·애니메이션 검색 — R의 필름공장'

  return (
    <Layout title={pageTitle} description={pageDesc}>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <PageTracker />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 60px' }}>
        {/* 검색바 */}
        <div style={{ maxWidth: 600, margin: '0 auto 32px' }}>
          <SearchBar posts={posts} />
        </div>

        {/* 결과 카운트 + 제목 */}
        {query && results !== null && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
              <span style={{ color: 'var(--primary-color, #e50914)' }}>&ldquo;{query}&rdquo;</span> 검색 결과
            </h1>
            <p style={{ fontSize: 14, opacity: 0.5, margin: 0 }}>
              {results.length}개 결과
            </p>
          </div>
        )}

        {/* 결과 없음 */}
        {query && results !== null && results.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px', opacity: 0.4,
          }}>
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>&#128270;</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>검색 결과가 없습니다</p>
            <p style={{ fontSize: 14 }}>다른 키워드로 다시 검색해 보세요.</p>
          </div>
        )}

        {/* 검색 전 상태 */}
        {!query && (
          <div style={{
            textAlign: 'center', padding: '80px 20px', opacity: 0.4,
          }}>
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>&#128270;</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>작품명, 감독, 배우, 장르로 검색하세요</p>
          </div>
        )}

        {/* 결과 그리드 */}
        {results !== null && results.length > 0 && (
          <div className="search-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}>
            {results.map(function (post) {
              return <PostCard key={post.id} post={post} />
            })}
          </div>
        )}

        {/* 홈으로 */}
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
          .search-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .search-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .search-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
