/**
 * Utility module for generating optimal Wikimedia Commons image URLs.
 *
 * Wikimedia thumb URL structure:
 *   https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{Filename.ext}/{W}px-{Filename.ext}
 *
 * Wikimedia original URL structure:
 *   https://upload.wikimedia.org/wikipedia/commons/{a}/{ab}/{Filename.ext}
 */

const COMMONS_THUMB = "upload.wikimedia.org/wikipedia/commons/thumb/";
const COMMONS_BASE  = "upload.wikimedia.org/wikipedia/commons/";

/**
 * Detect if a URL is a Wikimedia Commons thumb URL.
 */
function isWikimediaThumb(url) {
  return typeof url === "string" && url.includes(COMMONS_THUMB);
}

/**
 * Get the highest resolution (original) URL from a Wikimedia thumb URL.
 * .../thumb/7/7d/File.jpg/1280px-File.jpg  →  .../commons/7/7d/File.jpg
 */
export function getOriginalUrl(thumbUrl) {
  if (!thumbUrl || !isWikimediaThumb(thumbUrl)) return thumbUrl;

  // Split at /thumb/ — left is the commons base, right is  {a}/{ab}/{File}/{Wpx-File}
  const idx = thumbUrl.indexOf("/thumb/");
  const base = thumbUrl.slice(0, idx);          // https://upload.wikimedia.org/wikipedia/commons
  const rest = thumbUrl.slice(idx + 7);          // 7/7d/File.jpg/1280px-File.jpg

  // Drop the LAST segment (the "1280px-File.jpg" part) to get "7/7d/File.jpg"
  const lastSlash = rest.lastIndexOf("/");
  if (lastSlash === -1) return thumbUrl;         // malformed, bail out
  const pathWithoutThumb = rest.slice(0, lastSlash); // 7/7d/File.jpg

  return `${base}/${pathWithoutThumb}`;
}

/**
 * Get a specific width thumbnail URL.
 * Accepts either a thumb URL or an original URL.
 *
 * getThumbUrl(".../thumb/7/7d/File.jpg/1280px-File.jpg", 800)
 *   → .../thumb/7/7d/File.jpg/800px-File.jpg
 */
export function getThumbUrl(url, width) {
  if (!url || typeof url !== "string" || !width) return url;

  /* ── Already a thumb URL ───────────────────────────────── */
  if (isWikimediaThumb(url)) {
    // Replace the last path segment with the new width
    const lastSlash = url.lastIndexOf("/");
    if (lastSlash === -1) return url;

    const basePath = url.slice(0, lastSlash); // .../thumb/7/7d/File.jpg

    // Extract the real filename (second-to-last segment)
    const secondLastSlash = basePath.lastIndexOf("/");
    const filename = basePath.slice(secondLastSlash + 1); // File.jpg

    return `${basePath}/${width}px-${filename}`;
  }

  /* ── Original (non-thumb) URL ─────────────────────────── */
  if (url.includes(COMMONS_BASE)) {
    const idx = url.indexOf(COMMONS_BASE);
    const base = url.slice(0, idx + COMMONS_BASE.length - 1); // .../commons
    const hashAndFile = url.slice(idx + COMMONS_BASE.length);  // 7/7d/File.jpg

    // Extract filename (last segment)
    const lastSlash = hashAndFile.lastIndexOf("/");
    const filename = lastSlash === -1 ? hashAndFile : hashAndFile.slice(lastSlash + 1);

    return `${base}/thumb/${hashAndFile}/${width}px-${filename}`;
  }

  // Not a Wikimedia URL, return as-is
  return url;
}

/**
 * Generate a srcSet string for responsive images.
 * Only includes sizes ≤ 1280 to avoid 404s when originals are small.
 */
export function getSrcSet(url) {
  if (!url || typeof url !== "string") return "";
  const sizes = [400, 640, 800, 1280];
  return sizes.map((w) => `${getThumbUrl(url, w)} ${w}w`).join(", ");
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
 * Returns 1280px width thumbnail (safe — known to exist from the data).
 */
export function getHeroUrl(url) {
  return getThumbUrl(url, 1280);
}
