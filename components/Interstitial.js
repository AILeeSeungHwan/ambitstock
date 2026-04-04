import { useEffect, useRef, useState } from 'react'

const KEY_LINK = 'interstitial_link_last'
const KEY_AUTO = 'interstitial_auto_last'
const COOLDOWN_LINK = 2 * 60 * 1000   // 2분
const COOLDOWN_AUTO  = 5 * 60 * 1000  // 5분
const AUTO_DELAY     = 60 * 1000      // 1분
const COUNTDOWN_SEC  = 3

export default function Interstitial() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)
  const pendingHref = useRef(null)
  const adPushed = useRef(false)
  const timerRef = useRef(null)
  const autoTimerRef = useRef(null)

  /* ── 광고 열기 ── */
  const openAd = (href = null) => {
    pendingHref.current = href
    adPushed.current = false
    setCountdown(COUNTDOWN_SEC)
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

  /* ── 3초 카운트다운 자동 닫기 ── */
  useEffect(() => {
    if (!visible) {
      setCountdown(COUNTDOWN_SEC)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    setCountdown(COUNTDOWN_SEC)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
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
    <>
      <style>{`
        .interstitial-box {
          position: relative;
          background: #111;
          border-radius: 16px;
          width: 70vw;
          height: 70vh;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .interstitial-box {
            width: 90vw;
            height: 90vh;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
        }}
      >
        <div className="interstitial-box">
          {/* 닫기 버튼 — 우상단, 소형 원형 */}
          <button
            onClick={closeAd}
            aria-label="광고 닫기"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              lineHeight: '24px',
              textAlign: 'center',
              padding: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {countdown > 0 ? countdown : '✕'}
          </button>

          {/* 광고 영역 — 100% × 100% */}
          {process.env.NODE_ENV === 'production' ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '100%' }}
              data-ad-client="ca-pub-8640254349508671"
              data-ad-slot="6297515693"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#222',
              border: '2px dashed #555',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: 13,
            }}>
              [전면 광고 영역]<br />
              <span style={{ fontSize: 11, opacity: 0.6 }}>slot: 6297515693</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
