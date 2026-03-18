const post = {
  id: 505,
  sections: [
    {
      type: 'intro',
      html: '<p>OTT 구독을 하나만 유지해야 한다면 어떤 걸 골라야 할까. 넷플릭스, 티빙, 쿠팡플레이 — 세 플랫폼 모두 각자의 이유로 구독할 만하지만, 동시에 셋 다 유지하기에는 매달 나가는 돈이 부담스럽다. 2026년 2월 MAU 기준으로 넷플릭스 1,490만, 쿠팡플레이 879만, 티빙 552만 명이 활성 사용자다. 숫자만 보면 넷플릭스가 압도적이지만, 2위 자리를 두고 쿠팡플레이와 티빙이 치열하게 경쟁 중이다.</p><p>솔직히 말하면, 어떤 콘텐츠를 주로 보는지에 따라 답이 완전히 달라진다. 드라마 팬인지, 스포츠 팬인지, 아니면 영화 위주로 보는지 — 이 세 가지 기준만으로도 어디에 돈을 내야 할지 충분히 판단할 수 있다. 이 글에서 2026년 기준 세 플랫폼을 요금·콘텐츠·스포츠·오리지널 측면에서 직접 비교해봤다.</p>'
    },
    {
      type: 'image',
      src: '/images/post505_thumb.svg',
      alt: '넷플릭스 vs 티빙 vs 쿠팡플레이 2026년 OTT 3강 비교 — 요금, 콘텐츠, 스포츠 총정리',
      caption: '2026년 한국 OTT 3강 구도 — 무엇이 다르고 누구에게 맞는지 정리했다'
    },
    { type: 'toc' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    {
      type: 'h2',
      id: 'section1',
      text: '2026 OTT 3강 한눈에 보기 — MAU와 시장 구도',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>2026년 2월 기준 국내 OTT 월간 활성 사용자(MAU)는 <b>넷플릭스 1,490만 > 쿠팡플레이 879만 > 티빙 552만</b> 순이다. 연평균으로 보면 쿠팡플레이(734만)와 티빙(727만)이 사실상 동률에 가깝게 2위 싸움을 하고 있다. 한때 넷플릭스 독주 체제였던 국내 OTT 시장이 쿠팡플레이의 급성장으로 3강 구도로 재편된 것이다.</p><p>넷플릭스는 여전히 압도적 1위이지만, 요금이 가장 비싸다. 쿠팡플레이는 와우멤버십에 묶어 파는 구조로 빠르게 기반을 넓혔고, 티빙은 국내 방송사 기반의 독점 콘텐츠로 팬층을 유지하고 있다. 셋 다 "잃어버릴 이유"가 충분히 있어서, 뭘 선택해야 할지 오히려 더 헷갈리는 상황이다.</p>'
    },
    {
      type: 'h2',
      id: 'section2',
      text: '요금 비교 — 같은 돈이면 어디가 더 많이 주나',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>2026년 3월 기준 세 플랫폼 요금을 표로 정리했다.</p><table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.95em;"><thead><tr style="background:#1a1a1a;color:#fff;"><th style="padding:10px 12px;text-align:left;border:1px solid #333;">구분</th><th style="padding:10px 12px;text-align:center;border:1px solid #333;">넷플릭스</th><th style="padding:10px 12px;text-align:center;border:1px solid #333;">티빙</th><th style="padding:10px 12px;text-align:center;border:1px solid #333;">쿠팡플레이</th></tr></thead><tbody><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">광고형(최저)</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#e50914;font-weight:bold;">5,500원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#9c4dcc;font-weight:bold;">5,500원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ff6f00;font-weight:bold;">일부 무료(광고)</td></tr><tr style="background:#161616;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">스탠다드</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">13,500원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">10,900원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">와우멤버십 포함</td></tr><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">프리미엄</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">17,000원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">17,000원</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">별도 프리미엄 없음</td></tr><tr style="background:#161616;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">동시접속</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">요금제별 1~4명</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">요금제별 1~4명</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ccc;">5명(와우 기준)</td></tr></tbody></table><p>쿠팡플레이는 쿠팡 와우멤버십(월 7,890원)에 기본으로 포함된다. 쿠팡을 이미 쓰고 있다면 사실상 추가 비용 없이 쿠팡플레이를 이용할 수 있다는 게 가장 큰 강점이다. 일부 콘텐츠는 광고를 시청하면 무료로 볼 수 있는 구조도 있다. 넷플릭스 프리미엄은 17,000원으로 가장 비싸지만, 4K UHD 화질과 최대 4명 동시접속이 가능하다는 점에서 가족 단위 이용 시 나눠 내면 합리적이다.</p>'
    },
    {
      type: 'h2',
      id: 'section3',
      text: '넷플릭스 콘텐츠 — 해외 드라마·영화 압도적, K-오리지널도 강세',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>넷플릭스의 가장 큰 강점은 <b>해외 콘텐츠의 절대적 볼륨</b>이다. 미국 드라마, 영국 드라마, 유럽 영화, 다큐멘터리까지 다른 플랫폼에서 찾기 어려운 콘텐츠가 넷플릭스에 있다. 스트레인저 씽스, 더 크라운, 오렌지 이즈 더 뉴 블랙처럼 해외에서 검증된 작품들이 전부 여기 있다.</p><p>K-오리지널도 무시할 수 없다. 오징어게임, 지금 우리 학교는, 종이의 집: 공동경제구역처럼 글로벌 흥행을 기록한 한국 오리지널 드라마를 꾸준히 투자해서 만들고 있다. 브리저튼 같은 글로벌 히트 시리즈도 넷플릭스에서만 볼 수 있다. "내가 보고 싶은 게 어디 있나"를 따졌을 때, 선택지의 폭은 넷플릭스가 가장 넓다.</p>'
    },
    {
      type: 'h2',
      id: 'section4',
      text: '티빙 콘텐츠 — 국내 방송 최빠 다시보기 + KBO·WBC 독점',
      gradientStyle: 'linear-gradient(to right, #9c27b0, #6a1b9a)'
    },
    {
      type: 'body',
      html: '<p>티빙의 핵심 경쟁력은 두 가지다. <b>tvN·OCN·Mnet 방영 드라마·예능 실시간 + 최빠 다시보기</b>, 그리고 <b>KBO 야구 독점 중계</b>. 눈물의 여왕, 선재 업고 튀어처럼 tvN에서 방영된 드라마는 다른 플랫폼에서 볼 수 없고, 티빙에서만 방영 직후 다시보기가 된다. CJ ENM 계열 콘텐츠를 즐겨보는 사람에게 티빙은 사실상 필수다.</p><p>2026 WBC(월드베이스볼클래식) 중계도 티빙이 독점한다. 야구 시즌이 되면 KBO 전 경기를 모바일에서 실시간으로 볼 수 있어서 야구 팬들의 구독 이유가 된다. 파라마운트+ 콘텐츠도 티빙을 통해 이용 가능하다. 다만 해외 콘텐츠의 폭은 넷플릭스에 비해 제한적이다.</p>'
    },
    {
      type: 'h2',
      id: 'section5',
      text: '쿠팡플레이 콘텐츠 — 스포츠 중계의 강자, 와우멤버십 연동이 핵심',
      gradientStyle: 'linear-gradient(to right, #ff6f00, #e65100)'
    },
    {
      type: 'body',
      html: '<p>쿠팡플레이는 <b>스포츠 중계에서 독보적인 경쟁력</b>을 가지고 있다. 손흥민이 뛰는 프리미어리그 토트넘 경기, EPL 주요 경기, NFL, 테니스 등 해외 스포츠를 국내에서 합법적으로 볼 수 있는 거의 유일한 창구다. 스포츠 팬이라면 이 하나만으로도 구독 이유가 된다.</p><p>쿠팡플레이 오리지널도 무시하기 어렵다. SNL코리아, 소년시대 등 쿠팡플레이에서만 볼 수 있는 오리지널 콘텐츠가 있고, 광고를 시청하면 일부 콘텐츠를 무료로 볼 수 있다. 가장 큰 강점은 역시 <b>와우멤버십 연동</b>이다. 쿠팡 와우멤버십을 이미 쓰고 있다면 별도 비용 없이 쿠팡플레이까지 이용하는 셈이라, 추가 OTT 구독비를 내고 싶지 않은 사람에게는 최선의 선택이다.</p>'
    },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    {
      type: 'h2',
      id: 'section6',
      text: '3강 비교 요약 — 취향별로 정리하면 이렇다',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>세 플랫폼을 취향별로 정리하면 아래와 같다.</p><table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.95em;"><thead><tr style="background:#1a1a1a;color:#fff;"><th style="padding:10px 12px;text-align:left;border:1px solid #333;">이런 사람이라면</th><th style="padding:10px 12px;text-align:center;border:1px solid #333;">추천</th></tr></thead><tbody><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">해외 드라마·영화를 주로 본다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#e50914;font-weight:bold;">넷플릭스</td></tr><tr style="background:#161616;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">글로벌 히트 K-오리지널을 챙긴다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#e50914;font-weight:bold;">넷플릭스</td></tr><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">tvN·OCN 드라마를 빠짐없이 챙긴다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#9c4dcc;font-weight:bold;">티빙</td></tr><tr style="background:#161616;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">야구 시즌에 KBO·WBC를 모바일로 본다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#9c4dcc;font-weight:bold;">티빙</td></tr><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">쿠팡 와우멤버십 사용자다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ff6f00;font-weight:bold;">쿠팡플레이</td></tr><tr style="background:#161616;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">손흥민·EPL·해외 스포츠를 챙긴다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ff6f00;font-weight:bold;">쿠팡플레이</td></tr><tr style="background:#111;"><td style="padding:9px 12px;border:1px solid #2a2a2a;color:#ccc;">OTT 추가 비용 없이 스포츠를 보고 싶다</td><td style="padding:9px 12px;border:1px solid #2a2a2a;text-align:center;color:#ff6f00;font-weight:bold;">쿠팡플레이</td></tr></tbody></table><p>가장 많은 사람에게 맞는 건 넷플릭스다. 콘텐츠의 폭, 오리지널 퀄리티, 인터페이스 완성도 모두 1위다. 단 요금이 가장 비싸고, 국내 방송 드라마를 빠르게 챙겨보는 데는 약하다. 국내 드라마 팬이라면 넷플릭스+티빙 조합이 정석이고, 쿠팡 와우 회원이라면 넷플릭스+쿠팡플레이 조합이 가성비 면에서 낫다.</p>'
    },
    {
      type: 'h2',
      id: 'section7',
      text: '2위 경쟁의 판도 — 쿠팡플레이가 티빙을 이기고 있는 이유',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>연평균 MAU로 보면 쿠팡플레이(734만)와 티빙(727만)은 사실상 동률이다. 그런데 2026년 들어 쿠팡플레이의 월간 MAU가 티빙을 앞서는 달이 많아졌다. 이유는 단순하다 — <b>쿠팡 와우멤버십의 규모 효과</b>다. 이미 수천만 명이 쿠팡 와우를 사용하고 있고, 그중 상당수가 별도 가입 없이 쿠팡플레이를 이용하기 시작했다.</p><p>티빙은 콘텐츠의 질로 맞서고 있다. KBO 야구, WBC 중계, tvN 드라마 독점은 대체 불가능한 강점이다. 야구 시즌이 시작되면 티빙 MAU가 급격히 올라가는 패턴이 반복된다. 반면 비시즌에는 쿠팡플레이가 앞서는 구도다. 2026년 하반기 KBO 시즌이 본격화되면 순위가 다시 뒤집힐 가능성이 크다.</p>'
    },
    {
      type: 'h2',
      id: 'section8',
      text: '이런 사람에게 세 플랫폼 모두 안 맞을 수 있다',
      gradientStyle: 'linear-gradient(to right, #e50914, #b71c1c)'
    },
    {
      type: 'body',
      html: '<p>솔직히 말하면, 세 플랫폼 중 어느 것도 모든 취향을 커버하지 못한다. <b>독립영화·아트하우스 계열을 주로 보는 사람</b>은 왓챠나 무비블록이 더 맞는다. <b>디즈니·마블·스타워즈를 주로 보는 사람</b>은 디즈니플러스 없이는 불완전하다. <b>애플TV+ 오리지널</b>을 즐기는 사람도 세 플랫폼에서 대체할 수 없다.</p><p>또한 최신 영화를 극장 개봉 직후에 OTT에서 보고 싶다면, 국내에서 개봉한 한국·헐리웃 영화 대부분은 OTT 공개까지 3~6개월이 걸린다. 최신 영화를 빠르게 보는 용도로 OTT를 구독하는 건 기대 이하의 경험이 될 수 있다는 점도 알아두자.</p>'
    },
    {
      type: 'cta',
      href: '/netflix-subscription-plans-comparison-2026/',
      text: '넷플릭스 요금제 상세 비교 보기'
    },
    {
      type: 'ending',
      html: '<p>2026년 기준 넷플릭스 vs 티빙 vs 쿠팡플레이 3강 구도는 뚜렷하게 굳어졌다. 셋 중 하나만 고른다면 — 해외 콘텐츠 중심이면 넷플릭스, 국내 드라마 + 야구면 티빙, 와우 회원이면 쿠팡플레이다. 둘을 조합한다면 드라마 팬은 넷플릭스+티빙, 스포츠 팬은 넷플릭스+쿠팡플레이가 현실적으로 가장 많이 쓰는 조합이다.</p><p>OTT를 여러 개 구독하고 있다면, 실제로 어디서 얼마나 보는지 한 달 체크해보는 걸 추천한다. 의외로 하나에 집중되어 있는 경우가 많고, 그때 나머지는 과감하게 해지하는 게 맞다.</p><p>관련 글: <a href="/netflix-subscription-plans-comparison-2026/">넷플릭스 요금제 비교 2026</a> | <a href="/ott-subscription-price-guide-2026/">OTT 구독 요금 전체 비교</a> | <a href="/theater-vs-ott-comparison-2026/">극장 vs OTT — 어디서 볼까</a></p>'
    },
    { type: 'ad', slot: '6297515693', format: 'auto' }
  ]
}

module.exports = post
