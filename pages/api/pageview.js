import crypto from 'crypto'
import { createServerClient } from '../../lib/supabase'

const SITE = 'movie'

function extractKeyword(ref) {
  if (!ref) return null
  try {
    const url = new URL(ref)
    const host = url.hostname.toLowerCase()
    if (host.includes('search.naver.com'))  return url.searchParams.get('query')
    if (host.includes('bing.com'))          return url.searchParams.get('q')
    if (host.includes('search.daum.net') || host.includes('search.kakao.com')) return url.searchParams.get('q')
    if (host.includes('search.zum.com'))    return url.searchParams.get('query') || url.searchParams.get('q')
    if (host.includes('yahoo.'))            return url.searchParams.get('p') || url.searchParams.get('q')
    if (host.includes('google.'))           return url.searchParams.get('q')
    return null
  } catch { return null }
}

function detectDevice(ua) {
  if (!ua) return 'unknown'
  ua = ua.toLowerCase()
  if (/ipad|tablet|kindle|playbook/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)) return 'mobile'
  if (/bot|crawl|spider|slurp|googlebot/.test(ua)) return 'bot'
  return 'desktop'
}

function makeSessionHash(ip, ua) {
  const daySalt = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
  return crypto.createHash('sha256').update(`${ip}|${ua}|${daySalt}`).digest('hex').slice(0, 16)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { slug, source, referrer, title } = req.body || {}
  if (!slug) return res.status(400).json({ error: 'slug required' })

  const supabase = createServerClient()
  if (!supabase) return res.status(200).json({ ok: false, reason: 'not configured' })

  const ua = req.headers['user-agent'] || ''
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  const keyword = extractKeyword(referrer)
  const device = detectDevice(ua)
  const sessionHash = makeSessionHash(ip, ua)
  const kstDate = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)

  try {
    const { error } = await supabase.from('pageview_events').insert({
      date: kstDate,
      slug: String(slug).slice(0, 300),
      title: title ? String(title).slice(0, 300) : null,
      source: source || 'unknown',
      keyword: keyword ? decodeURIComponent(keyword).trim().slice(0, 200) : null,
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      session_hash: sessionHash,
      device,
      site: SITE,
    })
    if (error) {
      console.error('[pageview] insert error:', error.message)
      return res.status(200).json({ ok: false, error: error.message })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[pageview] exception:', e.message)
    return res.status(200).json({ ok: false, error: e.message })
  }
}
