import { useEffect, useRef, useState } from 'react'

/*
 * eager=true  → 즉시 push (폴드 위 광고, sticky 광고에 사용)
 * eager=false → IntersectionObserver (기본, lazy)
 * rootMargin을 500px로 확장해 뷰포트 진입 전에 미리 로드 → viewability 개선
 */
export default function AdUnit({ slot, format, style, eager }) {
  const containerRef = useRef(null)
  const pushed = useRef(false)
  const [visible, setVisible] = useState(!!eager)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (eager) {
      // eager: 마운트 즉시 push (double rAF로 레이아웃 완료 후)
      let raf1, raf2
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!pushed.current) {
            try {
              ;(window.adsbygoogle = window.adsbygoogle || []).push({})
              pushed.current = true
            } catch (e) {
              console.error('AdSense push error:', e)
            }
          }
        })
      })
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
    }

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visible) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '500px' }  // 200px → 500px: 뷰포트 진입 전 미리 로드
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || eager) return  // eager는 위에서 처리
    if (pushed.current) return
    if (typeof window === 'undefined') return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (e) {
      console.error('AdSense push error:', e)
    }
  }, [visible])

  const adSlot = slot || '6297515693'
  const adFormat = format || 'auto'

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{
        background: '#f0f0f0',
        border: '2px dashed #ccc',
        borderRadius: 8,
        padding: '20px',
        textAlign: 'center',
        margin: '20px 0',
        fontSize: 13,
        color: '#999',
        ...style,
      }}>
        Ad Area ({eager ? 'eager' : 'lazy'} · slot: {adSlot})
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden', ...style }}>
      {(visible || eager) && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8640254349508671"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
