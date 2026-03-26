const topics = [
  { slug: 'ending-explained', title: '결말 해석 모음', description: '영화·드라마의 결말을 깊이 해석합니다. 복선, 숨겨진 의미, 감독의 의도까지.', icon: '🧠', filter: { contentType: '해석' } },
  { slug: 'overseas-reaction', title: '해외반응 모음', description: '해외 평론가와 관객들의 실제 반응. 로튼토마토, IMDB, 해외 커뮤니티 반응을 정리합니다.', icon: '🌍', filter: { contentType: '해외반응' } },
  { slug: 'movie-recommend', title: '영화 추천', description: '취향별, 상황별, OTT별 영화 추천. 지금 볼 영화를 골라드립니다.', icon: '⭐', filter: { contentType: '추천', category: '영화추천' } },
  { slug: 'drama-guide', title: '드라마 가이드', description: 'K드라마부터 해외 시리즈까지. 시청순서, 핵심 정리, 시즌별 가이드.', icon: '📺', filter: { category: '드라마' } },
  { slug: 'anime-pick', title: '애니메이션 추천', description: '극장판부터 TV 시리즈까지. 명작 애니, 신작 정보, 해외 평가를 다룹니다.', icon: '🎨', filter: { category: '애니메이션' } },
  { slug: 'box-office-analysis', title: '흥행 분석', description: '박스오피스 기록, 관객수 추이, 역대 순위 분석.', icon: '📊', filter: { contentType: '분석' } },
  { slug: 'marvel-universe', title: '마블 유니버스', description: 'MCU 시리즈, 디즈니+ 마블 드라마, 개봉 예정작까지.', icon: '🦸', filter: { category: '마블' } },
  { slug: 'netflix-picks', title: '넷플릭스 추천', description: '넷플릭스에서 지금 볼 수 있는 영화·드라마·시리즈 추천.', icon: '🔴', filter: { platform: '넷플릭스' } },
  { slug: 'theater-now', title: '현재 상영작', description: '지금 극장에서 볼 수 있는 영화. 평점, 관람평, 예매 정보.', icon: '🎬', filter: { platform: '극장' } },
]
module.exports = topics
