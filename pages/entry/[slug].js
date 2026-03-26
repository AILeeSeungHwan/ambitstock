import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import posts from '../../data/posts'

export async function getStaticPaths() {
  const paths = posts
    .filter(p => p.tistorySlug)
    .map(p => ({ params: { slug: String(p.tistorySlug) } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const allPosts = require('../../data/posts').default || require('../../data/posts')
  const meta = allPosts.find(p => p.tistorySlug && decodeURIComponent(String(p.tistorySlug)) === decodeURIComponent(params.slug))
  if (!meta) return { notFound: true }
  return { props: { newUrl: '/' + meta.slug + '/' } }
}

export default function EntryRedirect({ newUrl }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(newUrl)
  }, [newUrl, router])

  return (
    <Head>
      <link rel="canonical" href={'https://ambitstock.com' + newUrl} />
      <meta httpEquiv="refresh" content={'0;url=' + newUrl} />
      <title>리다이렉트 중...</title>
    </Head>
  )
}
