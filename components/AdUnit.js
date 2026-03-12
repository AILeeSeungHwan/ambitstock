import { useEffect, useRef } from 'react'

export default function AdUnit({ slot, format, style }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    if (typeof window === 'undefined') return

    if (process.env.NODE_ENV === 'production') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        pushed.current = true
      } catch (e) {
        console.error('AdSense push error:', e)
      }
    }
  }, [])

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
    <div style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden', ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8640254349508671"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
