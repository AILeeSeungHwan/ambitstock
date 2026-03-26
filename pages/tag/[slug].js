import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import ContentTypeBadge from '../../components/ContentTypeBadge'
import PageTracker from '../../components/PageTracker'
import getPostUrl from '../../lib/getPostUrl'

const POSTS_PER_LOAD = 12

/* ─── 주요 태그 SEO 인트로 (상위 50개) ─── */
const TAG_INTROS = {
  '넷플릭스': '넷플릭스에서 볼 수 있는 영화·드라마·시리즈 추천, 해석, 해외반응을 모았습니다.',
  '해외 반응': '한국 영화·드라마에 대한 해외 평론가와 관객의 실제 반응을 정리합니다.',
  '로튼 토마토': '로튼토마토 평점과 해외 평론가 리뷰를 기반으로 작품을 분석합니다.',
  '트렌드': '지금 화제가 되고 있는 영화·드라마 트렌드를 정리합니다.',
  '개봉 예정작': '곧 개봉하는 기대작의 정보와 사전 가이드를 모았습니다.',
  '평론가 후기': '국내외 평론가들의 전문 리뷰와 평가를 정리합니다.',
  '해외 평점': '해외 주요 평점 사이트의 점수와 평가를 비교·분석합니다.',
  '영화 추천': '장르별·상황별·취향별 영화 추천 가이드입니다.',
  '현재 상영작': '현재 극장에서 상영 중인 영화 정보와 관람 가이드입니다.',
  'OTT': 'OTT 플랫폼별 추천작과 신작 정보를 정리합니다.',
  '해외 후기': '해외 관객들의 생생한 관람 후기와 반응을 모았습니다.',
  '영화': '다양한 장르의 영화 리뷰·추천·해석을 모았습니다.',
  '애니메이션': '극장판·시리즈 애니메이션 추천과 해석을 모았습니다.',
  '디즈니플러스': '디즈니플러스에서 볼 수 있는 영화·드라마·마블·애니메이션 가이드입니다.',
  '해외 리뷰': '해외 매체와 관객의 리뷰를 번역·정리합니다.',
  '드라마 추천': '장르별·플랫폼별 드라마 추천 가이드입니다.',
  '해외 영화': '할리우드·유럽·아시아 등 해외 영화 추천과 해석입니다.',
  '오블완': '오블완 챌린지 참여 포스팅 모음입니다.',
  '마블': '마블 MCU 시리즈 해석·시청순서·해외반응을 모았습니다.',
  '공포 영화': '호러·공포 영화 추천과 결말 해석을 모았습니다.',
  '애니메이션 영화': '극장판 애니메이션 영화 추천·리뷰·해석입니다.',
  '티스토리챌린지': '티스토리 챌린지 참여 포스팅입니다.',
  '드라마': '국내외 드라마 추천·해석·시청 가이드입니다.',
  '2026영화': '2026년 개봉 영화 정보와 기대작 가이드입니다.',
  '리뷰': '영화·드라마 심층 리뷰와 감상 포인트 정리입니다.',
  '한국영화': '한국 영화 추천·흥행 분석·해외반응을 모았습니다.',
  '왕과사는남자': '왕과 사는 남자 관련 흥행·분석·해외반응 포스팅입니다.',
  '시사회 후기': '시사회 관람 후기와 사전 평가를 정리합니다.',
  '박스오피스': '주간·월간 박스오피스 순위와 흥행 분석입니다.',
  'K드라마': '한국 드라마 추천·해석·시청률 분석입니다.',
  'MCU': '마블 시네마틱 유니버스(MCU) 시리즈 해석과 시청 가이드입니다.',
  'OTT비교': 'OTT 플랫폼별 요금·콘텐츠·장단점을 비교합니다.',
  '봉준호': '봉준호 감독 작품 해석·해외반응·필모그래피 정리입니다.',
  'OTT추천': 'OTT에서 지금 볼 만한 작품 추천 가이드입니다.',
  '티빙': '티빙 오리지널·독점작 추천과 가이드입니다.',
  '기대작': '앞으로 개봉·공개 예정인 기대작 사전 정보입니다.',
  '프로젝트헤일메리': '프로젝트 헤일메리 관련 해석·리뷰·해외반응 포스팅입니다.',
  'SF영화': 'SF·공상과학 영화 추천과 결말 해석입니다.',
  '쿠팡플레이': '쿠팡플레이 오리지널·독점작 추천과 가이드입니다.',
  '수상작': '아카데미·칸·베니스 등 주요 영화제 수상작 정리입니다.',
  '세이렌': '세이렌(Siren) 드라마 관련 해석·리뷰 포스팅입니다.',
  '극장추천': '극장에서 보면 더 좋은 영화 추천입니다.',
  '2026드라마': '2026년 방영 드라마 정보와 시청 가이드입니다.',
  '넷플릭스 시청가능': '넷플릭스에서 바로 시청할 수 있는 작품 모음입니다.',
  '넷플릭스 드라마': '넷플릭스 오리지널·독점 드라마 추천과 가이드입니다.',
  '결말해석': '영화·드라마의 결말을 깊이 해석하고 숨겨진 의미를 분석합니다.',
  '디즈니': '디즈니 애니메이션·실사 영화 추천과 가이드입니다.',
  '재개봉': '재개봉 영화 정보와 극장 관람 가이드입니다.',
  '가족영화': '가족과 함께 보기 좋은 영화 추천입니다.',
  '크리스토퍼 놀란': '크리스토퍼 놀란 감독 작품 해석과 필모그래피 정리입니다.',
}

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

  // SEO 인트로: 매뉴얼 매핑 우선, 없으면 자동 생성
  const intro = TAG_INTROS[tagName]
    || ('\'' + tagName + '\' 관련 영화·드라마 포스팅 ' + filteredPosts.length + '편을 모았습니다.')

  return {
    props: {
      slug: params.slug,
      tagName,
      posts: filteredPosts,
      topicLink,
      intro,
    },
  }
}

export default function TagPage({ slug, tagName, posts, topicLink, intro }) {
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
          {intro && (
            <p style={{
              fontSize: 15, lineHeight: 1.7, opacity: 0.65,
              margin: '12px 0 0', maxWidth: 640,
            }}>
              {intro}
            </p>
          )}
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
