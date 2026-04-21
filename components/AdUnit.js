import { useEffect, useRef, useState } from 'react'

/*
 * props:
 *   slot     — AdSense ad-slot ID
 *   format   — 'auto' | 'fluid' (in-article)
 *   layout   — 'in-article' (in-article 전용)
 *   style    — 컨테이너 스타일 override
 *   eager    — true: 즉시 push (폴드 위 광고), false: lazy (기본)
 */
export default function AdUnit({ slot, format, layout, style, eager }) {
  const containerRef = useRef(null)
  const pushed = useRef(false)
  const [visible, setVisible] = useState(!!eager)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (eager) {
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
      { rootMargin: '500px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || eager) return
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
  const isInArticle = layout === 'in-article'

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{
        background: isInArticle ? '#e8f4e8' : '#f0f0f0',
        border: '2px dashed #ccc',
        borderRadius: 8,
        padding: '16px',
        textAlign: 'center',
        margin: '20px 0',
        fontSize: 12,
        color: '#999',
        ...style,
      }}>
        {isInArticle ? '[In-Article]' : '[Display]'} {eager ? 'eager' : 'lazy'} · slot: {adSlot}
      </div>
    )
  }

  const insStyle = isInArticle
    ? { display: 'block', textAlign: 'center' }
    : { display: 'block' }

  return (
    <div ref={containerRef} style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden', ...style }}>
      {(visible || eager) && (
        <ins
          className="adsbygoogle"
          style={insStyle}
          data-ad-client="ca-pub-8640254349508671"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          {...(isInArticle ? { 'data-ad-layout': 'in-article' } : {})}
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
