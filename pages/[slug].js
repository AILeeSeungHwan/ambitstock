import Head from 'next/head'
import Layout from '../components/Layout'
import AdUnit from '../components/AdUnit'
import PageTracker from '../components/PageTracker'
import Breadcrumb from '../components/Breadcrumb'
import InfoBox from '../components/InfoBox'
import ContentTypeBadge from '../components/ContentTypeBadge'
import SpoilerBadge from '../components/SpoilerBadge'
import SummaryBox from '../components/SummaryBox'
import posts from '../data/posts'
import works from '../data/works'
import getPostUrl from '../lib/getPostUrl'
import getOgImage from '../lib/getOgImage'
import { getInternalLinks } from '../lib/internal-links'
import { getSimilarWorks } from '../lib/similar-works'
import { renderSections } from '../components/PostRenderer'

export async function getStaticPaths() {
  // tistorySlug가 없는 포스트만 /{slug}/ 경로 생성
  // tistorySlug 포스트는 /entry/{tistorySlug}/ 에서 직접 서빙
  const slugSet = new Set()
  const paths = []
  for (const p of posts) {
    if (p.tistorySlug) continue
    const s = String(p.slug)
    if (!slugSet.has(s)) {
      slugSet.add(s)
      paths.push({ params: { slug: s } })
    }
  }
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const meta = posts.find(p => !p.tistorySlug && String(p.slug) === params.slug)
  if (!meta) return { notFound: true }

  const getPostProps = require('../lib/getPostProps')
  const result = getPostProps(meta)
  if (!result) return { notFound: true }
  return { props: result }
}

/* ─── TOC ─── */
function TOC({ sections }) {
  const h2s = sections.filter(s => s.type === 'h2')
  if (h2s.length === 0) return null
  return (
    <nav style={{
      background: 'rgba(128,128,128,0.04)',
      borderRadius: 12,
      padding: '20px 24px',
      margin: '24px 0 32px',
      borderLeft: '3px solid var(--primary-color, #e50914)',
    }}>
      <strong style={{ fontSize: 13, display: 'block', marginBottom: 12, opacity: 0.6, fontWeight: 700, letterSpacing: 0.5 }}>목차</strong>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'toc' }}>
        {h2s.map((s, i) => (
          <li key={i} style={{ marginBottom: 6, counterIncrement: 'toc' }}>
            <a href={'#' + s.id} style={{
              fontSize: 14, textDecoration: 'none', opacity: 0.7,
              display: 'flex', alignItems: 'baseline', gap: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              <span style={{ fontSize: 11, opacity: 0.4, fontWeight: 600, minWidth: 16 }}>{i + 1}.</span>
              {s.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ─── 섹션 렌더러 ─── */
function SectionRenderer({ section }) {
  switch (section.type) {
    case 'intro':
      return <div style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 24, opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: section.html }} />

    case 'cta':
      return (
        <a href={section.href} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{
          display: 'block', textAlign: 'center', padding: '14px 24px',
          background: 'linear-gradient(135deg, var(--primary-color, #e50914), var(--accent-color, #ff4d4d))',
          color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15,
          textDecoration: 'none', margin: '24px 0',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 16px rgba(229,9,20,0.25)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(229,9,20,0.35)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(229,9,20,0.25)' }}
        >
          {section.text}
        </a>
      )

    case 'toc':
      return null

    case 'ad':
      return <AdUnit slot={section.slot} format={section.format} />

    case 'h2':
      return (
        <h2 id={section.id} style={{
          fontSize: 22, fontWeight: 800, margin: '48px 0 16px', lineHeight: 1.4,
          paddingTop: 16,
          ...(section.gradientStyle ? {
            background: section.gradientStyle, color: '#fff',
            padding: '16px 24px', borderRadius: 12, marginTop: 48,
          } : {}),
        }}>
          {section.text}
        </h2>
      )

    case 'body':
      return <div className="post-body" style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: section.html }} />

    case 'image':
      return (
        <figure style={{ margin: '32px 0', textAlign: 'center' }}>
          <img src={section.src} alt={section.alt || ''} style={{
            maxWidth: '100%', borderRadius: 10,
            border: '1px solid rgba(128,128,128,0.1)',
          }} loading="lazy" />
          {section.caption && (
            <figcaption style={{ fontSize: 12, opacity: 0.4, marginTop: 8, fontStyle: 'italic' }}>{section.caption}</figcaption>
          )}
        </figure>
      )

    case 'ending':
      return (
        <div style={{
          fontSize: 16, lineHeight: 1.9, marginTop: 32, padding: '24px',
          background: 'var(--secondary-color, rgba(229,9,20,0.04))', borderRadius: 12,
          borderLeft: '4px solid var(--primary-color, #e50914)',
        }} dangerouslySetInnerHTML={{ __html: section.html }} />
      )

    default:
      return null
  }
}

/* ─── 관련 포스팅 카드 ─── */
function RelatedCard({ post }) {
  const CATEGORY_COLORS = {
    '영화추천': { bg: '#e3f2fd', text: '#1565c0' },
    '해외반응후기': { bg: '#ffebee', text: '#c62828' },
    '마블': { bg: '#ede7f6', text: '#4527a0' },
    '드라마': { bg: '#f3e5f5', text: '#7b1fa2' },
    '애니메이션': { bg: '#e0f2f1', text: '#00695c' },
  }
  const cat = CATEGORY_COLORS[post.category] || { bg: '#f5f5f5', text: '#666' }

  return (
    <a href={getPostUrl(post)} className="related-card" style={{
      textDecoration: 'none', color: 'inherit',
      display: 'flex', flexDirection: 'column',
      borderRadius: 10, overflow: 'hidden',
      border: '1px solid var(--border-color, #eee)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ height: 120, overflow: 'hidden', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 28, opacity: 0.5 }}>🎬</span>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: cat.bg, color: cat.text }}>{post.category}</span>
          {post.contentType && <ContentTypeBadge type={post.contentType} />}
        </div>
        <h4 style={{
          fontSize: 13, fontWeight: 600, lineHeight: 1.4, margin: '8px 0 0',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{post.title}</h4>
      </div>
      <style jsx>{`
        .related-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
      `}</style>
    </a>
  )
}

export default function PostPage({ meta, postData, related, internalLinks, similarPosts }) {
  if (!meta || !postData) return null

  const canonicalUrl = meta.tistorySlug
    ? 'https://ambitstock.com/entry/' + meta.tistorySlug + '/'
    : 'https://ambitstock.com/' + meta.slug + '/'
  const allImages = postData.sections.filter(s => s.type === 'image' && s.src).map(s => 'https://ambitstock.com' + s.src)
  const bodyText = postData.sections.filter(s => s.type === 'body' || s.type === 'intro').map(s => (s.html || '').replace(/<[^>]*>/g, '')).join(' ')
  const wordCount = bodyText.length

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    image: allImages.length > 0 ? allImages : undefined,
    datePublished: meta.date,
    dateModified: meta.date,
    author: { '@type': 'Organization', name: 'R의 필름공장', url: 'https://ambitstock.com' },
    publisher: { '@type': 'Organization', name: 'R의 필름공장', url: 'https://ambitstock.com', logo: { '@type': 'ImageObject', url: 'https://ambitstock.com/favicon.svg' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: meta.category,
    keywords: meta.tags ? meta.tags.join(', ') : undefined,
    wordCount: wordCount > 0 ? wordCount : undefined,
    inLanguage: 'ko',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article header h1', '.post-body']
    },
  }

  return (
    <Layout title={meta.title} description={meta.description}>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {meta.ogImage && <meta property="og:image" content={'https://ambitstock.com' + meta.ogImage} />}
        <meta name="article:published_time" content={meta.date} />
        <meta name="article:section" content={meta.category} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Review schema for 후기 posts with rating-related titles */}
        {meta.contentType === '후기' && /평점|점수|별점|rating|리뷰|후기|평가/.test(meta.title) && (() => {
          const reviewLd = {
            '@context': 'https://schema.org',
            '@type': 'Review',
            name: meta.title,
            author: { '@type': 'Organization', name: 'R의 필름공장', url: 'https://ambitstock.com' },
            datePublished: meta.date,
            reviewBody: meta.description,
            itemReviewed: { '@type': 'Movie', name: meta.title.split(/\s*[—\-:·]/)[0].trim() },
          }
          return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }} />
        })()}
        {/* FAQPage schema for 해석 posts with Q&A-style h2 headings */}
        {meta.contentType === '해석' && (() => {
          const sections = postData.sections.filter(Boolean)
          const faqs = []
          for (let i = 0; i < sections.length; i++) {
            const s = sections[i]
            if (s.type === 'h2' && /\?|인가|일까|였을까|무엇|왜|어떻게|의미는|뜻은|까$/.test(s.text)) {
              const nextBody = sections.slice(i + 1).find(ns => ns.type === 'body')
              if (nextBody && nextBody.html) {
                faqs.push({
                  '@type': 'Question',
                  name: s.text,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: nextBody.html.replace(/<[^>]*>/g, '').slice(0, 500),
                  },
                })
              }
            }
          }
          if (faqs.length === 0) return null
          const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs }
          return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        })()}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', position: 1, name: 'R의 필름공장', item: 'https://ambitstock.com' },
            { '@type': 'ListItem', position: 2, name: meta.category, item: 'https://ambitstock.com/?cat=' + encodeURIComponent(meta.category) },
            { '@type': 'ListItem', position: 3, name: meta.title }
          ]
        }) }} />
      </Head>

      <PageTracker slug={meta.slug} />

      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* 브레드크럼 */}
        <Breadcrumb items={[
          { label: '홈', href: '/' },
          ...(internalLinks && internalLinks.parentHub ? [{ label: internalLinks.parentHub.label, href: internalLinks.parentHub.href }] : [{ label: meta.category, href: '/?cat=' + encodeURIComponent(meta.category) }]),
          { label: meta.title.length > 30 ? meta.title.slice(0, 30) + '...' : meta.title },
        ]} />

        <header style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-color, #eee)' }}>
          {/* 배지 줄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: 'color-mix(in srgb, var(--primary-color, #e50914) 8%, transparent)', color: 'var(--primary-color, #e50914)',
            }}>
              {meta.category}
            </span>
            {meta.contentType && <ContentTypeBadge type={meta.contentType} size="medium" />}
            <time style={{ fontSize: 13, opacity: 0.4 }}>{meta.date}</time>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            {meta.title}
          </h1>
          {meta.description && (
            <p style={{ fontSize: 16, opacity: 0.55, lineHeight: 1.6, margin: 0 }}>
              {meta.description.length > 120 ? meta.description.slice(0, 120) + '...' : meta.description}
            </p>
          )}

          {/* 정보 박스 */}
          <div style={{ marginTop: 16 }}>
            <InfoBox meta={meta} />
          </div>

          {meta.tags && meta.tags.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {meta.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(128,128,128,0.07)', opacity: 0.6,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <SummaryBox sections={postData.sections} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, margin: '0 0 8px' }}>
          <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
          <AdUnit slot="6297515693" format="auto" style={{ minWidth: 0 }} />
        </div>

        {renderSections(postData.sections, TOC)}
      </article>

      {related && related.length > 0 && (
        <section style={{ maxWidth: 720, margin: '56px auto 0' }}>
          <div style={{
            borderTop: '1px solid var(--border-color, #eee)',
            paddingTop: 32,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, opacity: 0.7 }}>
              관련 포스팅
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {related.map(post => (
                <RelatedCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 같은 작품의 다른 글 */}
      {internalLinks && internalLinks.sameWork && internalLinks.sameWork.length > 0 && (
        <section style={{ maxWidth: 720, margin: '40px auto 0' }}>
          <div style={{
            borderTop: '1px solid var(--border-color, #eee)',
            paddingTop: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 8 }}>
              같은 작품의 다른 글
              {internalLinks.parentHub && (
                <a href={internalLinks.parentHub.href} style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, textDecoration: 'none', color: 'var(--primary-color, #e50914)' }}>
                  전체 보기 →
                </a>
              )}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {internalLinks.sameWork.map(post => (
                <a key={post.id} href={getPostUrl(post)} style={{
                  textDecoration: 'none', color: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  border: '1px solid var(--border-color, #eee)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {post.thumbnail && (
                    <img src={post.thumbnail} alt={post.title} loading="lazy" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                    <span style={{ fontSize: 11, opacity: 0.4 }}>{post.date}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 이 작품이 좋았다면 (태그 기반 유사 추천) */}
      {similarPosts && similarPosts.length > 0 && (
        <section style={{ maxWidth: 720, margin: '40px auto 0' }}>
          <div style={{
            borderTop: '1px solid var(--border-color, #eee)',
            paddingTop: 32,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, opacity: 0.7 }}>
              이 작품이 좋았다면
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {similarPosts.map(post => (
                <RelatedCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 다음에 읽을 글 CTA */}
      {(() => {
        const nextPost = (internalLinks && internalLinks.nextRead) || (related && related.length > 0 ? related[0] : null)
        if (!nextPost) return null
        return (
          <div style={{
            maxWidth: 720, margin: '32px auto 0',
            padding: '20px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(229,9,20,0.04), rgba(229,9,20,0.08))',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, opacity: 0.5, margin: '0 0 4px', fontWeight: 600 }}>다음에 읽을 글</p>
              <a href={getPostUrl(nextPost)} style={{
                fontSize: 15, fontWeight: 700, textDecoration: 'none', color: 'inherit',
                lineHeight: 1.4,
              }}>
                {nextPost.title}
              </a>
            </div>
            <a href={getPostUrl(nextPost)} style={{
              padding: '8px 16px', borderRadius: 20,
              background: 'var(--primary-color, #e50914)', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              읽기 →
            </a>
          </div>
        )
      })()}

      <div style={{ maxWidth: 720, margin: '32px auto 0' }}>
        <AdUnit slot="6297515693" format="auto" />
      </div>

      <style jsx global>{`
        .post-body ul { padding-left: 24px; margin: 12px 0 20px; }
        .post-body li { margin-bottom: 8px; line-height: 1.8; font-size: 15px; }
        .post-body strong { font-weight: 700; }
        .post-body a { color: var(--primary-color, #e50914); text-decoration: underline; text-underline-offset: 3px; }
        article h2:target { animation: highlight 1.5s ease; }
        @keyframes highlight { 0%{ background: rgba(229,9,20,0.12); } 100%{ background: transparent; } }
        @media (max-width: 768px) {
          article h1 { font-size: 24px !important; }
          article h2 { font-size: 18px !important; }
        }
      `}</style>
    </Layout>
  )
}
