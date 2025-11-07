/**
 * Format next review date in human-readable format
 * @param {string|Date|Timestamp} dateString - ISO string, Date object, or Firestore Timestamp
 * @returns {string} Human-readable format like "in 3 days", "tomorrow", "in 1 week"
 */
export function formatNextReview(dateString) {
  if (!dateString) return '';

  let reviewDate;
  if (typeof dateString === 'string') {
    reviewDate = new Date(dateString);
  } else if (typeof dateString === 'object' && typeof dateString.toDate === 'function') {
    // Firestore Timestamp
    reviewDate = dateString.toDate();
  } else {
    reviewDate = dateString;
  }
  const now = new Date();

  // Normalize times to start of day for consistent comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());

  // Calculate days difference
  const diffMs = reviewDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Review today';
  } else if (diffDays === 1) {
    return 'Review tomorrow';
  } else if (diffDays < 0) {
    return 'Overdue for review';
  } else if (diffDays <= 7) {
    return `Review in ${diffDays} days`;
  } else if (diffDays <= 30) {
    const weeks = Math.ceil(diffDays / 7);
    return `Review in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.ceil(diffDays / 30);
    return `Review in ${months} month${months > 1 ? 's' : ''}`;
  }
}

/**
 * Calculate days since last review
 * @param {string|Date|Timestamp} dateString - ISO string, Date object, or Firestore Timestamp
 * @returns {number} Number of days since the date
 */
export function daysSinceReview(dateString) {
  if (!dateString) return null;

  let reviewDate;
  if (typeof dateString === 'string') {
    reviewDate = new Date(dateString);
  } else if (typeof dateString === 'object' && typeof dateString.toDate === 'function') {
    // Firestore Timestamp
    reviewDate = dateString.toDate();
  } else {
    reviewDate = dateString;
  }
  const now = new Date();

  // Normalize times to start of day
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());

  const diffMs = today.getTime() - reviewDay.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
