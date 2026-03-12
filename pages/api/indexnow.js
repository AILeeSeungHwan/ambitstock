const API_KEY = '2e6fd9084db64a56aa9b0344d860a5d4'
const HOST = 'ambitstock.com'
const BATCH_SIZE = 100
const DELAY_MS = 2000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function submitBatch(urlBatch, attempt = 1) {
  const response = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: HOST,
      key: API_KEY,
      keyLocation: 'https://' + HOST + '/' + API_KEY + '.txt',
      urlList: urlBatch,
    }),
  })

  const status = response.status

  if (status === 429 && attempt < 3) {
    const waitTime = DELAY_MS * attempt * 2
    await sleep(waitTime)
    return submitBatch(urlBatch, attempt + 1)
  }

  return { status, count: urlBatch.length, attempt }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const { urls } = req.body || {}
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls array required' })
  }

  try {
    const results = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE)
      const result = await submitBatch(batch)
      results.push(result)

      if (result.status >= 200 && result.status < 300) {
        successCount += result.count
      } else {
        failCount += result.count
      }

      if (i + BATCH_SIZE < urls.length) {
        await sleep(DELAY_MS)
      }
    }

    const allSuccess = failCount === 0

    return res.status(200).json({
      success: allSuccess,
      message: allSuccess
        ? successCount + '개 URL 제출 완료'
        : successCount + '개 성공, ' + failCount + '개 실패',
      urlCount: urls.length,
      batches: results.length,
      details: results,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
