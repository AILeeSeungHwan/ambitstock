import { useEffect, useRef, useState } from 'react'

const KEY_LINK = 'interstitial_link_last'
const KEY_AUTO = 'interstitial_auto_last'
const COOLDOWN_LINK = 2 * 60 * 1000   // 2분
const COOLDOWN_AUTO  = 5 * 60 * 1000  // 5분
const AUTO_DELAY     = 60 * 1000      // 1분
const COUNTDOWN_SEC  = 5
const UNFILLED_TIMEOUT = 4000         // 4초 내 광고 미표시 → 자동 닫기

export default function Interstitial() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)
  const [adFilled, setAdFilled] = useState(false)   // 광고 정상 표시 여부
  const pendingHref = useRef(null)
  const pendingActionRef = useRef(null)
  const adPushed = useRef(false)
  const timerRef = useRef(null)
  const autoTimerRef = useRef(null)
  const insRef = useRef(null)
  const unfilledTimerRef = useRef(null)
  const mutationObRef = useRef(null)

  /* ── 광고 열기 ── */
  const openAd = (href = null) => {
    pendingHref.current = href
    adPushed.current = false
    setAdFilled(false)
    setCountdown(COUNTDOWN_SEC)
    setVisible(true)
  }

  /* ── 광고 닫기 ── */
  const closeAd = (navigate = true) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (unfilledTimerRef.current) clearTimeout(unfilledTimerRef.current)
    if (mutationObRef.current) { mutationObRef.current.disconnect(); mutationObRef.current = null }

    setVisible(false)
    setAdFilled(false)
    adPushed.current = false

    const href = pendingHref.current
    pendingHref.current = null
    const action = pendingActionRef.current
    pendingActionRef.current = null

    if (!navigate) return
    if (href) setTimeout(() => { window.location.href = href }, 0)
    else if (action) setTimeout(action, 0)
  }

  /* ── a 태그 클릭 가로채기 ── */
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
      const now = Date.now()
      const last = parseInt(sessionStorage.getItem(KEY_LINK) || '0', 10)
      if (now - last < COOLDOWN_LINK) return
      e.preventDefault()
      e.stopPropagation()
      sessionStorage.setItem(KEY_LINK, String(now))
      let target = href
      if (href.startsWith('/') || !href.includes('://')) {
        try { target = new URL(href, window.location.origin).href } catch (_) { target = href }
      }
      openAd(target)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  /* ── summary(QnA) 클릭 가로채기 ── */
  useEffect(() => {
    const handleSummaryClick = (e) => {
      const summary = e.target.closest('summary')
      if (!summary) return
      const now = Date.now()
      const last = parseInt(sessionStorage.getItem(KEY_LINK) || '0', 10)
      if (now - last < COOLDOWN_LINK) return
      e.preventDefault()
      e.stopPropagation()
      sessionStorage.setItem(KEY_LINK, String(now))
      const details = summary.closest('details')
      pendingActionRef.current = () => { if (details) details.open = !details.open }
      openAd(null)
    }
    document.addEventListener('click', handleSummaryClick, true)
    return () => document.removeEventListener('click', handleSummaryClick, true)
  }, [])

  /* ── 1분 자동 노출 ── */
  useEffect(() => {
    const lastAuto = parseInt(sessionStorage.getItem(KEY_AUTO) || '0', 10)
    if (lastAuto > 0) return
    autoTimerRef.current = setTimeout(() => {
      const check = parseInt(sessionStorage.getItem(KEY_AUTO) || '0', 10)
      if (check > 0) return
      sessionStorage.setItem(KEY_AUTO, String(Date.now()))
      openAd(null)
    }, AUTO_DELAY)
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current) }
  }, [])

  /* ── AdSense push + unfilled 감지 ── */
  useEffect(() => {
    if (!visible || adPushed.current || process.env.NODE_ENV !== 'production') return

    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          adPushed.current = true
        } catch (e) {
          console.error('Interstitial AdSense error:', e)
        }

        // ── unfilled 감지: MutationObserver로 data-ad-status 변화 감시 ──
        const insEl = insRef.current
        if (insEl) {
          const checkStatus = () => {
            const status = insEl.getAttribute('data-ad-status')
            if (status === 'unfilled') {
              // 광고 없음 → 즉시 닫기
              closeAd(true)
              return
            }
            if (status === 'filled' || (insEl.offsetHeight > 0 && insEl.children.length > 0)) {
              setAdFilled(true)
              if (unfilledTimerRef.current) clearTimeout(unfilledTimerRef.current)
              if (mutationObRef.current) { mutationObRef.current.disconnect(); mutationObRef.current = null }
            }
          }

          // MutationObserver: data-ad-status 속성 변화 감지
          const observer = new MutationObserver(checkStatus)
          observer.observe(insEl, { attributes: true, attributeFilter: ['data-ad-status'] })
          mutationObRef.current = observer

          // 폴백: UNFILLED_TIMEOUT 후에도 광고 미표시 → 자동 닫기
          unfilledTimerRef.current = setTimeout(() => {
            const status = insEl.getAttribute('data-ad-status')
            const hasContent = insEl.offsetHeight > 10
            if (!hasContent || status === 'unfilled') {
              closeAd(true)
            } else {
              setAdFilled(true)
            }
          }, UNFILLED_TIMEOUT)
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [visible])

  /* ── 5초 카운트다운 ── */
  useEffect(() => {
    if (!visible) {
      setCountdown(COUNTDOWN_SEC)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    setCountdown(COUNTDOWN_SEC)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [visible])

  if (!visible) return null

  const canClose = countdown <= 0

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
        .interstitial-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.4);
          color: #fff;
          font-size: 14px;
          line-height: 1;
          text-align: center;
          padding: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          transition: background 0.2s, opacity 0.2s;
        }
        .interstitial-close-btn.waiting {
          background: rgba(0,0,0,0.5);
          cursor: default;
          opacity: 0.7;
        }
        .interstitial-close-btn.ready {
          background: rgba(229,9,20,0.85);
          cursor: pointer;
          opacity: 1;
        }
        .interstitial-close-btn.ready:hover {
          background: rgba(229,9,20,1);
          transform: scale(1.1);
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
      }}>
        <div className="interstitial-box">
          {/* 닫기 버튼 */}
          <button
            onClick={canClose ? () => closeAd(true) : undefined}
            aria-label={canClose ? '광고 닫기' : `${countdown}초 후 닫기 가능`}
            className={'interstitial-close-btn ' + (canClose ? 'ready' : 'waiting')}
          >
            {canClose ? '✕' : countdown}
          </button>

          {/* 광고 영역 */}
          {process.env.NODE_ENV === 'production' ? (
            <ins
              ref={insRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '100%' }}
              data-ad-client="ca-pub-8640254349508671"
              data-ad-slot="6297515693"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', background: '#222',
              border: '2px dashed #555', borderRadius: 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#888', fontSize: 13,
            }}>
              [전면 광고 영역]<br />
              <span style={{ fontSize: 11, opacity: 0.6 }}>slot: 6297515693</span><br />
              <span style={{ fontSize: 11, marginTop: 8, color: canClose ? '#4caf50' : '#ff9800' }}>
                {canClose ? '✕ 버튼 활성화됨' : `${countdown}초 후 닫기 가능`}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
