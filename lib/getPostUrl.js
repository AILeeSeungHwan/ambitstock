/**
 * 포스트의 URL 경로를 반환한다.
 * - tistorySlug가 있는 포스트 (이관된 티스토리 포스팅): /entry/{tistorySlug}/
 * - 그 외 (신규 포스팅): /{slug}/
 */
function getPostUrl(post) {
  if (post.tistorySlug) {
    return '/entry/' + post.tistorySlug + '/'
  }
  return '/' + post.slug + '/'
}

module.exports = getPostUrl
