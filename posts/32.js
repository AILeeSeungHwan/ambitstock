const post = {
  id: 32,
  sections: [
    { type: 'intro', html: '<p>유튜브 댓글, 레딧, 트위터를 뒤지다 보면 한국 영화에 대한 외국인들의 반응이 정말 재밌다. 특히 반전이 있는 영화를 보고 멘붕에 빠진 리액션 영상은 중독성이 있다. 나도 거의 매일 해외 반응 영상을 찾아보는데, 오늘은 외국인들이 진짜 충격받은 한국 영화 TOP 10을 모아봤다. 실제 댓글과 반응을 번역해서 정리했다.</p>' },
    { type: 'image', src: '/images/post32_thumb.svg', alt: '한국 영화 해외 반응 모음', caption: '외국인들이 충격받은 한국 영화들' },
    { type: 'toc' },
    { type: 'h2', id: 'section1', text: '올드보이 (2003) - "이 영화 만든 나라가 어디야?"', gradientStyle: 'linear-gradient(to right, #e53935, #ff5252)' },
    { type: 'body', html: '<p>레딧 r/movies에서 올드보이 관련 글이 올라올 때마다 수천 개의 댓글이 달린다. 가장 많이 보이는 반응은 &quot;I need therapy after watching this&quot;(이 영화 보고 상담받아야 할 것 같다)와 &quot;The corridor fight scene is the greatest single-take action sequence ever filmed&quot;(복도 격투 장면은 영화 역사상 최고의 원테이크 액션)이다. 2023년 기준 레딧에서 &quot;best revenge movie&quot;를 검색하면 올드보이가 거의 항상 1위로 언급된다. 유튜브 리액션 영상도 엔딩 반전에서 대부분 입을 손으로 가리며 &quot;Oh my God&quot;을 연발하는 패턴이다. 칸 영화제 심사위원대상 수상 당시 타란티노가 황금종려상을 주고 싶었다는 일화도 유명하다.</p>' },
    { type: 'h2', id: 'section2', text: '부산행 (2016) - 좀비 영화의 교과서', gradientStyle: 'linear-gradient(to right, #d32f2f, #b71c1c)' },
    { type: 'body', html: '<p>해외에서 &quot;Train to Busan&quot;은 거의 한국 영화의 대명사 수준이다. 레딧에서 &quot;best zombie movie&quot; 글이 올라오면 부산행은 무조건 TOP 3 안에 든다. 가장 인상적인 외국인 댓글은 &quot;I went in expecting a generic zombie movie and came out emotionally destroyed&quot;(그냥 좀비 영화인 줄 알았는데 감정적으로 파괴당했다)였다. 마동석이 문을 막는 장면, 공유의 마지막 장면에서 리액션 영상 거의 전원이 운다. 넷플릭스를 통해 전 세계 190개국에 공개된 이후 해외 팬층이 폭발적으로 늘었고, 할리우드 리메이크 프로젝트도 진행 중이다. 로튼토마토 94% 신선도를 기록 중이며, 관객 점수도 89%로 높다.</p>' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    { type: 'h2', id: 'section3', text: '아가씨 (2016) - "비주얼이 예술이다"', gradientStyle: 'linear-gradient(to right, #c62828, #ef5350)' },
    { type: 'body', html: '<p>박찬욱 감독의 &quot;아가씨&quot;는 해외에서 시각적 아름다움과 스토리텔링 모두 극찬받는 작품이다. 레딧에서 자주 보이는 반응은 &quot;Every single frame could be a painting&quot;(모든 프레임이 그림이 될 수 있다)이다. 칸 영화제에서 기립 박수를 받았고, BBC가 선정한 21세기 최고의 영화 100편에도 이름을 올렸다. 사라 워터스의 원작 소설을 일제강점기 한국으로 옮긴 각색도 &quot;원작보다 낫다&quot;는 평가를 해외에서 많이 받았다. 로튼토마토 96% 신선도에 메타크리틱 84점이라는 경이로운 점수를 기록 중이다. 특히 유럽 영화 팬들 사이에서 &quot;아시아 영화의 정수&quot;라는 평가가 많다.</p>' },
    { type: 'h2', id: 'section4', text: '살인의 추억 (2003) - 봉준호의 숨겨진 걸작', gradientStyle: 'linear-gradient(to right, #e53935, #ff8a80)' },
    { type: 'body', html: '<p>기생충 이후 봉준호 감독의 과거작을 찾아본 외국인들이 가장 놀라는 작품이 바로 &quot;살인의 추억&quot;이다. &quot;How is this not more famous internationally?&quot;(이 영화가 왜 국제적으로 더 유명하지 않지?)라는 반응이 대다수다. 특히 마지막 장면에서 송강호가 카메라를 바라보는 눈빛에 대해 &quot;The most haunting final shot in cinema history&quot;(영화 역사상 가장 소름 끼치는 마지막 장면)라는 평가가 반복적으로 등장한다. 실제 화성 연쇄 살인 사건의 범인이 2019년에 밝혀지면서 해외에서도 다시 화제가 됐고, 레딧에서 관련 글이 수만 개의 업보트를 받았다. 로튼토마토 95%를 기록 중이다.</p>' },
    { type: 'image', src: '/images/post32_img1.svg', alt: '한국 영화 해외 반응 댓글 모음', caption: '레딧과 유튜브에서 수집한 실제 반응들' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    { type: 'image', src: '/images/post32_poster.jpg', alt: '올드보이 공식 포스터 - 박찬욱 감독', caption: '출처: 네이버 영화' },
    { type: 'h2', id: 'section5', text: '곡성 (2016) - "뭘 본 건지 모르겠지만 대단하다"', gradientStyle: 'linear-gradient(to right, #880e4f, #ad1457)' },
    { type: 'body', html: '<p>나홍진 감독의 &quot;곡성&quot;은 해외 호러 팬들 사이에서 거의 신앙 수준으로 추앙받는 작품이다. 레딧 r/horror에서 &quot;best horror movie of the decade&quot; 글이 올라오면 곡성이 항상 언급된다. 가장 재밌는 외국인 반응은 &quot;I&apos;ve watched it 5 times and I still don&apos;t fully understand it, but that&apos;s what makes it a masterpiece&quot;(5번 봤는데 아직도 완전히 이해 못 하겠지만 그게 걸작인 이유다)였다. 국제 비평가들로부터 로튼토마토 99%라는 경이로운 점수를 받았고, 이는 한국 영화 역대 최고 수준이다. 특히 굿 장면에서 외국인들의 리액션이 백미인데, 문화적 맥락을 모르는 상태에서도 그 공포감을 체감한다는 점이 대단하다.</p>' },
    { type: 'h2', id: 'section6', text: '추격자, 신세계, 타짜까지 - 더 알려져야 할 작품들', gradientStyle: 'linear-gradient(to right, #e53935, #c62828)' },
    { type: 'body', html: '<p><strong>추격자 (2008)</strong>는 해외에서 &quot;가장 긴장감 넘치는 한국 스릴러&quot;로 자주 꼽힌다. &quot;I couldn&apos;t breathe for 2 hours&quot;(2시간 동안 숨을 못 쉬었다)라는 반응이 대표적이다. <strong>신세계 (2013)</strong>는 &quot;한국판 인필트레이티드&quot;라는 평가와 함께 이정재, 최민식, 황정민 세 배우의 연기를 극찬하는 댓글이 주를 이룬다. 특히 &quot;The acting trio is the best I&apos;ve ever seen in any crime movie&quot;라는 반응이 인상적이었다. <strong>타짜 (2006)</strong>는 넷플릭스를 통해 뒤늦게 해외에 알려졌는데, &quot;도박 영화의 새로운 기준&quot;이라는 평가가 많다. 이 세 작품 모두 한국 영화의 저력을 보여주는 작품들이고, 해외 한국 영화 팬덤에서 필수 시청 목록으로 꼽히고 있다.</p>' },
    { type: 'ending', html: '<p>한국 영화에 대한 해외 반응을 보면서 느끼는 건, 우리가 당연하게 여기는 작품들이 외국인에게는 &quot;인생 영화&quot;가 된다는 거다. 봉준호 감독이 아카데미에서 말한 &quot;1인치의 자막 장벽&quot;이 정말 허물어지고 있다는 게 실감난다. 앞으로도 해외 반응 모음은 계속 업데이트할 예정이니 관심 있으면 북마크 해두길 바란다!</p>' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
  ]
}
module.exports = post
