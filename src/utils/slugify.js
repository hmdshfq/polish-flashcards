/**
 * Convert text to URL-friendly slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
