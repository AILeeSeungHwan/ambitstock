const post = {
  id: 700,
  sections: [
    {
      type: 'intro',
      html: `
        <p>4월 18일 JTBC 금토드라마로 &lsquo;모자무싸(모두가 자신의 무가치함과 싸우고 있다)&rsquo;가 첫 방을 열었다. 같은 날 밤 MBC에서는 아이유·변우석의 &lsquo;21세기 대군부인&rsquo;이 4회 시청률 11.1%를 찍었다. 같은 요일, 같은 시간대에 정반대의 톤을 가진 두 한국 드라마가 TV와 OTT 양쪽에서 맞붙은 셈이다.</p>
        <p>둘은 표면적으로 경쟁작이지만 실제 팬층은 다르다. 한쪽은 박해영 작가의 블랙코미디에 반응하는 관객, 다른 한쪽은 아이유와 변우석의 로맨스 판타지를 기다려온 관객이다. 2026년 4월 한국 드라마 씬에서 이 두 작품을 같이 놓고 비교하면 &lsquo;지금 뭘 볼지&rsquo; 결정하기가 한결 쉬워진다.</p>
        <p><strong>한 줄 결론:</strong> 담백하고 쓴 블랙코미디를 원하면 모자무싸, 따뜻하고 달콤한 판타지 로맨스를 원하면 21세기 대군부인. 두 작품은 같은 주말에 나란히 볼 수 있는 정반대 선택지다.</p>
        <div style="background:rgba(229,9,20,0.05);border-left:3px solid #e50914;padding:14px 18px;border-radius:8px;margin:16px 0">
          <strong>이런 사람에게 추천</strong>
          <ul style="margin:8px 0 0;padding-left:20px">
            <li>2026년 4월 한국 드라마 중 뭘 볼지 고민 중인 시청자</li>
            <li>박해영 작가 팬 vs 아이유·변우석 팬 모두에게 취향 판단 필요</li>
            <li>블랙코미디와 로맨스 판타지의 차이를 명확히 알고 싶은 시청자</li>
          </ul>
        </div>
        <p style="font-size:13px;color:#888;margin-top:12px">
          ※ 이 글은 각 드라마의 1~4화까지 공개된 정보 기준으로 작성했으며, 결말 스포일러는 없습니다. (기준일: 2026-04-22)
        </p>
      `
    },
    { type: 'image', src: '/images/post700_daegunbuin_poster.jpg', alt: '21세기 대군부인 아이유 변우석 MBC 디즈니플러스 공식 포스터', caption: '출처: 네이버 영화' },
    { type: 'toc' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    {
      type: 'h2',
      id: 'compare-table',
      text: '한눈에 보는 비교표 — 공개일·채널·시청률·화제성',
      gradientStyle: 'linear-gradient(135deg, #6a1b9a 0%, #283593 100%)'
    },
    {
      type: 'body',
      html: `
        <p>두 드라마는 모두 2026년 4월 금토 저녁에 편성됐고, 같은 시간대에 경쟁한다는 구조적 특징이 있다. 다만 방송사·장르·배우·유통 플랫폼이 전혀 달라 실제로는 서로 다른 시청자 풀을 타겟한다.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
          <thead>
            <tr style="border-bottom:2px solid #ddd;background:rgba(229,9,20,0.04)">
              <th style="text-align:left;padding:10px 8px">항목</th>
              <th style="text-align:left;padding:10px 8px">모자무싸</th>
              <th style="text-align:left;padding:10px 8px">21세기 대군부인</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>방송사</strong></td><td style="padding:10px 8px">JTBC 금토</td><td style="padding:10px 8px">MBC 금토 + 디즈니+</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>첫방</strong></td><td style="padding:10px 8px">2026-04-18</td><td style="padding:10px 8px">2026-04-10</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>장르</strong></td><td style="padding:10px 8px">블랙코미디 · 인간 드라마</td><td style="padding:10px 8px">로맨스 판타지 · 시대극 믹스</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>주연</strong></td><td style="padding:10px 8px">구교환 · 고윤정</td><td style="padding:10px 8px">아이유 · 변우석</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>작가</strong></td><td style="padding:10px 8px">박해영 (나의 아저씨, 나의 해방일지)</td><td style="padding:10px 8px">하명희</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>국내 시청률</strong></td><td style="padding:10px 8px">1회 2.2% (닐슨, 유료)</td><td style="padding:10px 8px">4회 11.1% (닐슨, 전국)</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:10px 8px"><strong>OTT 성적</strong></td><td style="padding:10px 8px">넷플릭스/쿠팡플레이 동시 공개</td><td style="padding:10px 8px">디즈니+ 글로벌 4위 · 비영어권 1위</td></tr>
            <tr><td style="padding:10px 8px"><strong>화제성</strong></td><td style="padding:10px 8px">박해영 브랜드 · 호불호 갈림</td><td style="padding:10px 8px">TV-OTT 화제성 2주 연속 1위</td></tr>
          </tbody>
        </table>
        <p style="font-size:12px;color:#999;margin-top:4px">※ 기준일: 2026-04-22. 출처: 뉴시스, 일간스포츠, 굿데이터 펀덱스, 디즈니+ 공식 집계.</p>
      `
    },
    {
      type: 'h2',
      id: 'genre-tone',
      text: '장르와 톤 — 박해영 블랙코미디 vs 달콤한 판타지 로맨스',
      gradientStyle: 'linear-gradient(135deg, #ad1457 0%, #6a1b9a 100%)'
    },
    {
      type: 'body',
      html: `
        <p>두 드라마는 같은 시간대를 공유하지만 정서적 거리는 매우 멀다. 모자무싸는 20년째 감독 데뷔를 준비하는 황동만(구교환)과 그를 둘러싼 사람들이 &lsquo;자신의 무가치함&rsquo;과 부딪히는 과정을 그린다. 웃음의 결이 쓴 쪽에 가깝다. 박해영 작가는 이미 &lsquo;나의 아저씨&rsquo;와 &lsquo;나의 해방일지&rsquo;에서 일상의 피로·체념을 구체적인 대사로 옮기는 작법을 선보인 바 있다. 모자무싸는 그 계보를 잇는 블랙코미디로 분류된다.</p>
        <p>반면 21세기 대군부인은 현대 입헌군주제 세계관에서 벌어지는 왕족과 평범한 여성의 로맨스를 중심에 둔다. 판타지 전제를 로맨틱하게 풀어내는 톤이며, 아이유와 변우석의 비주얼·케미스트리가 중심 동력이다. 4화까지 공개된 시점에서 시청자 반응은 &lsquo;궁 2.0&rsquo;이라는 수식어를 받을 만큼 안정적이다.</p>
        <ul style="margin:10px 0;padding-left:20px">
          <li><strong>모자무싸</strong>: 감정의 온도 낮음. 웃음과 쓸쓸함이 교차. 페이스가 느리고 대사·표정 중심.</li>
          <li><strong>21세기 대군부인</strong>: 감정 온도 높음. 설렘·갈등·로맨스 장면 리듬이 빠르며 영상이 화려함.</li>
        </ul>
        <p>결국 어떤 장르 무드를 원하는지가 갈림길이다. 일상에서 받은 피로를 같은 결의 피로로 따라가며 위로받고 싶다면 모자무싸, 지친 하루 끝에 밝고 달콤한 무드로 환기하고 싶다면 21세기 대군부인이 맞다.</p>
      `
    },
    { type: 'image', src: '/images/post700_daegunbuin_still.jpg', alt: '21세기 대군부인 아이유 변우석 궁중 로맨스 판타지 장면', caption: 'ⓒ 네이버 영화' },
    {
      type: 'h2',
      id: 'cast-chemistry',
      text: '주연 조합의 매력 — 구교환×고윤정 vs 아이유×변우석',
      gradientStyle: 'linear-gradient(135deg, #00838f 0%, #1565c0 100%)'
    },
    {
      type: 'body',
      html: `
        <p>두 드라마의 배우 조합은 각각 뚜렷한 강점을 가진다. 모자무싸는 배우의 &lsquo;연기 밀도&rsquo;, 21세기 대군부인은 &lsquo;비주얼 케미&rsquo;를 앞세운다.</p>
        <p>구교환은 독립영화와 상업작을 오가며 쌓은 섬세한 표현력을 이번 작품에서 황동만이라는 실패한 예술가 캐릭터에 녹인다. 기존 &lsquo;D.P.&rsquo;나 &lsquo;모가디슈&rsquo;에서 보였던 고요한 붕괴감이 이번엔 블랙코미디 톤으로 변주된다. 고윤정은 &lsquo;무빙&rsquo; 이후 처음으로 드라마 주연을 맡아 변은아 역으로 구교환과 감정 대비를 만든다. 두 사람의 케미는 판타지적 설렘보다 &lsquo;삶에 지친 두 사람이 만나 서로를 알아보는&rsquo; 방식에 가깝다.</p>
        <p>아이유와 변우석은 &lsquo;선재 업고 튀어&rsquo; 이후 가장 기대됐던 현대극 만남이다. 변우석은 왕세자 역할로 절제된 로맨스 연기를, 아이유는 평범한 여성이 왕실 체계에 맞서는 서사의 중심축을 맡는다. 4화까지 공개된 시점의 대중 반응은 &ldquo;두 사람의 투샷만으로 화제가 된다&rdquo;는 평이 많다. 굿데이터 펀덱스 화제성 순위에서 두 배우가 3주 연속 1·2위를 기록한 배경이다.</p>
        <blockquote style="border-left:4px solid #6a1b9a;padding:10px 16px;margin:16px 0;background:rgba(106,27,154,0.04);color:#444;font-size:14px">
          아이유와 변우석은 3주 연속 드라마 출연자 화제성 1·2위를 유지 중이며, &lsquo;21세기 대군부인&rsquo;은 TV-OTT 드라마 화제성 2주 연속 1위에 올랐다. (출처: 굿데이터 펀덱스 2026년 4월 3주차)
        </blockquote>
      `
    },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    { type: 'image', src: '/images/post700_mojamussa_poster.jpg', alt: '모자무싸 구교환 고윤정 JTBC 박해영 드라마 공식 포스터', caption: '출처: 네이버 영화' },
    {
      type: 'h2',
      id: 'reception',
      text: '화제성과 성과 — 2.2% 출발 vs 글로벌 4위',
      gradientStyle: 'linear-gradient(135deg, #ef6c00 0%, #c62828 100%)'
    },
    {
      type: 'body',
      html: `
        <p>수치만 보면 21세기 대군부인의 압승이다. 닐슨코리아 기준 국내 시청률은 4회에서 11.1%로 두 자릿수를 돌파했고, 디즈니+에서는 글로벌 톱10 4위·비영어권 1위를 찍었다. 한국·일본·홍콩·대만·싱가포르에서는 공개 직후부터 1위를 유지 중이며 미국 5위, 브라질 1위 등 중남미와 유럽에서도 상위권에 들어갔다. 디즈니+는 공식적으로 &ldquo;전 세계 최다 시청 한국 시리즈 1위&rdquo;라고 발표했다. (기준일: 2026-04-22, 출처: 디즈니+·일간스포츠)</p>
        <p>모자무싸의 첫방 시청률 2.2%는 낮지 않지만 동시간대 경쟁이 강했다는 점을 감안해야 한다. 같은 시간 MBC에서 11.1%를 찍고 있고, SBS &lsquo;신이랑 법률사무소&rsquo;도 고정 팬층이 있다. 박해영 작가 이름값을 생각하면 2%대 출발은 예상보다 낮다는 평이 나왔지만, 이 작가의 작품은 &lsquo;입소문 드라마&rsquo; 성향이 강하다는 전례가 있다. &lsquo;나의 해방일지&rsquo;도 초반 시청률이 낮다가 후반부에 반등했다.</p>
        <ul style="margin:10px 0;padding-left:20px">
          <li><strong>즉각적 성과</strong>가 중요하다면 — 이미 입증된 21세기 대군부인</li>
          <li><strong>입소문 후 반등</strong> 가능성을 보고 싶다면 — 모자무싸 중후반부 회차 주목</li>
          <li><strong>글로벌 시청 경험</strong>까지 고려한다면 — 디즈니+ 구독 시 21세기 대군부인이 편리</li>
        </ul>
      `
    },
    { type: 'image', src: '/images/post700_mojamussa_still.jpg', alt: '모자무싸 황동만 변은아 구교환 고윤정 블랙코미디 장면', caption: 'ⓒ 네이버 영화' },
    {
      type: 'h2',
      id: 'who-for',
      text: '취향별 어떤 드라마가 맞을까 — 상황별 선택 가이드',
      gradientStyle: 'linear-gradient(135deg, #4527a0 0%, #e50914 100%)'
    },
    {
      type: 'body',
      html: `
        <p>두 작품은 경쟁이 아니라 선택의 문제다. 같은 금요일 밤에 나란히 볼 수도 있고, 한쪽만 정주행해도 된다. 아래 상황별로 정리하면 판단이 빠르다.</p>
        <ul style="margin:10px 0;padding-left:20px">
          <li><strong>박해영 작가 팬</strong> → 모자무싸. 대사와 공백의 호흡을 따라가며 보는 사람에게 맞는 리듬이다.</li>
          <li><strong>현대극 로맨스를 원하는 연인·부부 시청</strong> → 21세기 대군부인. 영상미와 로맨스 장면이 화려해 같이 보기 좋다.</li>
          <li><strong>혼자 조용히 집중해서 보는 밤</strong> → 모자무싸. 감정 밀도가 높아 혼자 볼 때 더 잘 스며든다.</li>
          <li><strong>디즈니+ 구독 중</strong> → 21세기 대군부인. 추가 결제 없이 4K로 바로 가능.</li>
          <li><strong>JTBC·넷플릭스·쿠팡플레이 이용자</strong> → 모자무싸. JTBC 본방 외에도 주요 OTT에서 다시보기 가능.</li>
          <li><strong>호불호 타는 작품이 싫다</strong> → 21세기 대군부인. 대중적인 로맨스 판타지로 진입장벽이 낮다.</li>
          <li><strong>&ldquo;나의 해방일지&rdquo; 같은 여운을 원한다</strong> → 모자무싸. 같은 작가의 세계관 연장선.</li>
        </ul>
        <p>반대로 <strong>피해야 할 조합</strong>도 있다. 모자무싸는 전개가 빠르지 않아 &ldquo;딱 떨어지는 스토리&rdquo;를 원하는 시청자에게는 맞지 않는다. 21세기 대군부인은 판타지 전제를 어색해하는 관객에게는 몰입이 어려울 수 있다. 두 작품 모두 호불호 포인트는 분명하므로, 자신의 감상 패턴을 기준으로 고르면 실패 확률이 낮다.</p>
      `
    },
    {
      type: 'ending',
      html: `
        <p>2026년 4월 한국 드라마 씬에서 가장 주목받는 두 작품은 의외로 겹치지 않는다. 모자무싸는 박해영 작가 특유의 저온 서사로 반등 가능성을 기다리는 드라마, 21세기 대군부인은 이미 국내외 시청률·화제성·OTT 지표를 모두 확보한 드라마다. 같은 시간대에 방영된다는 것만 빼면 서로 다른 리그에 속해 있다.</p>
        <p>각 작품을 더 깊이 살펴보고 싶다면 아래 글을 참고할 수 있다.</p>
        <ul style="margin:10px 0;padding-left:20px">
          <li><a href="/mojamussa-first-episode-review-jtbc-koo-kyohwan-2026/">모자무싸 첫방 리뷰 — 1~2화 솔직 평가</a></li>
          <li><a href="/park-haeyoung-drama-world-guide-2026-moja-musa/">박해영 작가 드라마 완전 정복 — 또오해영부터 모자무싸까지</a></li>
          <li><a href="/perfect-crown-iu-byeon-wooseok-disney-2026-review/">21세기 대군부인 리뷰 — 디즈니+ 44개국 상위권의 실체</a></li>
          <li><a href="/21st-century-grand-princess-iu-byeonwooseok-chemistry-2026/">아이유×변우석 케미 분석 — 달의연인 10년 후 두 배우가 왜 잘 맞는가</a></li>
          <li><a href="/grand-princess-vs-yumis-cells-season3-romance-comparison-april-2026/">21세기 대군부인 vs 유미의 세포들 시즌3 비교</a></li>
        </ul>
      `
    },
    { type: 'ad', slot: '6297515693', format: 'auto' }
  ]
}

module.exports = post
