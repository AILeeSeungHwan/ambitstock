import { useState, useEffect } from 'react'
import Head from 'next/head'
import posts from '../data/posts'
import getPostUrl from '../lib/getPostUrl'

const SOURCE_LABELS = {
  google: { name: 'Google', color: '#4285F4', icon: '🔍' },
  naver: { name: 'Naver', color: '#03C75A', icon: '🟢' },
  bing: { name: 'Bing', color: '#008373', icon: '🔵' },
  daum: { name: 'Daum/Kakao', color: '#FFCD00', icon: '🟡' },
  yahoo: { name: 'Yahoo', color: '#6001D2', icon: '🟣' },
  zum: { name: 'ZUM', color: '#FF6600', icon: '🟠' },
  direct: { name: '직접 접속', color: '#6b7280', icon: '🏠' },
  internal: { name: '내부 이동', color: '#8b5cf6', icon: '🔄' },
  other: { name: '기타', color: '#9ca3af', icon: '🌐' },
  unknown: { name: '알 수 없음', color: '#d1d5db', icon: '❓' },
}

export default function AdminLee() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [indexResult, setIndexResult] = useState(null)
  const [indexLoading, setIndexLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [activeTab, setActiveTab] = useState('overview')

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pageview')
      const data = await res.json()
      setStats(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadStats() }, [])

  const runIndexNow = async (mode) => {
    setIndexLoading(true)
    setIndexResult(null)
    let urls = []
    if (mode === 'all') {
      urls = ['https://ambitstock.com/', ...posts.map(p => 'https://ambitstock.com' + getPostUrl(p))]
    } else if (mode === 'recent') {
      const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
      urls = sorted.slice(0, 10).map(p => 'https://ambitstock.com' + getPostUrl(p))
    } else if (mode === 'main') {
      urls = ['https://ambitstock.com/']
    }
    try {
      const res = await fetch('/api/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls }) })
      const data = await res.json()
      setIndexResult(data)
    } catch (e) {
      setIndexResult({ success: false, error: e.message })
    }
    setIndexLoading(false)
  }

  const getDateStats = (date) => {
    if (!stats) return []
    return Object.entries(stats)
      .filter(([slug]) => !slug.startsWith('_'))
      .map(([slug, dates]) => ({
        slug, count: dates[date] || 0,
        title: posts.find(p => String(p.slug) === slug)?.title || slug,
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  const getTotalToday = () => {
    if (!stats || !stats._total) return 0
    return stats._total[selectedDate] || 0
  }

  const getSourceStats = (date) => {
    if (!stats || !stats._sources || !stats._sources[date]) return []
    return Object.entries(stats._sources[date])
      .sort((a, b) => b[1] - a[1])
      .map(([src, count]) => ({ source: src, count, ...SOURCE_LABELS[src] || SOURCE_LABELS.unknown }))
  }

  const getPageSourceStats = (date, slug) => {
    const key = '_src_' + slug
    if (!stats || !stats[key] || !stats[key][date]) return []
    return Object.entries(stats[key][date])
      .sort((a, b) => b[1] - a[1])
      .map(([src, count]) => ({ source: src, count, ...SOURCE_LABELS[src] || SOURCE_LABELS.unknown }))
  }

  const getAvailableDates = () => {
    if (!stats || !stats._total) return []
    return Object.keys(stats._total).sort().reverse()
  }

  const dateStats = getDateStats(selectedDate)
  const sourceStats = getSourceStats(selectedDate)
  const availDates = getAvailableDates()
  const totalToday = getTotalToday()

  return (
    <>
      <Head>
        <title>Admin | ambitstock.com</title>
        <meta name="robots" content="noindex, nofollow" />
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
      </Head>

      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '24px 20px',
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
        color: '#1a1a2e', background: '#f8f9fa', minHeight: '100vh',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Admin Dashboard</h1>
            <p style={{ fontSize: 12, opacity: 0.4, margin: 0 }}>ambitstock.com</p>
          </div>
          <button onClick={loadStats} disabled={loading} style={{
            ...btnStyle('#e50914'), padding: '8px 16px', fontSize: 12,
          }}>
            {loading ? '로딩...' : '새로고침'}
          </button>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>IndexNow</h2>
          <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 16 }}>Bing, Naver, Yandex 등에 URL 색인 요청</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => runIndexNow('all')} disabled={indexLoading} style={btnStyle('#e50914')}>
              전체 ({posts.length + 1})
            </button>
            <button onClick={() => runIndexNow('recent')} disabled={indexLoading} style={btnStyle('#10b981')}>
              최근 10개
            </button>
            <button onClick={() => runIndexNow('main')} disabled={indexLoading} style={btnStyle('#8b5cf6')}>
              메인만
            </button>
          </div>
          {indexResult && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
              background: indexResult.success ? '#d1fae5' : '#fee2e2',
            }}>
              <strong>{indexResult.success ? 'Success' : 'Failed'}</strong>
              <span style={{ marginLeft: 8 }}>{indexResult.message || indexResult.error}</span>
              {indexResult.urlCount && <span style={{ marginLeft: 8 }}>({indexResult.urlCount}개)</span>}
            </div>
          )}
        </section>

        <section style={{ ...cardStyle, padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginRight: 4 }}>날짜</span>
            {availDates.length > 0 ? availDates.slice(0, 14).map(date => (
              <button key={date} onClick={() => setSelectedDate(date)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: date === selectedDate ? '2px solid #e50914' : '1px solid #e5e7eb',
                background: date === selectedDate ? '#e50914' : '#fff',
                color: date === selectedDate ? '#fff' : '#333',
                fontWeight: date === selectedDate ? 700 : 400,
              }}>{date.slice(5)}</button>
            )) : <span style={{ fontSize: 12, opacity: 0.4 }}>데이터 없음</span>}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <StatCard label="총 조회수" value={totalToday} color="#e50914" />
          <StatCard label="페이지 수" value={dateStats.length} color="#10b981" />
          <StatCard label="유입 소스" value={sourceStats.length} color="#f59e0b" />
          <StatCard label="전체 포스팅" value={posts.length} color="#8b5cf6" />
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
          {[
            { key: 'overview', label: '유입 분석' },
            { key: 'pages', label: '페이지별' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 20px', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
              border: 'none', borderBottom: activeTab === tab.key ? '2px solid #e50914' : '2px solid transparent',
              background: 'transparent', cursor: 'pointer', color: '#1a1a2e',
              opacity: activeTab === tab.key ? 1 : 0.5,
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>검색엔진별 유입</h2>
            {sourceStats.length > 0 ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  {sourceStats.map(s => {
                    const pct = totalToday > 0 ? (s.count / totalToday * 100) : 0
                    return (
                      <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ width: 90, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>{s.icon}</span> {s.name}
                        </span>
                        <div style={{ flex: 1, height: 24, background: '#f1f3f5', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{
                            width: pct + '%', height: '100%', background: s.color,
                            borderRadius: 6, transition: 'width 0.5s ease',
                            minWidth: s.count > 0 ? 20 : 0,
                          }} />
                        </div>
                        <span style={{ width: 60, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                          {s.count} <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.4 }}>({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={thStyle}>소스</th>
                      <th style={thStyle}>조회수</th>
                      <th style={thStyle}>비율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceStats.map(s => (
                      <tr key={s.source} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                          <span style={{ marginRight: 6 }}>{s.icon}</span>{s.name}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: s.color }}>{s.count}</td>
                        <td style={tdStyle}>{totalToday > 0 ? (s.count / totalToday * 100).toFixed(1) + '%' : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.4, padding: 20, fontSize: 13 }}>
                {selectedDate} 유입 데이터가 없습니다.
              </p>
            )}
          </section>
        )}

        {activeTab === 'pages' && (
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>페이지별 조회수</h2>
            {dateStats.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>페이지</th>
                    <th style={thStyle}>조회수</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>유입 소스</th>
                  </tr>
                </thead>
                <tbody>
                  {dateStats.map((s, i) => {
                    const pageSources = getPageSourceStats(selectedDate, s.slug)
                    return (
                      <tr key={s.slug} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={tdStyle}>{i + 1}</td>
                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                          <a href={(posts.find(p => p.slug === s.slug || p.tistorySlug === s.slug) ? getPostUrl(posts.find(p => p.slug === s.slug || p.tistorySlug === s.slug)) : '/' + s.slug + '/')} target="_blank" rel="noopener"
                            style={{ color: '#e50914', textDecoration: 'none', fontSize: 12 }}>
                            {s.title.length > 40 ? s.title.slice(0, 40) + '...' : s.title}
                          </a>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#e50914' }}>{s.count}</td>
                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {pageSources.map(ps => (
                              <span key={ps.source} style={{
                                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                                background: ps.color + '20', color: ps.color, fontWeight: 600,
                              }}>
                                {ps.icon} {ps.count}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.4, padding: 20, fontSize: 13 }}>
                {selectedDate} 데이터가 없습니다.
              </p>
            )}
          </section>
        )}

        <p style={{ textAlign: 'center', opacity: 0.2, fontSize: 11, marginTop: 24 }}>
          ambitstock.com admin
        </p>
      </div>
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px', textAlign: 'center',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.45, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function btnStyle(color) {
  return {
    padding: '10px 18px', borderRadius: 8, border: 'none',
    background: color, color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.2s',
  }
}

const cardStyle = {
  background: '#fff', borderRadius: 12, padding: 20,
  border: '1px solid #e5e7eb', marginBottom: 16,
}

const sectionTitleStyle = { fontSize: 16, fontWeight: 700, marginBottom: 16 }
const thStyle = { padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: 'uppercase' }
const tdStyle = { padding: '10px 12px', textAlign: 'center' }
