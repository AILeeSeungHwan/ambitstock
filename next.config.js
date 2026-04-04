/** @type {import('next').NextConfig} */
const posts = require('./data/posts')
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/rss.xml', destination: '/api/rss' },
      { source: '/feed', destination: '/api/rss' },
    ]
  },
  async redirects() {
    // 숫자 ID → 올바른 URL 301 리다이렉트 (tistory 포스트는 /entry/, 신규는 /slug/)
    const idRedirects = posts.map(p => ({
      source: '/' + p.id,
      destination: p.tistorySlug ? '/entry/' + p.tistorySlug + '/' : '/' + p.slug + '/',
      permanent: true,
    }))

    return [
      // 모바일 entry URL → 데스크탑 entry URL
      { source: '/m/entry/:path*', destination: '/entry/:path*', permanent: true },

      // 숫자 ID 리다이렉트 (동적 생성)
      ...idRedirects,

      // Fallback catch-all
      { source: '/category/:path*', destination: '/', permanent: true },
      { source: '/category', destination: '/', permanent: true },
      { source: '/tag/:path*', destination: '/', permanent: true },
      { source: '/guestbook', destination: '/', permanent: true },
      { source: '/m/category/:path*', destination: '/', permanent: true },
      { source: '/m/category', destination: '/', permanent: true },
      { source: '/archive/:path*', destination: '/', permanent: true },

      // /entry/ URLs은 entry/[slug].js 페이지가 처리 (tistorySlug 기반 301 리다이렉트)
    ]
  },
}
