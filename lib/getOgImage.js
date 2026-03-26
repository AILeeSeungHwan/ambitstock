/**
 * getOgImage — resolve the best og:image for a post
 *
 * Priority:
 *  1. meta.thumbnail if it is a real raster image (jpg/png/webp)
 *  2. First image section in the post body that is a real image
 *  3. meta.thumbnail even if it is SVG (better than nothing)
 *  4. Category-based default og image
 */

const CATEGORY_DEFAULTS = {
  '영화추천': '/images/og-default-movie.svg',
  '해외반응후기': '/images/og-default-reaction.svg',
  '마블': '/images/og-default-marvel.svg',
  '드라마': '/images/og-default-drama.svg',
  '애니메이션': '/images/og-default-anime.svg',
}

const FALLBACK = '/images/og-default.svg'

function isRealImage(src) {
  if (!src || typeof src !== 'string') return false
  var lower = src.toLowerCase()
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')
}

function getOgImage(meta, postData) {
  // 1. meta.thumbnail is a real raster image
  if (meta.thumbnail && isRealImage(meta.thumbnail)) {
    return meta.thumbnail
  }

  // 2. First image section in the post that is a real image
  if (postData && postData.sections) {
    var sections = Array.isArray(postData.sections) ? postData.sections : []
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i]
      if (s && s.type === 'image' && isRealImage(s.src)) {
        return s.src
      }
    }
  }

  // 3. meta.thumbnail exists but is SVG — still usable
  if (meta.thumbnail) {
    return meta.thumbnail
  }

  // 4. Category-based default
  return CATEGORY_DEFAULTS[meta.category] || FALLBACK
}

module.exports = getOgImage
