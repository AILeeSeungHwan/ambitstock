/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  async redirects() {
    return [
      // ---------------------------------------------------------------
      // 티스토리 → Next.js 이관 리다이렉트
      //
      // Phase 3-4에서 개별 포스트 이관이 완료되면 /entry/:path* 패턴을
      // 각 실제 Next.js slug 경로로 1:1 매핑하는 개별 규칙으로 교체한다.
      // 현재는 색인 손실 최소화를 위해 홈으로 임시 301 리다이렉트.
      // MIGRATION_MAP.md 생성 후 개별 URL 매핑을 여기에 추가할 것.
      // ---------------------------------------------------------------

      // /entry/:path* → / (티스토리 포스트 URL, 424개 대상)
      {
        source: '/entry/:path*',
        destination: '/',
        permanent: true,
      },

      // /category/:path* → / (티스토리 카테고리 페이지)
      {
        source: '/category/:path*',
        destination: '/',
        permanent: true,
      },

      // /tag/:path* → / (티스토리 태그 페이지)
      {
        source: '/tag/:path*',
        destination: '/',
        permanent: true,
      },

      // /guestbook → / (티스토리 방명록)
      {
        source: '/guestbook',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

