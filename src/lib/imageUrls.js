/**
 * Utility module for generating optimal Wikimedia Commons image URLs
 */

/**
 * Get the highest resolution (original) URL from a Wikimedia thumb URL.
 * e.g. converts .../thumb/7/7d/File.jpg/1280px-File.jpg → .../commons/7/7d/File.jpg
 */
export function getOriginalUrl(thumbUrl) {
  if (!thumbUrl || typeof thumbUrl !== 'string') return thumbUrl;
  
  // Check if it's a Wikimedia thumb URL
  const wikimediaCommonsRegex = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(.+?)\/(.+?)\/(?:.+)$/i;
  
  const match = thumbUrl.match(wikimediaCommonsRegex);
  if (match) {
    const [, baseUrl, hash, filename] = match;
    return `${baseUrl}/${hash}/${filename}`;
  }
  
  return thumbUrl;
}

/**
 * Get a specific width thumbnail URL.
 * e.g. getThumbUrl(url, 1920) → .../thumb/7/7d/File.jpg/1920px-File.jpg
 */
export function getThumbUrl(url, width) {
  if (!url || typeof url !== 'string' || !width) return url;
  
  const originalUrl = getOriginalUrl(url);
  if (originalUrl === url) {
    // If it's not a recognizable thumb URL but happens to be an original URL:
    const originalRegex = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(.+?)\/(.+)$/i;
    const match = originalUrl.match(originalRegex);
    if (match) {
      const [, baseUrl, hash, filename] = match;
      return `${baseUrl}/thumb/${hash}/${filename}/${width}px-${filename}`;
    }
    return url;
  }
  
  // From original back to thumb
  const originalRegex = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(.+?)\/(.+)$/i;
  const match = originalUrl.match(originalRegex);
  if (match) {
    const [, baseUrl, hash, filename] = match;
    return `${baseUrl}/thumb/${hash}/${filename}/${width}px-${filename}`;
  }
  
  return originalUrl;
}

/**
 * Generate a srcSet string for responsive images.
 * Returns '...800w, ...1280w, ...1920w'
 */
export function getSrcSet(url) {
  if (!url || typeof url !== 'string') return '';
  const sizes = [400, 640, 800, 1024, 1280, 1920];
  return sizes.map(w => `${getThumbUrl(url, w)} ${w}w`).join(', ');
}

/**
 * Get an optimal URL for a preview card (small size).
 * Returns 640px width thumbnail.
 */
export function getPreviewUrl(url) {
  return getThumbUrl(url, 640);
}

/**
 * Get an optimal URL for a detail hero (large size).
 * Returns 1920px width thumbnail.
 */
export function getHeroUrl(url) {
  return getThumbUrl(url, 1920);
}
