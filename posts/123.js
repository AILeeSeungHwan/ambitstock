const post = {
  id: 123,
  sections: [
    {
      type: 'intro',
      html: '<p>하얼빈 박스오피스 1위 천만영화 되나 - 스포 포함 평론가 로튼 토마토 해외 반응 결말 후기</p>'
    },
    {
      type: 'image',
      src: '/images/post123_thumb.svg',
      alt: '하얼빈 박스오피스 1위 천만영화 되나 - 스포 포함 평론가 로튼 토마토 해외 반응 결말 후기',
      caption: '하얼빈 박스오피스 1위 천만영화 되나 - 스포 포함 평론가 로튼 토마토 해외 반응 결말 후기'
    },
    { type: 'toc' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    {
      type: 'h2',
      id: 'section1',
      text: '영화 하얼빈 예매 순위 압도적 1위! 결말 후기 로튼 토마토 평점',
      gradientStyle: 'linear-gradient(to right, #e50914, #ff6b6b)'
    },
    {
      type: 'body',
      html: '<p>영화 하얼빈이 박스오피스 1위를 기록하고 있습니다. 개봉 후 엄청난 기세로 관객수를 올리고 있으며 천만영화까지도 노려볼 것으로 예상됩니다. 이번 포스팅에서 하얼빈의 해외 평가와 평점, 그리고 평론가 후기를 함께 살펴보도록 하겠습니다.</p>'
    },
    { type: 'image', src: '/images/post123_img1.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    {
      type: 'h2',
      id: 'section2',
      text: '하얼빈로튼 토마토 평론가 평점',
      gradientStyle: 'linear-gradient(to right, #1a73e8, #42a5f5)'
    },
    {
      type: 'body',
      html: '<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #f3c000;&quot;><b>하얼빈 로튼 토마토 평론가 평점입니다.</b></span><span style=&quot;background-color: #f3c000;&quot;></span></p>'
    },
    { type: 'image', src: '/images/post123_img2.jpg', alt: '하얼빈 평점', caption: 'ⓒ R의 필름공장' },
    {
      type: 'body',
      html: '<p><span style=&quot;background-color: #9feec3;&quot;><b>현재 평론가 관객 평점은 측정되지 않았지만 5개의 평론가 후기를 확인할 수 있습니다.</b></span></p>'
    },
    {
      type: 'body',
      html: '<p><b>IMDB의 평점은 8.2점, 인기순위는 4,489위</b>로 해외에서의 인지도는 그다지 높지 않은 상황입니다.</p>'
    },
    {
      type: 'body',
      html: '<p>하지만 평점은 상당히 높은 점수로, 의미있는 기록을 세우고 있음을 알 수 있습니다.</p>'
    },
    {
      type: 'body',
      html: '<p>그렇다면 평론가 후기 어떠한지 알아보도록 하겠습니다.</p>'
    },
    {
      type: 'h2',
      id: 'section3',
      text: '하얼빈 평론가 결말후기 관람평',
      gradientStyle: 'linear-gradient(to right, #6a1b9a, #ab47bc)'
    },
    {
      type: 'body',
      html: '<p><span style=&quot;background-color: #f3c000;&quot;><b>하얼빈 평론가 결말후기 관람평입니다.</b></span></p>'
    },
    { type: 'image', src: '/images/post123_img3.jpg', alt: '하얼빈 평점', caption: 'ⓒ R의 필름공장' },
    {
      type: 'body',
      html: '<blockquote><span style=&quot;color: #781b33;&quot;><b><span style=&quot;font-family: \'Noto Serif KR\';&quot;> 긴장감 넘치는 이야기를 <br>다소 텅 비어있는 느낌으로 만든 전개</br></span></b></span></blockquote>'
    },
    {
      type: 'body',
      html: '<p><b>Siddhant Adlakha - 평점 없음</b><br>비주얼적으로 인상적인 시대극이다. 클라이맥스로 향하는 과정에서 우는 미스터리 요소를 도입해 이야기를 계속 흥미롭게 만든다. 때로는 충분한 힘이 부족할 수 있지만, 그럼에도 불구하고 이야기는 계속해서 진행된다.</br></p>'
    },
    {
      type: 'body',
      html: '<p><b>Sarah Musnicky - 평점 6.5/10</b><br/>우민호는 이야기의 전개를 우선시하며 이 영감을 주는 긴장감 넘치는 이야기를 다소 텅 비어있는 느낌으로 만든다. 그럼에도 불구하고, 이 점을 제외하면 &quot;하얼빈&quot;은 충분히 능숙하고 스릴 넘치는 영화이다.</p>'
    },
    {
      type: 'body',
      html: '<blockquote><span style=&quot;color: #781b33;&quot;><b><span style=&quot;font-family: \'Noto Serif KR\';&quot;>국가 영웅 이야기에 대한 존경심은 인정<br/></span>얕은 스토리가 매력을 해쳤다.</b></span></blockquote>'
    },
    {
      type: 'body',
      html: '<p><b>Sarah Marrs - 평점 없음</b><br/>국가의 영웅 이야기를 어느 정도 존경심을 담아 전하는 것은 이해할 수 있지만, &quot;하얼빈&quot;의 얕은 면이 흥미로운 스파이 스릴러의 매력을 해친다.</p>'
    },
    {
      type: 'cta',
      href: '/movie-audience-top10-2/',
      text: '현재상영작 영화 예매 순위 관객수 2025년 1월 TOP10'
    },
    {
      type: 'body',
      html: '<blockquote><span style=&quot;color: #781b33;&quot;><b><span style=&quot;font-family: \'Noto Serif KR\';&quot;>아릅답게 구성된 액션 장면</span></b></span></blockquote>'
    },
    {
      type: 'body',
      html: '<p><b>Robert Daniels - 평점 없음</b><br/>&quot;하얼빈&quot;은 기억에 남는 캐릭터가 부족하지만, 연출과 기술 면에서는 그 부족함을 충분히 채운다. 액션 장면은 아름답게 구성되어 있다.</p>'
    },
    {
      type: 'body',
      html: '<p><b>Giovanni Lago - 평점 6/10</b><br/>&quot;영화 하얼빈&quot;은 그 주제 자체가 매우 흥미로워서 <b>그저 이렇게 반쯤 재미있는 스파이 영화로 끝나는 것이 아쉽다.</b></p>'
    },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    {
      type: 'h2',
      id: 'section4',
      text: '스포포함 하얼빈 영화 결말',
      gradientStyle: 'linear-gradient(to right, #e53935, #ef5350)'
    },
    {
      type: 'body',
      html: '<h3>하얼빈역 이토 히로부미 암살</h3>'
    },
    { type: 'image', src: '/images/post123_img8.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    { type: 'image', src: '/images/post123_img7.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    { type: 'image', src: '/images/post123_img6.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    { type: 'image', src: '/images/post123_img5.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    { type: 'image', src: '/images/post123_img4.jpg', alt: '하얼빈', caption: 'ⓒ R의 필름공장' },
    {
      type: 'body',
      html: '<p>영화의 클라이맥스는 1909년 10월 26일, 하얼빈역에서 일본 제국의 초대 조선 통감인 이토 히로부미를 저격하는 장면입니다. 안중근 의사는 동지들과 치밀하게 계획을 세운 끝에, 하얼빈역에서 이토를 암살하는 데 성공합니다. 그는 현장에서 체포되지만, 자신의 행동이 그저 테러가 아니라 조국의 독립을 위한 정당한 항거였음을 전 세계에 알리기 위해 재판에서 담담히 자신의 신념을 밝힙니다.</p>'
    },
    {
      type: 'body',
      html: '<h3>형장의 이슬로 사라진 안중근 의사</h3>'
    },
    {
      type: 'body',
      html: '<p>결국, 안중근 의사는 일본 법정에서 사형을 선고받고 형장의 이슬로 사라지지만, 그의 행동과 신념은 한국 독립운동의 상징으로 남게 됩니다. 영화는 안중근 의사가 남긴 유언과 그가 작성한 \'동양평화론\'의 일부를 비추며 끝이 납니다. 안중근 개인의 복수가 아닌, 더 큰 이상과 평화를 위한 것이었음을 강조합니다.</p>'
    },
    {
      type: 'h2',
      id: 'section5',
      text: '함께 보면 좋은 콘텐츠',
      gradientStyle: 'linear-gradient(to right, #00897b, #26a69a)'
    },
    {
      type: 'ending',
      html: '<p><b>더 많은 포스팅을 통해 볼만한 영화를 찾아보세요.</b></p>'
    },
    {
      type: 'cta',
      href: '/movie-recommend-overseas-critic-rating-guide/',
      text: '크리스토퍼 놀란 영화 추천 | 모든 작품 로튼 토마토 평점 인기 순위 총정리!'
    },
    {
      type: 'cta',
      href: '/critic-recommend-masterpiece-movie-top-10/',
      text: '이동진 평론가가 추천하는 별 다섯개 명작! 볼만한 영화 추천 TOP 10'
    },
    {
      type: 'cta',
      href: '/movie-recommend-critic-masterpiece/',
      text: '박평식 평론가 평점 9점! 2024년에도 진한 명작 영화 추천 순위 Top 10'
    },
    {
      type: 'cta',
      href: '/marvel-movie-release-upcoming/',
      text: '마블 영화 개봉 예정 총 정리 2025년 - 2027년'
    },
    {
      type: 'cta',
      href: '/series-recommend-rating-top-8/',
      text: '해리포터 시리즈 인기 순위 순서 추천 평점 TOP 8'
    },
    { type: 'ad', slot: '6297515693', format: 'auto' },
  ]
}

module.exports = post
