import { useEffect, useRef, useState } from 'react'

const KEY_LINK = 'interstitial_link_last'
const KEY_AUTO = 'interstitial_auto_last'
const COOLDOWN_LINK = 2 * 60 * 1000   // 2분
const COOLDOWN_AUTO  = 5 * 60 * 1000  // 5분
const AUTO_DELAY     = 60 * 1000      // 1분

export default function Interstitial() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const pendingHref = useRef(null)
  const adPushed = useRef(false)
  const timerRef = useRef(null)
  const autoTimerRef = useRef(null)

  /* ── 광고 열기 ── */
  const openAd = (href = null) => {
    pendingHref.current = href
    adPushed.current = false
    setCountdown(5)
    setVisible(true)
  }

  /* ── 광고 닫기 (href 이동 처리) ── */
  const closeAd = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setVisible(false)
    adPushed.current = false

    const href = pendingHref.current
    pendingHref.current = null
    if (href) {
      setTimeout(() => { window.location.href = href }, 0)
    }
  }

  /* ── a 태그 클릭 가로채기 (capture phase) ── */
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      // #, javascript:, 빈 href 제외
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return

      const now = Date.now()
      const last = parseInt(sessionStorage.getItem(KEY_LINK) || '0', 10)
      if (now - last < COOLDOWN_LINK) return  // 2분 쿨다운 중

      // 링크 이동 막고 광고 표시
      e.preventDefault()
      e.stopPropagation()
      sessionStorage.setItem(KEY_LINK, String(now))

      // 절대 URL 정규화
      let target = href
      if (href.startsWith('/') || !href.includes('://')) {
        try {
          target = new URL(href, window.location.origin).href
        } catch (_) {
          target = href
        }
      }

      openAd(target)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  /* ── 1분 자동 노출 ── */
  useEffect(() => {
    const now = Date.now()
    const lastAuto = parseInt(sessionStorage.getItem(KEY_AUTO) || '0', 10)

    // 이미 자동 노출됐으면 스킵
    if (lastAuto > 0) return

    autoTimerRef.current = setTimeout(() => {
      // 이미 자동 노출 기록 있으면 스킵 (다른 탭 등)
      const check = parseInt(sessionStorage.getItem(KEY_AUTO) || '0', 10)
      if (check > 0) return

      sessionStorage.setItem(KEY_AUTO, String(Date.now()))
      openAd(null)
    }, AUTO_DELAY)

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    }
  }, [])

  /* ── AdSense push ── */
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

  /* ── 5초 카운트다운 자동 닫기 ── */
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
          // pendingHref는 closeAd 내부에서 처리
          closeAd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [visible])

  if (!visible) return null

  return (
    <div
      onClick={closeAd}
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
          width: 'min(380px, 92vw)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          textAlign: 'center',
          cursor: 'default',
        }}
      >
        {/* 닫기 X 버튼 */}
        <button
          onClick={closeAd}
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

        {/* 건너뛰기 */}
        <button
          onClick={closeAd}
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
