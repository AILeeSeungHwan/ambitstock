import { useEffect } from 'react'

function detectSource() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'unknown'
  const ref = document.referrer || ''
  if (!ref) return 'direct'
  try {
    const host = new URL(ref).hostname.toLowerCase()
    if (host.includes('google')) return 'google'
    if (host.includes('naver')) return 'naver'
    if (host.includes('daum') || host.includes('kakao')) return 'daum'
    if (host.includes('bing')) return 'bing'
    if (host.includes('yahoo')) return 'yahoo'
    if (host.includes('zum')) return 'zum'
    if (host.includes('ambitstock.com')) return 'internal'
    return 'other'
  } catch (e) {
    return 'other'
  }
}

export default function PageTracker({ slug }) {
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return

    const key = 'pv_' + slug
    if (sessionStorage.getItem(key)) return

    const source = detectSource()
    const referrer = document.referrer || ''

    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, source, referrer }),
    }).then(() => {
      sessionStorage.setItem(key, '1')
    }).catch(() => {})
  }, [slug])

  return null
}
