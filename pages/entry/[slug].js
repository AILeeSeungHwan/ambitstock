import Head from 'next/head'
import Layout from '../../components/Layout'
import AdUnit from '../../components/AdUnit'
import PageTracker from '../../components/PageTracker'
import posts from '../../data/posts'
import getPostUrl from '../../lib/getPostUrl'

export async function getStaticPaths() {
  const paths = posts
    .filter(p => p.tistorySlug)
    .map(p => ({ params: { slug: String(p.tistorySlug) } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const meta = posts.find(p => String(p.tistorySlug) === params.slug)
  if (!meta) return { notFound: true }

  let postData = null
  try {
    const mod = require('../../posts/' + meta.id + '.js')
    postData = mod.default || mod
    postData.sections = Array.from(postData.sections).filter(Boolean)
  } catch (e) {
    return { notFound: true }
  }

  const firstImage = postData.sections.find(s => s.type === 'image')
  const thumbnail = meta.thumbnail || (firstImage ? firstImage.src : null)

  const related = posts
    .filter(p => p.id !== meta.id && p.category === meta.category)
    .slice(0, 4)
    .map(p => {
      let relThumb = p.thumbnail
      if (!relThumb) {
        try {
          const rm = require('../../posts/' + p.id + '.js')
          const rd = rm.default || rm
          const ri = rd.sections.find(s => s.type === 'image')
          relThumb = ri ? ri.src : null
        } catch (e) {}
      }
      return { id: p.id, slug: p.slug, tistorySlug: p.tistorySlug || null, title: p.title, date: p.date, category: p.category, thumbnail: relThumb }
    })

  const safeMeta = Object.fromEntries(Object.entries({ ...meta, thumbnail }).filter(([, v]) => v !== undefined))
  return { props: { meta: safeMeta, postData, related } }
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
  const postUrl = getPostUrl(post)

  return (
    <a href={postUrl} className="related-card" style={{
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
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: cat.bg, color: cat.text }}>{post.category}</span>
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

export default function EntryPostPage({ meta, postData, related }) {
  if (!meta || !postData) return null

  const canonicalUrl = 'https://ambitstock.com/entry/' + meta.tistorySlug + '/'
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: meta.title, description: meta.description,
    image: meta.thumbnail ? 'https://ambitstock.com' + meta.thumbnail : undefined,
    datePublished: meta.date, dateModified: meta.date,
    author: { '@type': 'Organization', name: 'R의 필름공장', url: 'https://ambitstock.com' },
    publisher: { '@type': 'Organization', name: 'R의 필름공장', url: 'https://ambitstock.com', logo: { '@type': 'ImageObject', url: 'https://ambitstock.com/favicon.svg' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  }

  return (
    <Layout title={meta.title} description={meta.description}>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {meta.thumbnail && <meta property="og:image" content={'https://ambitstock.com' + meta.thumbnail} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <PageTracker slug={meta.tistorySlug} />

      <article style={{ maxWidth: 720, margin: '0 auto' }}>
        <header style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-color, #eee)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: 'color-mix(in srgb, var(--primary-color, #e50914) 8%, transparent)', color: 'var(--primary-color, #e50914)',
            }}>
              {meta.category}
            </span>
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
          {meta.tags && meta.tags.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

        {postData.sections.filter(Boolean).map((section, i) => {
          if (section.type === 'toc') {
            return <TOC key={i} sections={postData.sections} />
          }
          return <SectionRenderer key={i} section={section} />
        })}
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
