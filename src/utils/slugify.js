/**
 * Convert text to URL-friendly slug
 * Matches the slug format used in Supabase migrations
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
