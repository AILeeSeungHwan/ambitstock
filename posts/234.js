const post = {
  id: 234,
  sections: [
    { type: 'intro', html: "<p><span style=&quot;background-color: #9feec3;&quot;><b>영화 어프렌티스 해외 평점 평론가 반응 인기 순위입니다.</b></span></p><p style=&quot;color: inherit; text-align: start;&quot;>1970년-1980년 트럼프의 뉴욕 부동산 경력을 다룬 영화로, 미국 대선을 앞둔 트럼프에게 민감한 내용을 주제로 담은 영화입니다.</p><p style=&quot;color: inherit; text-align: start;&quot;>로튼 토마토에서 굉장히 긍정적인 반응을 이끌고 있는 영화 어프렌티스.</p>" },
    { type: 'toc' },
    { type: 'ad', slot: '6297515693', format: 'auto' },
    { type: 'h2', id: 'section1', text: '어프렌티스 로튼토마토 평점', gradientStyle: 'linear-gradient(to right, #e50914, #ff6b6b)' },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>과연 해외 평론가 평점 반응은 어떠할 지, 영화관에서 볼만한 영화일지 확인해보도록 하겠습니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #9feec3;&quot;><b>영화 로튼토마토 평론가 관객 평점입니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #9feec3;&quot;><b>평론가 평점 80%, 관객 평점 85%의 영화 어프렌티스 평점입니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>최근 개봉한 영화들의 평점을 보면 평론가 평점과 관객평점이 갈리는 경우가 허다하였습니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>오랜만에 둘 사이의 간극을 줄인 영화가 나왔습니다. 평론가, 관객 평점 모두 80점을 넘기며, 평론가 평점은 무려 182명 중 80%에 신선도 보증마크까지 획득한 모습입니다.</p>" },
    { type: 'image', src: "/images/post234_img1.jpg", alt: "어프렌티스", caption: "ⓒ R의 필름공장" },
    { type: 'h2', id: 'section2', text: 'IMDB 평점 및 인기 순위', gradientStyle: 'linear-gradient(to right, #1a73e8, #42a5f5)' },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #9feec3;&quot;><b>영화 어프렌티스 인기 순위 및 평점입니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #f3c000;&quot;><b>IMDB 평점은 7.0점, 인기순위는 21위입니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>상대적으로 로튼 토마토보다 낮은 평점을 기록하고 있습니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>이러한 경우엔 평점분포를 보면 왜 이러한 결과가 나왔는지 확실하게 알 수 있습니다.</p>" },
    { type: 'image', src: "/images/post234_img3.jpg", alt: "어프렌티스 평점 인기 순위", caption: "ⓒ R의 필름공장" },
    { type: 'h2', id: 'section3', text: '평점 분포와 정치적 반응', gradientStyle: 'linear-gradient(to right, #6a1b9a, #ab47bc)' },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #9feec3;&quot;><b>영화 어프렌티스 평점 분포 살펴보겠습니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #f3c000;&quot;><b>총 표본 수는 4천 500개 이상이며, 전체적으로 높은 평점대를 형성하고 있음을 알 수 있습니다.</b></span></p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>평점표본 국가는 미국 영국 프랑스 스웨덴 독일 순입니다. 역시나 자국 대통령과 관련된 영화이기에 미국 국가표본이 가장 많은 모습입니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>특이한 점은 1점 평점이 무려 792개나 있다는 점입니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;><span style=&quot;background-color: #f3c000;&quot;><b>트럼프 지지층 혹은 반대파들의 평점테러가 이루어졌음을 알 수 있고, 이에 대해서 리뷰에서도 확인이 가능합니다.</b></span></p>" },
    { type: 'image', src: "/images/post234_img4.jpg", alt: "어프렌티스 평점분포", caption: "ⓒ R의 필름공장" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>그렇다면 도대체 어떠한 부분이 평론가들 호평을, 관객들의 긍정적 반응과 비난과 평점테러를 이끌었을까요.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>거물인가, 거인인가. 다음 포스팅에서 어프렌티스 해외 시청자 후기반응 리뷰 살펴보겠습니다.</p>" },
    { type: 'body', html: "<p style=&quot;color: inherit; text-align: start;&quot;>감사합니다.</p>" },
    { type: 'body', html: "<p><b>더 많은 포스팅을 통해 볼만한 영화 드라마를 찾아보세요.</b></p>" },
    { type: 'body', html: "<p style=&quot;text-align: center;&quot;><span style=&quot;color: #781b33;&quot;><b>넷플릭스 영화 추천 2024년 9월 인기 작품 순위 TOP 10</b></span></p>" },
    { type: 'body', html: "<p style=&quot;text-align: center;&quot;><span style=&quot;color: #781b33;&quot;><b>넷플릭스 볼만한 드라마 추천 오리지널 해외 반응 2024년 하반기 순위 TOP 7</b></span></p>" },
    { type: 'ending', html: "<p style=&quot;text-align: center;&quot;><span style=&quot;color: #781b33;&quot;><b>크리스토퍼 놀란 영화 모든 작품 평점 순 영화 추천</b></span></p>" },
    { type: 'ad', slot: '6297515693', format: 'auto' }
  ]
}

module.exports = post
