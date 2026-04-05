import { useEffect, useRef, useState } from 'react'

export default function AdUnit({ slot, format, style }) {
  const containerRef = useRef(null)
  const pushed = useRef(false)
  const [visible, setVisible] = useState(false)

  // IntersectionObserver: ins를 뷰포트 200px 이내 진입 시에만 렌더 + push
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
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
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
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
        Ad Area (slot: {adSlot}, format: {adFormat})
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden', ...style }}>
      {visible && (
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
