import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Interstitial from './Interstitial'

/* ───────────────────────── 폰트 ───────────────────────── */
const FONTS = [
  { name: 'Pretendard', css: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif", url: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css' },
  { name: 'Noto Sans KR', css: "'Noto Sans KR', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap' },
  { name: 'Nanum Gothic', css: "'Nanum Gothic', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap' },
  { name: 'IBM Plex Sans KR', css: "'IBM Plex Sans KR', sans-serif", url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;700&display=swap' },
  { name: 'Gowun Dodum', css: "'Gowun Dodum', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap' },
]

/* ───────────────────────── 테마 ───────────────────────── */
const THEMES = [
  { name: '로키🛸', bg: '#060504', text: '#d4d0c8', card: '#0e0c08', primary: '#c8a050', secondary: '#0e0c08', accent: '#2acea0', border: '#1c1808', headerBg: '#060504', headerText: '#d4d0c8', footerBg: '#060504', animation: 'rocky' },
  { name: '라이트☀️', bg: '#f8f9fa', text: '#1a1a2e', card: '#ffffff', primary: '#2c5fff', secondary: '#e8edf5', accent: '#ff6b35', border: '#dee2e6', headerBg: '#ffffff', headerText: '#1a1a2e', footerBg: '#f1f3f5', animation: null },
  { name: '다크🌑', bg: '#0d1117', text: '#e6edf3', card: '#161b22', primary: '#58a6ff', secondary: '#21262d', accent: '#ff7b72', border: '#30363d', headerBg: '#010409', headerText: '#e6edf3', footerBg: '#010409', animation: null },
  { name: '봄벚꽃🌸', bg: '#fff5f5', text: '#4a2040', card: '#ffffff', primary: '#e77c8e', secondary: '#fce4ec', accent: '#c2185b', border: '#f8bbd0', headerBg: '#fce4ec', headerText: '#880e4f', footerBg: '#fce4ec', animation: 'sakura' },
  { name: '빗소리🌧️', bg: '#e8eaf6', text: '#263238', card: '#f5f5f6', primary: '#5c6bc0', secondary: '#c5cae9', accent: '#1a237e', border: '#9fa8da', headerBg: '#c5cae9', headerText: '#1a237e', footerBg: '#c5cae9', animation: 'rain' },
  { name: '첫눈❄️', bg: '#e3f2fd', text: '#1a237e', card: '#ffffff', primary: '#42a5f5', secondary: '#bbdefb', accent: '#0d47a1', border: '#90caf9', headerBg: '#bbdefb', headerText: '#0d47a1', footerBg: '#bbdefb', animation: 'snow' },
  { name: '단풍🍁', bg: '#fff3e0', text: '#3e2723', card: '#ffffff', primary: '#e65100', secondary: '#ffe0b2', accent: '#bf360c', border: '#ffcc80', headerBg: '#ffe0b2', headerText: '#bf360c', footerBg: '#ffe0b2', animation: 'leaves' },
  { name: '우주🚀', bg: '#0a0a2e', text: '#e0e0ff', card: '#1a1a4e', primary: '#7c4dff', secondary: '#1a1a4e', accent: '#ff4081', border: '#3f3f7e', headerBg: '#0a0a2e', headerText: '#e0e0ff', footerBg: '#0a0a2e', animation: 'stars' },
  { name: '불꽃축제🎆', bg: '#1a0a2e', text: '#ffeebb', card: '#2a1a3e', primary: '#ff6f00', secondary: '#2a1a3e', accent: '#ff1744', border: '#4a2a5e', headerBg: '#1a0a2e', headerText: '#ffeebb', footerBg: '#1a0a2e', animation: 'fireworks' },
  { name: '심해🌊', bg: '#001a33', text: '#b3e5fc', card: '#002244', primary: '#00bcd4', secondary: '#003355', accent: '#00e5ff', border: '#004466', headerBg: '#001a33', headerText: '#b3e5fc', footerBg: '#001a33', animation: 'bubbles' },
  { name: '네온사인🌃', bg: '#0a0a0a', text: '#ffffff', card: '#1a1a1a', primary: '#00e5ff', secondary: '#1a1a1a', accent: '#ff1744', border: '#333333', headerBg: '#0a0a0a', headerText: '#00e5ff', footerBg: '#0a0a0a', animation: 'neon' },
  { name: '해바라기밭🌻', bg: '#fffde7', text: '#33691e', card: '#ffffff', primary: '#f9a825', secondary: '#fff9c4', accent: '#827717', border: '#fff176', headerBg: '#fff9c4', headerText: '#33691e', footerBg: '#fff9c4', animation: 'sunflower' },
  { name: '나비정원🦋', bg: '#f3e5f5', text: '#4a148c', card: '#ffffff', primary: '#ab47bc', secondary: '#e1bee7', accent: '#6a1b9a', border: '#ce93d8', headerBg: '#e1bee7', headerText: '#4a148c', footerBg: '#e1bee7', animation: 'butterfly' },
  { name: '뭉게구름⛅', bg: '#e0f7fa', text: '#004d40', card: '#ffffff', primary: '#26a69a', secondary: '#b2dfdb', accent: '#00695c', border: '#80cbc4', headerBg: '#b2dfdb', headerText: '#004d40', footerBg: '#b2dfdb', animation: 'cloud' },
  { name: '다람쥐숲🐿️', bg: '#efebe9', text: '#3e2723', card: '#ffffff', primary: '#795548', secondary: '#d7ccc8', accent: '#4e342e', border: '#bcaaa4', headerBg: '#d7ccc8', headerText: '#3e2723', footerBg: '#d7ccc8', animation: 'squirrel' },
  { name: '연어의강🐟', bg: '#fbe9e7', text: '#bf360c', card: '#ffffff', primary: '#ff5722', secondary: '#ffccbc', accent: '#d84315', border: '#ff8a65', headerBg: '#ffccbc', headerText: '#bf360c', footerBg: '#ffccbc', animation: 'salmon' },
  { name: '폭포💧', bg: '#e0f2f1', text: '#004d40', card: '#ffffff', primary: '#009688', secondary: '#b2dfdb', accent: '#00796b', border: '#80cbc4', headerBg: '#b2dfdb', headerText: '#004d40', footerBg: '#b2dfdb', animation: 'waterfall' },
  { name: '미드나잇🌙', bg: '#0f0f23', text: '#ccccff', card: '#1a1a3e', primary: '#6c63ff', secondary: '#1a1a3e', accent: '#ffd700', border: '#2a2a5e', headerBg: '#0f0f23', headerText: '#ccccff', footerBg: '#0f0f23', animation: 'stars' },
  { name: '옵시디언🖤', bg: '#1a1a1a', text: '#c0c0c0', card: '#2a2a2a', primary: '#808080', secondary: '#2a2a2a', accent: '#ffffff', border: '#3a3a3a', headerBg: '#1a1a1a', headerText: '#c0c0c0', footerBg: '#1a1a1a', animation: null },
  { name: '크롬⚙️', bg: '#eceff1', text: '#37474f', card: '#ffffff', primary: '#607d8b', secondary: '#cfd8dc', accent: '#455a64', border: '#b0bec5', headerBg: '#cfd8dc', headerText: '#37474f', footerBg: '#cfd8dc', animation: null },
  { name: '사이버펑크⚡', bg: '#0a0020', text: '#00ff41', card: '#1a0040', primary: '#ff00ff', secondary: '#1a0040', accent: '#00ffff', border: '#3a0060', headerBg: '#0a0020', headerText: '#00ff41', footerBg: '#0a0020', animation: 'neon' },
  { name: '블러드문🩸', bg: '#1a0000', text: '#ff9999', card: '#2a0a0a', primary: '#ff1744', secondary: '#2a0a0a', accent: '#ff5252', border: '#4a1a1a', headerBg: '#1a0000', headerText: '#ff9999', footerBg: '#1a0000', animation: null },
  { name: '제이드🍃', bg: '#0a1a0a', text: '#a5d6a7', card: '#1a2a1a', primary: '#4caf50', secondary: '#1a2a1a', accent: '#81c784', border: '#2a3a2a', headerBg: '#0a1a0a', headerText: '#a5d6a7', footerBg: '#0a1a0a', animation: null },
]

/* ═══════════════════════════════════════════════════════════
   애니메이션 렌더러 — dinner app에서 이식
   ═══════════════════════════════════════════════════════════ */
function AnimationLayer({ type }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || !type) return null

  /* ── 벚꽃 ── */
  if (type === 'sakura') return (
    <>
      <style>{`
        @keyframes sakura-sway {
          0%{transform:translate(0,-20px) rotate(0);opacity:0} 8%{opacity:.8}
          25%{transform:translate(12px,24vh) rotate(8deg)} 50%{transform:translate(-10px,50vh) rotate(-5deg)}
          75%{transform:translate(14px,75vh) rotate(10deg);opacity:.65} 100%{transform:translate(-6px,108vh) rotate(-3deg);opacity:0}
        }
        @keyframes sakura-tumble {
          0%{transform:translate(0,-20px) rotate(0);opacity:0} 8%{opacity:.75}
          30%{transform:translate(-38px,26vh) rotate(80deg)} 60%{transform:translate(28px,56vh) rotate(160deg)}
          85%{transform:translate(-18px,82vh) rotate(200deg);opacity:.55} 100%{transform:translate(8px,108vh) rotate(220deg);opacity:0}
        }
        @keyframes sakura-spin {
          0%{transform:translate(0,-20px) rotate(0);opacity:0} 8%{opacity:.85}
          20%{transform:translate(32px,20vh) rotate(120deg)} 40%{transform:translate(-22px,40vh) rotate(240deg)}
          60%{transform:translate(26px,60vh) rotate(360deg)} 80%{transform:translate(-14px,80vh) rotate(420deg);opacity:.6}
          100%{transform:translate(6px,108vh) rotate(500deg);opacity:0}
        }
        .sakura-petal { position:fixed; top:0; border-radius:80% 0 80% 0; box-shadow:0 2px 6px rgba(255,100,150,.15); pointer-events:none; z-index:50; }
      `}</style>
      {Array.from({length:24}).map((_,i) => {
        const animMap = ['sakura-sway','sakura-tumble','sakura-spin']
        const anim = animMap[Math.floor(i/8)]
        const sz = 9 + (i%4)*3
        const colors = ['linear-gradient(135deg,#ffd6e7,#ffb3cc)','linear-gradient(135deg,#ffb3cc,#ff85aa)','linear-gradient(135deg,#ffe0ec,#ffc8d8)','linear-gradient(135deg,#ff9dc0,#ff6fa0)']
        return <div key={i} className="sakura-petal" style={{
          left:(i*4.2+1)%100+'%', width:sz+'px', height:sz+'px',
          animationName:anim, animationDuration:(7+(i*1.1)%6)+'s', animationDelay:(i*0.65)%8+'s',
          animationTimingFunction: anim==='sakura-sway'?'ease-in-out':'linear', animationIterationCount:'infinite',
          opacity:0.18+(i%4)*0.05, background:colors[i%4], transform:'rotate('+i*17+'deg)',
        }} />
      })}
    </>
  )

  /* ── 비 ── */
  if (type === 'rain') return (
    <>
      <style>{`
        @keyframes rain-fall {
          0%{transform:translateY(-10px) translateX(0);opacity:0} 5%{opacity:.35} 95%{opacity:.28}
          100%{transform:translateY(110vh) translateX(-20px);opacity:0}
        }
        .rain-drop { position:fixed; top:0; pointer-events:none; z-index:50; width:1.5px; border-radius:2px;
          background:linear-gradient(180deg,transparent,#7ecef488,transparent); animation:rain-fall linear infinite; }
      `}</style>
      {Array.from({length:55}).map((_,i) => (
        <div key={i} className="rain-drop" style={{
          left:(i*1.85)%100+'%', height:(18+(i%4)*8)+'px', opacity:0.12+(i%3)*0.05,
          animationDuration:(0.6+(i*0.07)%0.5)+'s', animationDelay:(i*0.13)%1.2+'s',
        }} />
      ))}
      <div style={{ position:'fixed', inset:0, zIndex:50, pointerEvents:'none',
        background:'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(74,159,212,.04) 0%, transparent 70%)' }} />
    </>
  )

  /* ── 눈 ── */
  if (type === 'snow') return (
    <>
      <style>{`
        @keyframes snow-fall-1 {
          0%{transform:translate(0,-10px) rotate(0);opacity:0} 5%{opacity:.85}
          40%{transform:translate(12px,35vh) rotate(120deg)} 70%{transform:translate(-8px,68vh) rotate(240deg)}
          100%{transform:translate(5px,108vh) rotate(360deg);opacity:0}
        }
        @keyframes snow-fall-2 {
          0%{transform:translate(0,-10px) rotate(20deg);opacity:0} 5%{opacity:.8}
          35%{transform:translate(-15px,30vh) rotate(110deg)} 65%{transform:translate(10px,62vh) rotate(230deg)}
          100%{transform:translate(-5px,108vh) rotate(350deg);opacity:0}
        }
        .snow-flake { position:fixed; top:0; pointer-events:none; z-index:50; border-radius:50%;
          background:radial-gradient(circle,#fff 30%,rgba(200,220,255,.6) 100%); box-shadow:0 0 4px rgba(150,180,255,.4); }
      `}</style>
      {Array.from({length:35}).map((_,i) => {
        const sz = 4+(i%5)*3
        return <div key={i} className="snow-flake" style={{
          left:(i*2.9+1)%100+'%', width:sz+'px', height:sz+'px', opacity:0.2+(i%4)*0.07,
          animationName:i%2===0?'snow-fall-1':'snow-fall-2', animationDuration:(5+(i*0.4)%5)+'s',
          animationDelay:(i*0.35)%6+'s', animationTimingFunction:'linear', animationIterationCount:'infinite',
        }} />
      })}
    </>
  )

  /* ── 단풍 ── */
  if (type === 'leaves') return (
    <>
      <style>{`
        @keyframes leaf-fall-1 {
          0%{transform:translate(0,-10px) rotate(0);opacity:0} 5%{opacity:.9}
          25%{transform:translate(35px,22vh) rotate(90deg)} 50%{transform:translate(-20px,48vh) rotate(200deg)}
          75%{transform:translate(25px,72vh) rotate(310deg);opacity:.7} 100%{transform:translate(-8px,108vh) rotate(420deg);opacity:0}
        }
        @keyframes leaf-fall-2 {
          0%{transform:translate(0,-10px) rotate(45deg);opacity:0} 5%{opacity:.85}
          30%{transform:translate(-30px,28vh) rotate(140deg)} 55%{transform:translate(18px,54vh) rotate(255deg)}
          80%{transform:translate(-12px,78vh) rotate(350deg);opacity:.65} 100%{transform:translate(6px,108vh) rotate(460deg);opacity:0}
        }
        .autumn-leaf { position:fixed; top:0; pointer-events:none; z-index:50; }
      `}</style>
      {Array.from({length:20}).map((_,i) => {
        const sz = 18+(i%4)*6
        const leafColors = ['#e8641a','#d44010','#f5a623','#c83208','#e87820','#cc3300','#b83008','#f09030']
        const col = leafColors[i%leafColors.length]
        const leafPaths = [
          'M20 2 L22 10 L30 8 L25 14 L32 18 L24 18 L26 26 L20 22 L14 26 L16 18 L8 18 L15 14 L10 8 L18 10 Z',
          'M20 4 L21 11 L27 7 L23 13 L30 12 L25 16 L28 22 L21 18 L20 26 L19 18 L12 22 L15 16 L10 12 L17 13 L13 7 L19 11 Z',
          'M20 3 L21 9 L25 5 L23 11 L28 9 L25 14 L30 14 L26 17 L28 22 L22 19 L21 26 L20 20 L19 26 L18 19 L12 22 L14 17 L10 14 L15 14 L12 9 L17 11 L15 5 L19 9 Z',
        ]
        return <div key={i} className="autumn-leaf" style={{
          left:(i*5.1+2)%100+'%', width:sz+'px', height:sz+'px', opacity:0.1+(i%3)*0.04,
          animationName:i%2===0?'leaf-fall-1':'leaf-fall-2', animationDuration:(6+(i*0.9)%5)+'s',
          animationDelay:(i*0.55)%7+'s', animationTimingFunction:'ease-in-out', animationIterationCount:'infinite',
        }}>
          <svg viewBox="0 0 40 40" width={sz} height={sz} fill="none">
            <path d={leafPaths[i%3]} fill={col} stroke={col} strokeWidth="0.8" strokeLinejoin="round"/>
            <line x1="20" y1="22" x2="20" y2="38" stroke={col} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      })}
    </>
  )

  /* ── 우주/별 ── */
  if (type === 'stars') return (
    <>
      <style>{`
        @keyframes star-twinkle { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.9;transform:scale(1.4)} }
        @keyframes meteor { 0%{transform:translate(0,0) rotate(35deg);opacity:0;width:2px} 5%{opacity:1}
          100%{transform:translate(400px,240px) rotate(35deg);opacity:0;width:120px} }
        .star-dot { position:fixed; border-radius:50%; pointer-events:none; z-index:50; background:#fff; animation:star-twinkle ease-in-out infinite; }
        .meteor-trail { position:fixed; pointer-events:none; z-index:50; height:1.5px; border-radius:2px;
          background:linear-gradient(90deg,transparent,#c8d8ff,#fff); animation:meteor linear infinite; }
      `}</style>
      {Array.from({length:60}).map((_,i) => (
        <div key={'s'+i} className="star-dot" style={{
          left:(i*1.67+0.5)%100+'%', top:(i*2.13+1)%85+'%',
          width:i%5===0?'3px':i%3===0?'2px':'1.5px', height:i%5===0?'3px':i%3===0?'2px':'1.5px',
          opacity:0.1+(i%5)*0.04, animationDuration:(2+(i*0.3)%4)+'s', animationDelay:(i*0.4)%5+'s',
        }} />
      ))}
      {Array.from({length:5}).map((_,i) => (
        <div key={'m'+i} className="meteor-trail" style={{
          left:(i*22)%80+'%', top:(i*14)%40+'%', opacity:0.5+(i%3)*0.1,
          animationDuration:(4+i*1.5)+'s', animationDelay:(i*2.8)+'s',
        }} />
      ))}
    </>
  )

  /* ── 불꽃축제 ── */
  if (type === 'fireworks') return (
    <>
      <style>{`
        @keyframes spark-rise { 0%{transform:translate(0,0) scale(1);opacity:0} 10%{opacity:1}
          100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
        .spark { position:fixed; border-radius:50%; pointer-events:none; z-index:50; width:4px; height:4px; animation:spark-rise ease-out infinite; }
      `}</style>
      {Array.from({length:30}).map((_,i) => {
        const angle = (i/30)*Math.PI*2
        const dist = 60+(i%5)*25
        const dx = Math.round(Math.cos(angle)*dist)
        const dy = Math.round(Math.sin(angle)*dist - 80)
        const colors = ['#ff4488','#ffcc00','#00ffaa','#ff8800','#cc44ff','#00ccff','#ff2244']
        const cx = [20,50,75,35,65][Math.floor(i/6)]
        const cy = [30,20,35,50,15][Math.floor(i/6)]
        return <div key={i} className="spark" style={{
          left:cx+'%', top:cy+'%', background:colors[i%colors.length],
          opacity:0.15+(i%4)*0.04, '--dx':dx+'px', '--dy':dy+'px',
          animationDuration:(1.2+(i*0.07)%1)+'s', animationDelay:(i*0.15)%3+'s',
        }} />
      })}
    </>
  )

  /* ── 심해/거품 ── */
  if (type === 'bubbles') return (
    <>
      <style>{`
        @keyframes bubble-rise { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0} 10%{opacity:.6}
          50%{transform:translateY(-45vh) translateX(8px) scale(1.05)} 90%{opacity:.3}
          100%{transform:translateY(-100vh) translateX(-5px) scale(.8);opacity:0} }
        .bubble { position:fixed; bottom:0; border-radius:50%; pointer-events:none; z-index:50;
          border:1px solid rgba(0,180,216,.4); background:radial-gradient(circle at 35% 35%,rgba(180,240,255,.15),transparent);
          animation:bubble-rise ease-in-out infinite; }
      `}</style>
      {Array.from({length:25}).map((_,i) => {
        const sz = 6+(i%5)*8
        return <div key={i} className="bubble" style={{
          left:(i*4.1+2)%95+'%', width:sz+'px', height:sz+'px', opacity:0.08+(i%4)*0.03,
          animationDuration:(4+(i*0.6)%5)+'s', animationDelay:(i*0.45)%6+'s',
        }} />
      })}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'18vh', zIndex:50, pointerEvents:'none',
        background:'linear-gradient(180deg, transparent 0%, rgba(0,20,40,.35) 100%)' }} />
    </>
  )

  /* ── 네온사인 ── */
  if (type === 'neon') return (
    <>
      <style>{`
        @keyframes neon-flicker { 0%,19%,21%,23%,25%,54%,56%,100%{opacity:.12} 20%,24%,55%{opacity:.04} }
        @keyframes neon-pulse { 0%,100%{opacity:.08;transform:scale(1)} 50%{opacity:.18;transform:scale(1.03)} }
        .neon-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:50; filter:blur(40px); animation:neon-pulse ease-in-out infinite; }
        .neon-line { position:fixed; pointer-events:none; z-index:50; animation:neon-flicker ease-in-out infinite; }
      `}</style>
      <div className="neon-orb" style={{ width:'300px',height:'300px',left:'10%',top:'20%',background:'#ff00aa',opacity:.1,animationDuration:'3.2s' }} />
      <div className="neon-orb" style={{ width:'250px',height:'250px',right:'8%',top:'35%',background:'#00ffcc',opacity:.08,animationDuration:'4.1s',animationDelay:'1.2s' }} />
      <div className="neon-orb" style={{ width:'200px',height:'200px',left:'40%',bottom:'20%',background:'#aa00ff',opacity:.09,animationDuration:'3.7s',animationDelay:'0.8s' }} />
      <div className="neon-line" style={{ left:'5%',top:'15%',width:'2px',height:'120px',background:'linear-gradient(180deg,transparent,#ff00aa,transparent)',opacity:.12,animationDuration:'1.8s' }} />
      <div className="neon-line" style={{ right:'12%',top:'40%',width:'2px',height:'80px',background:'linear-gradient(180deg,transparent,#00ffcc,transparent)',opacity:.1,animationDuration:'2.3s',animationDelay:'0.6s' }} />
      <div className="neon-line" style={{ left:'60%',bottom:'25%',width:'80px',height:'2px',background:'linear-gradient(90deg,transparent,#ff00aa,transparent)',opacity:.12,animationDuration:'1.5s',animationDelay:'1s' }} />
    </>
  )

  /* ── 해바라기밭 ── */
  if (type === 'sunflower') return (
    <>
      <style>{`
        @keyframes sunflower-sway { 0%,100%{transform:rotate(-3deg) translateX(0)} 50%{transform:rotate(3deg) translateX(4px)} }
        @keyframes petal-float { 0%{transform:translate(0,-10px) rotate(0);opacity:0} 8%{opacity:.7}
          50%{transform:translate(20px,45vh) rotate(180deg)} 100%{transform:translate(-10px,108vh) rotate(360deg);opacity:0} }
        .sunflower-petal { position:fixed; top:0; pointer-events:none; z-index:50; border-radius:50% 0 50% 0; animation:petal-float linear infinite; }
      `}</style>
      {[{x:'-20px',scale:1.1,delay:'0s'},{x:'calc(50% - 60px)',scale:.9,delay:'0.8s'},{x:'calc(100% - 80px)',scale:1,delay:'0.3s'}].map((p,i) => (
        <div key={i} style={{ position:'fixed', bottom:0, left:p.x, zIndex:50, pointerEvents:'none', opacity:.18,
          animation:'sunflower-sway '+(5+i)+'s ease-in-out infinite', animationDelay:p.delay, transformOrigin:'50% 100%', transform:'scale('+p.scale+')' }}>
          <svg width="100" height="220" viewBox="0 0 100 220" fill="none">
            <line x1="50" y1="220" x2="48" y2="80" stroke="#5a8a20" strokeWidth="6" strokeLinecap="round"/>
            <line x1="48" y1="160" x2="20" y2="130" stroke="#5a8a20" strokeWidth="4" strokeLinecap="round"/>
            <line x1="49" y1="140" x2="78" y2="110" stroke="#5a8a20" strokeWidth="3.5" strokeLinecap="round"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,j) => (
              <ellipse key={j} cx={50+Math.cos(a*Math.PI/180)*22} cy={80+Math.sin(a*Math.PI/180)*22}
                rx="10" ry="5" fill="#f5c800" opacity=".9"
                transform={'rotate('+(a+90)+','+( 50+Math.cos(a*Math.PI/180)*22)+','+(80+Math.sin(a*Math.PI/180)*22)+')'}/>
            ))}
            <circle cx="50" cy="80" r="16" fill="#8b4513"/><circle cx="50" cy="80" r="10" fill="#5a2a00"/>
          </svg>
        </div>
      ))}
      {Array.from({length:12}).map((_,i) => (
        <div key={i} className="sunflower-petal" style={{
          left:(i*8.5+3)%95+'%', width:'8px', height:'14px',
          background:'hsl('+(42+(i%4)*8)+',95%,'+(60+(i%3)*8)+'%)',
          opacity:.15+(i%3)*.04, animationDuration:(6+(i*.8)%5)+'s', animationDelay:(i*.6)%7+'s',
        }}/>
      ))}
    </>
  )

  /* ── 나비정원 ── */
  if (type === 'butterfly') return (
    <>
      <style>{`
        @keyframes butterfly-flutter { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(.3)} }
        @keyframes butterfly-path-1 { 0%{transform:translate(0,0)} 20%{transform:translate(80px,-60px)} 40%{transform:translate(160px,-20px)}
          60%{transform:translate(220px,-80px)} 80%{transform:translate(160px,-130px)} 100%{transform:translate(0,0)} }
        @keyframes butterfly-path-2 { 0%{transform:translate(0,0)} 25%{transform:translate(-60px,-80px)} 50%{transform:translate(-140px,-30px)}
          75%{transform:translate(-80px,-110px)} 100%{transform:translate(0,0)} }
        @keyframes butterfly-path-3 { 0%{transform:translate(0,0)} 33%{transform:translate(100px,-50px)} 66%{transform:translate(50px,-120px)} 100%{transform:translate(0,0)} }
        @keyframes flower-bob { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        .butterfly-wrap { position:fixed; pointer-events:none; z-index:50; }
        .butterfly-wing { animation:butterfly-flutter .25s ease-in-out infinite; transform-origin:center; }
      `}</style>
      {[{l:'8%',c:'#ff80ab'},{l:'30%',c:'#ffb3c6'},{l:'55%',c:'#c8f5a0'},{l:'75%',c:'#80d8ff'},{l:'90%',c:'#ff80ab'}].map((f,i) => (
        <div key={'f'+i} style={{ position:'fixed', bottom:0, left:f.l, zIndex:50, pointerEvents:'none', opacity:.15,
          animation:'flower-bob '+(3+i*.5)+'s ease-in-out infinite', animationDelay:(i*.4)+'s', transformOrigin:'50% 100%' }}>
          <svg width="40" height={100+i*20} viewBox="0 0 40 120" fill="none">
            <line x1="20" y1="120" x2="20" y2="40" stroke="#4a9a20" strokeWidth="3"/>
            {[0,60,120,180,240,300].map((a,j) => (
              <ellipse key={j} cx={20+Math.cos(a*Math.PI/180)*13} cy={40+Math.sin(a*Math.PI/180)*13}
                rx="9" ry="5" fill={f.c} opacity=".85"
                transform={'rotate('+a+','+(20+Math.cos(a*Math.PI/180)*13)+','+(40+Math.sin(a*Math.PI/180)*13)+')'}/>
            ))}
            <circle cx="20" cy="40" r="7" fill="#fff176"/>
          </svg>
        </div>
      ))}
      {[
        {l:'20%',t:'35%',anim:'butterfly-path-1',dur:'8s',w1:'#9c27b0',w2:'#e040fb',sz:22},
        {l:'60%',t:'45%',anim:'butterfly-path-2',dur:'10s',w1:'#2196f3',w2:'#64b5f6',sz:18},
        {l:'40%',t:'55%',anim:'butterfly-path-3',dur:'12s',w1:'#ff9800',w2:'#ffcc02',sz:16},
        {l:'75%',t:'30%',anim:'butterfly-path-1',dur:'9s',delay:'3s',w1:'#e91e63',w2:'#f48fb1',sz:14},
        {l:'15%',t:'50%',anim:'butterfly-path-2',dur:'11s',delay:'2s',w1:'#009688',w2:'#4db6ac',sz:20},
      ].map((b,i) => (
        <div key={'b'+i} className="butterfly-wrap" style={{
          left:b.l, top:b.t, opacity:.18+(i%3)*.04,
          animation:b.anim+' '+b.dur+' ease-in-out infinite', animationDelay:b.delay||'0s',
        }}>
          <svg width={b.sz*2} height={b.sz*1.5} viewBox="0 0 40 30" className="butterfly-wing">
            <ellipse cx="10" cy="10" rx="10" ry="8" fill={b.w1} opacity=".9"/>
            <ellipse cx="8" cy="22" rx="8" ry="6" fill={b.w2} opacity=".8"/>
            <ellipse cx="30" cy="10" rx="10" ry="8" fill={b.w1} opacity=".9"/>
            <ellipse cx="32" cy="22" rx="8" ry="6" fill={b.w2} opacity=".8"/>
            <line x1="20" y1="4" x2="20" y2="26" stroke="#333" strokeWidth="1.5"/>
          </svg>
        </div>
      ))}
    </>
  )

  /* ── 뭉게구름 ── */
  if (type === 'cloud') return (
    <>
      <style>{`
        @keyframes cloud-drift-1 { 0%{transform:translateX(-220px);opacity:0} 5%{opacity:.9} 95%{opacity:.9} 100%{transform:translateX(calc(100vw + 220px));opacity:0} }
        @keyframes cloud-drift-2 { 0%{transform:translateX(calc(100vw + 180px));opacity:0} 5%{opacity:.7} 95%{opacity:.7} 100%{transform:translateX(-180px);opacity:0} }
        @keyframes sun-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes bird-fly { 0%{transform:translateX(-80px) translateY(0)} 25%{transform:translateX(25vw) translateY(-20px)}
          50%{transform:translateX(50vw) translateY(10px)} 75%{transform:translateX(75vw) translateY(-15px)} 100%{transform:translateX(calc(100vw+80px)) translateY(0)} }
        .cloud-puff { position:fixed; pointer-events:none; z-index:50; }
        .bird { position:fixed; pointer-events:none; z-index:50; animation:bird-fly linear infinite; }
      `}</style>
      <div style={{ position:'fixed', top:'5%', right:'8%', zIndex:50, pointerEvents:'none', opacity:.12 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="22" fill="#f5c800"/>
          <g style={{ animation:'sun-spin 20s linear infinite', transformOrigin:'50px 50px' }}>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
              <line key={i} x1={50+Math.cos(a*Math.PI/180)*28} y1={50+Math.sin(a*Math.PI/180)*28}
                x2={50+Math.cos(a*Math.PI/180)*42} y2={50+Math.sin(a*Math.PI/180)*42}
                stroke="#f5c800" strokeWidth="3" strokeLinecap="round"/>
            ))}
          </g>
        </svg>
      </div>
      {[
        {top:'8%',w:200,h:70,dur:'28s',delay:'0s',anim:'cloud-drift-1',op:.85},
        {top:'16%',w:150,h:55,dur:'36s',delay:'8s',anim:'cloud-drift-1',op:.7},
        {top:'5%',w:180,h:65,dur:'32s',delay:'4s',anim:'cloud-drift-2',op:.75},
        {top:'22%',w:130,h:50,dur:'42s',delay:'14s',anim:'cloud-drift-1',op:.6},
        {top:'12%',w:220,h:75,dur:'38s',delay:'20s',anim:'cloud-drift-2',op:.8},
      ].map((c,i) => (
        <div key={i} className="cloud-puff" style={{
          top:c.top, left:0, opacity:c.op*.13, animation:c.anim+' '+c.dur+' linear infinite', animationDelay:c.delay,
        }}>
          <svg width={c.w} height={c.h} viewBox={'0 0 '+c.w+' '+c.h} fill="white">
            <ellipse cx={c.w*.5} cy={c.h*.7} rx={c.w*.48} ry={c.h*.3}/>
            <ellipse cx={c.w*.3} cy={c.h*.5} rx={c.w*.28} ry={c.h*.4}/>
            <ellipse cx={c.w*.55} cy={c.h*.4} rx={c.w*.32} ry={c.h*.45}/>
            <ellipse cx={c.w*.75} cy={c.h*.52} rx={c.w*.24} ry={c.h*.35}/>
          </svg>
        </div>
      ))}
      {[{t:'18%',dur:'18s',d:'0s'},{t:'28%',dur:'22s',d:'6s'},{t:'12%',dur:'26s',d:'12s'}].map((b,i) => (
        <div key={'b'+i} className="bird" style={{ top:b.t, opacity:.1, animationDuration:b.dur, animationDelay:b.d }}>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <path d="M0 6 Q6 0 12 5 Q18 0 24 6" stroke="#2880d8" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      ))}
    </>
  )

  /* ── 다람쥐숲 ── */
  if (type === 'squirrel') return (
    <>
      <style>{`
        @keyframes tree-sway { 0%,100%{transform:rotate(-.8deg)} 50%{transform:rotate(.8deg)} }
        @keyframes acorn-fall { 0%{transform:translate(0,0) rotate(0);opacity:0} 10%{opacity:.8} 100%{transform:translate(15px,80px) rotate(180deg);opacity:0} }
      `}</style>
      {[{x:'28%',h:260,tw:110},{x:'68%',h:220,tw:90}].map((tr,i) => (
        <div key={i} style={{ position:'fixed', bottom:0, left:tr.x, zIndex:50, pointerEvents:'none', opacity:.2,
          animation:'tree-sway '+(7+i*2)+'s ease-in-out infinite', animationDelay:(i*1.5)+'s', transformOrigin:'50% 100%' }}>
          <svg width={tr.tw} height={tr.h} viewBox={'0 0 '+tr.tw+' '+tr.h} fill="none">
            <rect x={tr.tw/2-7} y={tr.h-80} width="14" height="80" rx="4" fill="#7a4a1a"/>
            <rect x={tr.tw/2-4} y={tr.h-160} width="8" height="90" rx="3" fill="#6a3a10"/>
            <circle cx={tr.tw/2} cy={tr.h-180} r={tr.tw*.45} fill="#4a8a20"/>
            <circle cx={tr.tw/2-18} cy={tr.h-160} r={tr.tw*.28} fill="#5a9a28"/>
            <circle cx={tr.tw/2+16} cy={tr.h-165} r={tr.tw*.3} fill="#3a7a18"/>
            <ellipse cx={tr.tw/2+5} cy={tr.h-100} rx="7" ry="5" fill="#3a1a00"/>
          </svg>
        </div>
      ))}
      {[{l:'30%',d:'3s'},{l:'70%',d:'8s'}].map((a,i) => (
        <div key={'a'+i} style={{ position:'fixed', top:'25%', left:a.l, zIndex:50, pointerEvents:'none', opacity:.15,
          animation:'acorn-fall 4s ease-in infinite', animationDelay:a.d }}>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path d="M2 8 Q7 2 12 8 L10 8 Q7 5 4 8 Z" fill="#5a3a10"/>
            <ellipse cx="7" cy="13" rx="5" ry="6" fill="#8b5e20"/>
            <line x1="7" y1="5" x2="7" y2="2" stroke="#5a3a10" strokeWidth="1.5"/>
          </svg>
        </div>
      ))}
    </>
  )

  /* ── 연어의강 ── */
  if (type === 'salmon') return (
    <>
      <style>{`
        @keyframes river-flow { 0%{transform:translateX(0)} 100%{transform:translateX(-60px)} }
        @keyframes salmon-jump-1 { 0%,39%{transform:translate(0,0) rotate(0);opacity:0} 40%{opacity:1;transform:translate(0,0) rotate(-20deg)}
          55%{transform:translate(-40px,-120px) rotate(-60deg)} 65%{transform:translate(-60px,-150px) rotate(-80deg)}
          75%{transform:translate(-80px,-120px) rotate(-100deg)} 88%{transform:translate(-100px,-20px) rotate(-150deg);opacity:1}
          90%,100%{transform:translate(-110px,10px) rotate(-160deg);opacity:0} }
        @keyframes ripple-spread { 0%{transform:scale(0);opacity:.8} 100%{transform:scale(3);opacity:0} }
        .salmon { position:fixed; pointer-events:none; z-index:1; }
        .ripple { position:fixed; pointer-events:none; z-index:50; border-radius:50%; border:2px solid rgba(26,122,176,.5); animation:ripple-spread 1.5s ease-out infinite; }
      `}</style>
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'35%', zIndex:50, pointerEvents:'none',
        background:'linear-gradient(180deg, transparent 0%, rgba(26,122,176,.08) 40%, rgba(26,122,176,.18) 100%)', overflow:'hidden' }}>
        {Array.from({length:8}).map((_,i) => (
          <div key={i} style={{ position:'absolute', top:(10+i*12)+'%', left:0, right:0, height:'2px',
            background:'linear-gradient(90deg, transparent, rgba(136,200,232,'+(0.15+i*.02)+'), transparent)',
            animation:'river-flow '+(3+i*.4)+'s linear infinite', animationDelay:(i*.3)+'s', opacity:.7+(i%3)*.1 }}/>
        ))}
      </div>
      {[{l:'55%',b:'30%',delay:'0s'},{l:'70%',b:'28%',delay:'1.8s'},{l:'62%',b:'32%',delay:'3.2s'}].map((s,i) => (
        <div key={i} className="salmon" style={{ left:s.l, bottom:s.b,
          animation:'salmon-jump-1 5s ease-in-out infinite', animationDelay:s.delay, opacity:.22+(i%2)*.04 }}>
          <svg width="52" height="22" viewBox="0 0 52 22" fill="none">
            <ellipse cx="22" cy="11" rx="20" ry="8" fill="#e8602a"/>
            <ellipse cx="20" cy="11" rx="18" ry="6.5" fill="#f07840"/>
            <ellipse cx="22" cy="14" rx="14" ry="4" fill="#f8c8a0" opacity=".6"/>
            <path d="M10 6 L18 11 L10 13 Z" fill="#c04020"/><path d="M28 4 L34 11 L28 16 Z" fill="#c04020"/>
            <path d="M40 11 L52 4 L50 11 L52 18 Z" fill="#c04020"/>
            <circle cx="8" cy="10" r="2.5" fill="#fff"/><circle cx="8" cy="10" r="1.5" fill="#1a0800"/>
          </svg>
        </div>
      ))}
    </>
  )

  /* ── 폭포 ── */
  if (type === 'waterfall') return (
    <>
      <style>{`
        @keyframes fall-stream { 0%{transform:translateY(-100%);opacity:0} 5%{opacity:1} 95%{opacity:.8} 100%{transform:translateY(100%);opacity:0} }
        @keyframes mist-rise { 0%{transform:translateY(0) scale(1);opacity:0} 20%{opacity:.5} 100%{transform:translateY(-80px) scale(2.5);opacity:0} }
        @keyframes pool-ripple { 0%{transform:scale(1) scaleY(.4);opacity:.6} 100%{transform:scale(4) scaleY(.4);opacity:0} }
        .fall-col { position:absolute; top:0; border-radius:4px;
          background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(140,210,240,.6),rgba(255,255,255,.5)); animation:fall-stream linear infinite; }
        .mist-puff { position:absolute; border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.8),transparent); animation:mist-rise ease-out infinite; }
      `}</style>
      <div style={{ position:'fixed', right:'6%', top:0, bottom:0, width:'180px', zIndex:50, pointerEvents:'none', opacity:.18 }}>
        <svg width="180" height="100%" viewBox="0 0 180 800" preserveAspectRatio="none" fill="none">
          <path d="M60 0 L75 0 L80 50 L90 800 L0 800 Z" fill="#5a7a58"/>
          <path d="M60 0 L75 0 L78 40 L70 800 L55 800 Z" fill="#4a6a48" opacity=".6"/>
          <ellipse cx="30" cy="750" rx="35" ry="20" fill="#4a5a48"/>
          <ellipse cx="75" cy="760" rx="28" ry="15" fill="#3a4a38"/>
          <ellipse cx="120" cy="755" rx="22" ry="12" fill="#4a5a48"/>
        </svg>
        <div style={{ position:'absolute', top:0, left:'32px', width:'46px', height:'100%', overflow:'hidden' }}>
          {Array.from({length:8}).map((_,i) => (
            <div key={i} className="fall-col" style={{
              left:(i*5.5+1)+'px', width:i%3===0?'6px':i%2===0?'4px':'3px', height:(12+i%4*4)+'%',
              opacity:.5+(i%3)*.1, animationDuration:(.6+(i*.08)%.5)+'s', animationDelay:(i*.12)%.7+'s',
            }}/>
          ))}
          {Array.from({length:10}).map((_,i) => (
            <div key={'m'+i} className="mist-puff" style={{
              bottom:(2+i%3*3)+'%', left:(i*4+2)+'px', width:'18px', height:'18px',
              opacity:.08+(i%3)*.03, animationDuration:(1.5+(i*.2)%1.5)+'s', animationDelay:(i*.18)%2+'s',
            }}/>
          ))}
        </div>
      </div>
      {Array.from({length:4}).map((_,i) => (
        <div key={i} style={{ position:'fixed', bottom:'12%', right:(12+i*3)+'%', zIndex:50, pointerEvents:'none',
          width:'40px', height:'16px', borderRadius:'50%', border:'1.5px solid rgba(26,144,96,.25)',
          animation:'pool-ripple 2.5s ease-out infinite', animationDelay:(i*.6)+'s', opacity:.12 }}/>
      ))}
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'220px', zIndex:50, pointerEvents:'none',
        background:'linear-gradient(90deg, transparent, rgba(200,240,220,.06))' }}/>
    </>
  )

  /* ── 로키 (프로젝트 헤일메리 — rocky2.png 배경) ── */
  if (type === 'rocky') return (
    <>
      <style>{`
        /* ─── 배경 이미지 ─── */
        .rk-bg { position:fixed; inset:0; pointer-events:none; z-index:0; background:url('/images/rocky2.png') center/cover no-repeat; opacity:0.18; }
        /* ─── 별 반짝임 (3종 불규칙) ─── */
        @keyframes tw-a { 0%,100%{opacity:.1;transform:scale(.8)} 20%{opacity:.95;transform:scale(1.5)} 45%{opacity:.2;transform:scale(1)} 70%{opacity:.8;transform:scale(1.3)} }
        @keyframes tw-b { 0%,100%{opacity:.15;transform:scale(1)} 30%{opacity:1;transform:scale(1.6)} 60%{opacity:.1;transform:scale(.9)} 80%{opacity:.55;transform:scale(1.1)} }
        @keyframes tw-c { 0%,100%{opacity:.2} 15%{opacity:.4} 50%{opacity:1;transform:scale(1.4)} 65%{opacity:.12} }
        .rk-star { position:fixed; border-radius:50%; pointer-events:none; z-index:1; }
        .rk-star-b::before,.rk-star-b::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:inherit; border-radius:1px; }
        .rk-star-b::before { width:1px; height:250%; }
        .rk-star-b::after { width:250%; height:1px; }
        /* ─── 별똥별 ─── */
        @keyframes rk-met { 0%{transform:translateX(0) translateY(0);opacity:0;width:0} 2%{opacity:.9} 12%{width:150px} 100%{transform:translateX(-750px) translateY(500px);opacity:0;width:0} }
        .rk-meteor { position:fixed; pointer-events:none; z-index:1; height:1.5px; border-radius:1px; background:linear-gradient(90deg,rgba(232,200,126,.95),rgba(200,168,110,.4),transparent); animation:rk-met linear infinite; }
      `}</style>
      {/* rocky2.png 배경 */}
      <div className="rk-bg" />
      {/* 별 — 70개, 3레이어 불규칙 반짝임 */}
      {Array.from({length:70}).map((_,i) => {
        const L = i<38?0:i<58?1:2
        const sz = L===0?(0.6+(i%3)*0.4):L===1?(1.4+(i%3)*0.7):(2.5+(i%2)*1.5)
        const an = ['tw-a','tw-b','tw-c'][i%3]
        const cl = ['#ffffff','#c8a86e','#8888cc','#ffcc88','#99ccff','#ffe8a0'][i%6]
        return <div key={'s'+i} className={'rk-star'+(L===2?' rk-star-b':'')} style={{left:((i*7.3+3.7*(i%7)+2)%98+1)+'%',top:((i*11.3+5.1*(i%5)+1)%88+1)+'%',width:sz+'px',height:sz+'px',background:cl,animationName:an,animationDuration:(2.5+(i*1.3)%5)+'s',animationDelay:(i*.47)%7+'s',animationTimingFunction:'ease-in-out',animationIterationCount:'infinite',boxShadow:L===2?'0 0 '+(sz*3)+'px '+cl:'none'}} />
      })}
      {/* 별똥별 */}
      {Array.from({length:5}).map((_,i) => {
        const ts=[6,20,35,52,14], ds=[4.5,6.5,3.8,5.5,7.5], dl=[4,13,7,20,28]
        return <div key={'m'+i} className="rk-meteor" style={{top:ts[i]+'%',right:'-140px',animationDuration:ds[i]+'s',animationDelay:dl[i]+'s'}} />
      })}
    </>
  )

  return null
}

/* ───────────────────── 테마 패널 ───────────────────── */
function ThemePanel({ show, onClose, themes, currentIdx, onSelect, fonts, fontIdx, onFontSelect }) {
  if (!show) return null
  const groups = [
    { label: '스페셜', range: [0, 1] },
    { label: '기본', range: [1, 3] },
    { label: '시즌', range: [3, 7] },
    { label: '창의', range: [7, 17] },
    { label: '다크', range: [17, 23] },
  ]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }} />
      <div style={{
        position:'relative', width:420, maxWidth:'90vw', maxHeight:'80vh',
        background: themes[currentIdx].card, color: themes[currentIdx].text,
        border: '1px solid ' + themes[currentIdx].border,
        borderRadius: 16, padding: '24px 20px', overflowY: 'auto',
        animation: 'popIn 0.2s ease-out',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>테마 설정</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color: themes[currentIdx].text, opacity:0.5 }}>✕</button>
        </div>
        {groups.map(g => (
          <div key={g.label} style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, opacity:0.4, marginBottom:8 }}>{g.label}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {themes.slice(g.range[0], g.range[1]).map((theme, i) => {
                const idx = g.range[0] + i
                return (
                  <button key={idx} onClick={() => onSelect(idx)} style={{
                    padding:'8px 4px', borderRadius:8, fontSize:11, cursor:'pointer',
                    border: idx === currentIdx ? '2px solid ' + themes[currentIdx].primary : '1px solid ' + themes[currentIdx].border,
                    background: theme.bg, color: theme.text, textAlign:'center',
                  }}>{theme.name}</button>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ borderTop:'1px solid ' + themes[currentIdx].border, paddingTop:16 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, opacity:0.4, marginBottom:8 }}>폰트</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {fonts.map((fo, i) => (
              <button key={i} onClick={() => onFontSelect(i)} style={{
                padding:'8px 12px', borderRadius:8, fontSize:13, cursor:'pointer',
                fontFamily: fo.css, textAlign:'left',
                border: i === fontIdx ? '2px solid ' + themes[currentIdx].primary : '1px solid ' + themes[currentIdx].border,
                background: i === fontIdx ? themes[currentIdx].primary + '15' : 'transparent',
                color: themes[currentIdx].text,
              }}>{fo.name}</button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes popIn { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
    </div>
  )
}

/* ───────────────────── Layout 메인 ───────────────────── */
const CATEGORIES = [
  { slug: null, label: '전체', emoji: '📋', desc: '모든 포스팅' },
  { slug: 'movie-recommend', label: '영화추천', emoji: '🎬', desc: '장르별·상황별 추천' },
  { slug: 'overseas-reaction', label: '해외반응후기', emoji: '🌍', desc: '해외 반응·리뷰' },
  { slug: 'marvel', label: '마블', emoji: '🦸', desc: 'MCU·마블 시리즈' },
  { slug: 'drama', label: '드라마', emoji: '📺', desc: '한국·해외 드라마' },
  { slug: 'animation', label: '애니메이션', emoji: '🎨', desc: '애니·지브리·극장판' },
]

export default function Layout({ children, title, description, onCategoryChange }) {
  const router = useRouter()
  const [themeIdx, setThemeIdx] = useState(7)
  const [fontIdx, setFontIdx] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return
    try {
      const sideAds = document.querySelectorAll('.side-ad .adsbygoogle')
      sideAds.forEach(ad => {
        if (!ad.dataset.adsbygoogleStatus) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      })
    } catch (e) {}
  }, [router.asPath])

  useEffect(() => {
    const saved = localStorage.getItem('film-theme')
    if (saved !== null) setThemeIdx(parseInt(saved, 10))
    const savedFont = localStorage.getItem('film-font')
    if (savedFont !== null) setFontIdx(parseInt(savedFont, 10))
  }, [])

  const selectTheme = useCallback((idx) => { setThemeIdx(idx); localStorage.setItem('film-theme', idx) }, [])
  const selectFont = useCallback((idx) => { setFontIdx(idx); localStorage.setItem('film-font', idx) }, [])

  const handleCatSelect = (cat) => {
    setSelectedCat(cat)
    setShowCatMenu(false)
    if (onCategoryChange) {
      onCategoryChange(cat)
    } else {
      const catObj = CATEGORIES.find(c => c.slug === cat)
      if (catObj && catObj.label !== '전체') {
        window.location.href = '/?cat=' + encodeURIComponent(catObj.label)
      } else {
        window.location.href = '/'
      }
    }
  }

  const t = THEMES[themeIdx] || THEMES[0]
  const f = FONTS[fontIdx] || FONTS[0]
  const pageTitle = title ? title + ' | R의 필름공장' : 'R의 필름공장 — 영화 추천·결말 해석·해외반응 허브'
  const pageDesc = description || '영화 추천, 결말 해석, 해외반응, 드라마·애니·마블 정보를 한곳에서. 589편+ 작품 가이드.'
  const currentCat = CATEGORIES.find(c => c.slug === selectedCat) || CATEGORIES[0]

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={f.url} rel="stylesheet" />
        <meta name="naver-site-verification" content="ef5c3c3738f136552a02e2a7c27ec6ac1e83339f" />
        <meta name="google-site-verification" content="2DAD_BGWxdRXKWrw6lYKe6e0p3BLAiAXbMHVYXrU48k" />
      </Head>

      <AnimationLayer type={t.animation} />

      <div style={{
        minHeight: '100vh', background: t.animation ? 'transparent' : t.bg, color: t.text, fontFamily: f.css,
        transition: 'background 0.3s, color 0.3s', position: 'relative',
      }}>
        {/* ─── 헤더 ─── */}
        <header style={{
          borderBottom: '1px solid ' + t.border,
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: t.headerBg + 'e8',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '0 24px',
            height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {/* 좌측: 로고 + 카테고리 드롭다운 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="/" style={{
                textDecoration: 'none', color: t.primary, fontWeight: 800, fontSize: 18,
                letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <img src="/favicon.svg" alt="R" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>R의 필름공장</span>
                  <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.45, letterSpacing: '0.05em', color: t.text }}>영화 · 드라마 · 애니 가이드</span>
                </div>
              </a>

              {/* 카테고리 드롭다운 버튼 */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowCatMenu(!showCatMenu); setShowPanel(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                  background: showCatMenu ? t.secondary : 'transparent',
                  border: '1px solid ' + t.border,
                  fontSize: 13, fontWeight: 600, color: t.text,
                  transition: 'all .15s', whiteSpace: 'nowrap',
                }}>
                  <span>{currentCat.emoji}</span>
                  <span>{currentCat.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{showCatMenu ? '▲' : '▼'}</span>
                </button>
              </div>
            </div>

            {/* 우측: 테마 버튼 */}
            <button onClick={() => { setShowPanel(true); setShowCatMenu(false) }} style={{
              background: 'none', border: '1px solid ' + t.border, borderRadius: 20,
              padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: t.text,
              opacity: 0.6, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            >
              <span style={{ fontSize: 14 }}>🎨</span>
              <span>테마</span>
            </button>
          </div>
        </header>

        {/* ─── 카테고리 드롭다운 패널 (dinner app 스타일) ─── */}
        {showCatMenu && (
          <>
            <div onClick={() => setShowCatMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
            <div style={{
              position: 'fixed', top: 56, left: 0, right: 0, zIndex: 91,
              background: t.card,
              borderBottom: '2px solid ' + t.primary,
              boxShadow: '0 8px 24px rgba(0,0,0,.15)',
            }}>
              {CATEGORIES.map((cat, i) => {
                const isActive = selectedCat === cat.slug
                return (
                  <button key={cat.label} onClick={() => handleCatSelect(cat.slug)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '14px 24px', border: 'none', cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid ' + t.border : 'none',
                    background: isActive ? t.secondary : 'transparent',
                    textAlign: 'left', transition: 'background .1s', color: t.text,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? t.primary : t.text }}>{cat.label}</span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>{cat.desc}</div>
                    </div>
                    {isActive && <span style={{ fontSize: 12, color: t.primary, fontWeight: 700 }}>선택됨</span>}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ─── 본문 + 사이드 광고 ─── */}
        <div className="layout-with-side-ads" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 0 }}>
          <aside className="side-ad side-ad-left" style={{ width: 160, flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'sticky', top: 80, paddingTop: 24 }}>
              <ins className="adsbygoogle" style={{ display: 'block', width: 160, height: 600 }}
                data-ad-client="ca-pub-8640254349508671" data-ad-slot="6297515693" data-ad-format="vertical" />
            </div>
          </aside>

          <main style={{
            maxWidth: 1100, flex: 1, margin: '0 auto', padding: '32px 24px',
            minHeight: 'calc(100vh - 140px)',
          }}>
            {children}
          </main>

          <aside className="side-ad side-ad-right" style={{ width: 160, flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'sticky', top: 80, paddingTop: 24 }}>
              <ins className="adsbygoogle" style={{ display: 'block', width: 160, height: 600 }}
                data-ad-client="ca-pub-8640254349508671" data-ad-slot="6297515693" data-ad-format="vertical" />
            </div>
          </aside>
        </div>

        {/* ─── 푸터 ─── */}
        <footer style={{
          borderTop: '1px solid ' + t.border, padding: '32px 24px', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.5, fontWeight: 500 }}>R의 필름공장</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.3 }}>© 2026 · 본 사이트는 Google AdSense 및 제휴 마케팅을 통해 수익을 얻을 수 있습니다.</p>
          </div>
        </footer>
      </div>

      <ThemePanel show={showPanel} onClose={() => setShowPanel(false)}
        themes={THEMES} currentIdx={themeIdx} onSelect={selectTheme}
        fonts={FONTS} fontIdx={fontIdx} onFontSelect={selectFont} />

      <Interstitial />

      <style jsx global>{`
        :root {
          --primary-color: ${t.primary};
          --border-color: ${t.border};
          --card-bg: ${t.card};
          --text-color: ${t.text};
          --bg-color: ${t.bg};
          --secondary-color: ${t.secondary};
          --accent-color: ${t.accent};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { color: ${t.text}; background: ${t.bg}; overflow-x: hidden; }
        a { color: inherit; }
        img { max-width: 100%; }
        ::selection { background: ${t.primary}33; }
        .side-ad { display: none; }
        @media (min-width: 1300px) { .side-ad { display: block; } }
      `}</style>
    </>
  )
}
