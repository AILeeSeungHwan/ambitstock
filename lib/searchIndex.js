/**
 * searchIndex.js — 포스트 데이터에서 Fuse.js용 경량 검색 인덱스를 생성한다.
 */
const getPostUrl = require('./getPostUrl')

/**
 * posts 배열을 받아서 검색에 필요한 필드만 추출한 경량 객체 배열을 반환한다.
 * @param {Array} posts - data/posts.js의 posts 배열
 * @returns {Array} Fuse.js에 넘길 수 있는 검색용 문서 배열
 */
function buildSearchIndex(posts) {
  return posts.map(function (post) {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title || '',
      description: post.description || '',
      category: post.category || '',
      tags: Array.isArray(post.tags) ? post.tags.join(' ') : '',
      date: post.date || '',
      thumbnail: post.thumbnail || '',
      url: getPostUrl(post),
    }
  })
}

module.exports = buildSearchIndex
