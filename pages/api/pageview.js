import fs from 'fs'

const DATA_FILE = '/tmp/pageviews-movie.json'

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch (e) {}
  return {}
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8')
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'POST') {
    const { slug, source, referrer } = req.body || {}
    if (!slug) return res.status(400).json({ error: 'slug required' })

    const today = new Date().toISOString().slice(0, 10)
    const data = readData()

    if (!data[slug]) data[slug] = {}
    if (!data[slug][today]) data[slug][today] = 0
    data[slug][today] += 1

    if (!data['_total']) data['_total'] = {}
    if (!data['_total'][today]) data['_total'][today] = 0
    data['_total'][today] += 1

    const src = source || 'unknown'
    if (!data['_sources']) data['_sources'] = {}
    if (!data['_sources'][today]) data['_sources'][today] = {}
    if (!data['_sources'][today][src]) data['_sources'][today][src] = 0
    data['_sources'][today][src] += 1

    const pageSourceKey = '_src_' + slug
    if (!data[pageSourceKey]) data[pageSourceKey] = {}
    if (!data[pageSourceKey][today]) data[pageSourceKey][today] = {}
    if (!data[pageSourceKey][today][src]) data[pageSourceKey][today][src] = 0
    data[pageSourceKey][today][src] += 1

    writeData(data)

    return res.status(200).json({
      slug, date: today, source: src,
      count: data[slug][today],
      totalToday: data['_total'][today],
    })
  }

  if (req.method === 'GET') {
    const data = readData()
    return res.status(200).json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
