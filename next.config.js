/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ]
  },
  async redirects() {
    return [
      // 모바일 entry URL → 데스크탑 entry URL
      { source: '/m/entry/:path*', destination: '/entry/:path*', permanent: true },

      // 티스토리 숫자 ID 리다이렉트
      { source: '/319', destination: '/', permanent: true },
      { source: '/23', destination: '/', permanent: true },

      // Fallback catch-all
      { source: '/category/:path*', destination: '/', permanent: true },
      { source: '/category', destination: '/', permanent: true },
      { source: '/tag/:path*', destination: '/', permanent: true },
      { source: '/guestbook', destination: '/', permanent: true },
      { source: '/m/category/:path*', destination: '/', permanent: true },
      { source: '/m/category', destination: '/', permanent: true },
      { source: '/archive/:path*', destination: '/', permanent: true },

      // Fallback: /entry/ URLs without matching tistorySlug → home
      { source: '/entry/:path*', destination: '/', permanent: false },
    ]
  },
}
