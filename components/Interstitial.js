import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

const SESSION_KEY = 'interstitial_count'
const PAGE_KEY = 'interstitial_page_count'
const FIRST_SHOWN_KEY = 'interstitialFirstShown'
const MAX_PER_SESSION = 3
const EVERY_N_PAGES = 3

export default function Interstitial() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef(null)
  const firstTimerRef = useRef(null)
  const adPushed = useRef(false)
  const isMobile = useRef(false)

  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const check = () => {
      isMobile.current = window.innerWidth <= 768
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 최초 1분 후 자동 노출 (모바일, 세션 내 최초 1회)
  useEffect(() => {
    if (!isMobile.current) return
    if (sessionStorage.getItem(FIRST_SHOWN_KEY)) return

    firstTimerRef.current = setTimeout(() => {
      // 다시 한번 모바일 체크 (창 크기 변경 대비)
      if (!isMobile.current) return
      if (sessionStorage.getItem(FIRST_SHOWN_KEY)) return

      const sessionCount = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10)
      if (sessionCount >= MAX_PER_SESSION) return

      sessionStorage.setItem(FIRST_SHOWN_KEY, '1')
      adPushed.current = false
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, String(sessionCount + 1))
    }, 60000)

    return () => {
      if (firstTimerRef.current) clearTimeout(firstTimerRef.current)
    }
  }, [])

  // 광고 AdSense push
  useEffect(() => {
    if (visible && !adPushed.current && process.env.NODE_ENV === 'production') {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        adPushed.current = true
      } catch (e) {
        console.error('Interstitial AdSense error:', e)
      }
    }
  }, [visible])

  // 카운트다운 자동닫힘
  useEffect(() => {
    if (!visible) {
      setCountdown(5)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    setCountdown(5)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setVisible(false)
          adPushed.current = false
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [visible])

  // 라우트 변경 감지
  useEffect(() => {
    const handleRouteChange = () => {
      if (!isMobile.current) return

      // 세션 카운트 확인
      const sessionCount = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10)
      if (sessionCount >= MAX_PER_SESSION) return

      // 페이지 카운트 확인 (3페이지마다 1번)
      const pageCount = parseInt(sessionStorage.getItem(PAGE_KEY) || '0', 10) + 1
      sessionStorage.setItem(PAGE_KEY, String(pageCount))

      if (pageCount % EVERY_N_PAGES !== 0) return

      // 광고 표시
      adPushed.current = false
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, String(sessionCount + 1))
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router])

  const handleClose = () => {
    setVisible(false)
    adPushed.current = false
    if (timerRef.current) clearInterval(timerRef.current)
  }

  if (!visible) return null

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#111',
          borderRadius: 16,
          padding: '24px 20px 20px',
          width: 'min(360px, 92vw)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          textAlign: 'center',
          cursor: 'default',
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          aria-label="광고 닫기"
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
            opacity: 0.8,
            padding: '0 4px',
          }}
        >
          ✕
        </button>

        {/* 카운트다운 */}
        <p style={{
          fontSize: 11,
          color: '#aaa',
          margin: '0 0 14px',
          letterSpacing: '0.05em',
        }}>
          {countdown > 0 ? `${countdown}초 후 자동 닫힘` : '닫는 중...'}
        </p>

        {/* 광고 영역 */}
        {process.env.NODE_ENV === 'production' ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: 250 }}
            data-ad-client="ca-pub-8640254349508671"
            data-ad-slot="6297515693"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div style={{
            background: '#222',
            border: '2px dashed #555',
            borderRadius: 8,
            padding: '40px 20px',
            color: '#888',
            fontSize: 13,
          }}>
            [전면 광고 영역]<br />
            <span style={{ fontSize: 11, opacity: 0.6 }}>slot: 6297515693</span>
          </div>
        )}

        {/* 하단 닫기 텍스트 버튼 */}
        <button
          onClick={handleClose}
          style={{
            marginTop: 14,
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}
