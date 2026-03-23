import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* Google AdSense — 앵커/오버레이 자동 광고 비활성화 */}
        <meta name="google-adsense-platform-account" content="ca-pub-8640254349508671" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640254349508671"
          crossOrigin="anonymous"
          data-overlays="bottom"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          /* AdSense 앵커(상단 내려오는) 광고 완전 제거 + 빈 공간 방지 */
          ins.adsbygoogle[data-anchor-status],
          ins.adsbygoogle[data-ad-format="auto"][data-anchor-shown],
          div[id^="google_ads_iframe"][style*="position: fixed"],
          div[id^="aswift_"][style*="position: fixed"],
          div.google-auto-placed[style*="position: fixed"],
          div[style*="position: fixed"][style*="z-index: 2147483647"] {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* body가 밀리지 않도록 */
          html, body {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        ` }} />

        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5ZWNDJC2');` }} />

        {/* GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TDNR06LXCE" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TDNR06LXCE');` }} />

        {/* Microsoft Clarity */}
        <script dangerouslySetInnerHTML={{ __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "kejsxfywt0");` }} />

        {/* Naver Webmaster */}
        <meta name="naver-site-verification" content="ef5c3c3738f136552a02e2a7c27ec6ac1e83339f" />
        {/* Google Search Console */}
        <meta name="google-site-verification" content="2DAD_BGWxdRXKWrw6lYKe6e0p3BLAiAXbMHVYXrU48k" />

        {/* SEO Meta */}
        <meta name="keywords" content="영화 추천, 넷플릭스 추천, 드라마 추천, 해외반응, 마블, 애니메이션, OTT 추천, 영화 리뷰, 결말 해석, R의 필름공장" />
        <meta name="author" content="R의 필름공장" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://ambitstock.com/" />

        {/* Open Graph defaults */}
        <meta property="og:site_name" content="R의 필름공장" />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ambitstock" />

        {/* JSON-LD: WebSite + SearchAction (사이트링크 검색창) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "R의 필름공장",
          "alternateName": ["ambitstock", "R의 필름공장 영화 추천"],
          "url": "https://ambitstock.com",
          "description": "영화·드라마·애니메이션 추천, 해외반응, OTT 가이드, 결말 해석 — 오늘 뭐 볼지 골라주는 사이트",
          "publisher": {
            "@type": "Organization",
            "name": "R의 필름공장",
            "url": "https://ambitstock.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ambitstock.com/favicon.svg"
            }
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://ambitstock.com/?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }) }} />

        {/* JSON-LD: Organization (지식 패널) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "R의 필름공장",
          "url": "https://ambitstock.com",
          "logo": "https://ambitstock.com/favicon.svg",
          "sameAs": []
        }) }} />
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5ZWNDJC2"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
