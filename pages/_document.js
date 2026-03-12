import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640254349508671"
          crossOrigin="anonymous"
        />
        {/* Naver Webmaster */}
        <meta name="naver-site-verification" content="ef5c3c3738f136552a02e2a7c27ec6ac1e83339f" />
        {/* Google Search Console */}
        <meta name="google-site-verification" content="2DAD_BGWxdRXKWrw6lYKe6e0p3BLAiAXbMHVYXrU48k" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
