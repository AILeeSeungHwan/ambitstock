import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import getPostUrl from '../lib/getPostUrl'

const CATEGORY_COLORS = {
  '영화추천': { bg: '#e3f2fd', text: '#1565c0' },
  '해외반응후기': { bg: '#ffebee', text: '#c62828' },
  '마블': { bg: '#ede7f6', text: '#4527a0' },
  '드라마': { bg: '#f3e5f5', text: '#7b1fa2' },
  '애니메이션': { bg: '#e0f2f1', text: '#00695c' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  var d = new Date(dateStr)
  var months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  return months[d.getMonth()] + ' ' + d.getDate() + '일'
}

export default function SearchBar({ posts }) {
  var [query, setQuery] = useState('')
  var [results, setResults] = useState([])
  var [isOpen, setIsOpen] = useState(false)
  var [activeIndex, setActiveIndex] = useState(-1)
  var inputRef = useRef(null)
  var debounceRef = useRef(null)
  var containerRef = useRef(null)

  /* ── Fuse 인스턴스 (메모이제이션) ── */
  var fuse = useMemo(function () {
    if (!posts || posts.length === 0) return null
    var docs = posts.map(function (p) {
      return {
        id: p.id,
        slug: p.slug,
        title: p.title || '',
        description: p.description || '',
        category: p.category || '',
        tags: Array.isArray(p.tags) ? p.tags.join(' ') : '',
        date: p.date || '',
        thumbnail: p.thumbnail || '',
        url: getPostUrl(p),
      }
    })
    return new Fuse(docs, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tags', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 1,
    })
  }, [posts])

  /* ── 디바운스 검색 ── */
  var handleSearch = useCallback(function (value) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(function () {
      if (fuse) {
        var found = fuse.search(value.trim()).slice(0, 8)
        setResults(found.map(function (r) { return r.item }))
        setIsOpen(found.length > 0)
        setActiveIndex(-1)
      }
    }, 300)
  }, [fuse])

  /* ── 키보드 내비게이션 ── */
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      inputRef.current && inputRef.current.blur()
      return
    }
    if (!isOpen || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(function (prev) { return prev < results.length - 1 ? prev + 1 : 0 })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(function (prev) { return prev > 0 ? prev - 1 : results.length - 1 })
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      window.location.href = results[activeIndex].url
    }
  }

  /* ── 외부 클릭 시 닫기 ── */
  useEffect(function () {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return function () { document.removeEventListener('mousedown', onClickOutside) }
  }, [])

  /* ── 스타일 ── */
  var overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 999,
    display: isOpen ? 'block' : 'none',
  }

  var wrapperStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: 600,
    zIndex: 1000,
  }

  var inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: 16,
    border: '2px solid var(--border-color, #dee2e6)',
    borderRadius: 12,
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-color, #1a1a2e)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  }

  var inputFocusStyle = {
    borderColor: 'var(--primary-color, #e50914)',
    boxShadow: '0 0 0 3px rgba(229,9,20,0.15)',
  }

  var searchIconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: 18,
    color: 'var(--text-color, #999)',
    opacity: 0.5,
  }

  var dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-color, #dee2e6)',
    borderRadius: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    maxHeight: 440,
    overflowY: 'auto',
    zIndex: 1001,
    padding: '6px 0',
  }

  var [focused, setFocused] = useState(false)

  return (
    <>
      {isOpen && <div style={overlayStyle} onClick={function () { setIsOpen(false) }} />}
      <div ref={containerRef} style={wrapperStyle}>
        <div style={{ position: 'relative' }}>
          <span style={searchIconStyle}>&#128269;</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={'\uC791\uD488\uBA85, \uAC10\uB3C5, \uBC30\uC6B0, \uC7A5\uB974\uB85C \uAC80\uC0C9'}
            value={query}
            onChange={function (e) { handleSearch(e.target.value) }}
            onKeyDown={handleKeyDown}
            onFocus={function () { setFocused(true) }}
            onBlur={function () { setFocused(false) }}
            style={Object.assign({}, inputStyle, focused ? inputFocusStyle : {})}
            aria-label="Search posts"
            aria-expanded={isOpen}
            aria-controls="search-results"
            role="combobox"
            aria-autocomplete="list"
          />
        </div>

        {isOpen && results.length > 0 && (
          <div style={dropdownStyle} id="search-results" role="listbox">
            {results.map(function (item, idx) {
              var cat = CATEGORY_COLORS[item.category] || { bg: '#f5f5f5', text: '#666' }
              var isActive = idx === activeIndex
              return (
                <a
                  key={item.id}
                  href={item.url}
                  role="option"
                  aria-selected={isActive}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: 'var(--text-color, #1a1a2e)',
                    background: isActive ? 'var(--secondary-color, #f0f0f0)' : 'transparent',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                    borderBottom: idx < results.length - 1 ? '1px solid var(--border-color, #eee)' : 'none',
                  }}
                  onMouseEnter={function () { setActiveIndex(idx) }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 4,
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: cat.bg,
                        color: cat.text,
                        whiteSpace: 'nowrap',
                      }}>
                        {item.category}
                      </span>
                      {item.date && (
                        <span style={{
                          fontSize: 12,
                          color: 'var(--text-color, #999)',
                          opacity: 0.6,
                          whiteSpace: 'nowrap',
                        }}>
                          {formatDate(item.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
