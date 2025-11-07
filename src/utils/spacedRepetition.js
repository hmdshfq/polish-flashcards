/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Implementation of the SM-2 algorithm for scheduling flashcard reviews.
 * Reference: https://www.supermemo.com/en/archives1990-2015/article/smalgorithm
 *
 * Quality scale:
 *   0 - complete blackout, wrong answer in all respects
 *   1 - blackout, correct answer after a long period of hesitation
 *   2 - blackout, correct answer after some thought
 *   3 - dark, correct answer with serious difficulty
 *   4 - correct answer after some difficulty
 *   5 - perfect response
 */

const QUALITY_THRESHOLD = 3; // Minimum quality to continue interval growth

/**
 * Calculate the next review date using SM-2 algorithm
 *
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} repetition - Number of repetitions (1-based)
 * @param {number} quality - Quality rating (0-5)
 * @param {Date} [lastReviewDate] - Date of last review (defaults to now)
 * @returns {string} ISO string of next review date
 */
export function calculateNextReview(easeFactor = 2.5, repetition = 1, quality = 3, lastReviewDate = new Date()) {
  let interval = 1; // days

  // If quality < 3, reset the card and review soon (within 10 minutes)
  if (quality < QUALITY_THRESHOLD) {
    const nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
    return nextReviewDate.toISOString();
  }

  // SM-2 algorithm intervals with quality-based adjustments
  if (repetition === 1) {
    // First review: vary interval based on quality
    // quality 3 (Hard): 1 day
    // quality 4 (Good): 3 days
    // quality 5 (Easy): 7 days
    if (quality === 5) {
      interval = 7;
    } else if (quality === 4) {
      interval = 3;
    } else {
      interval = 1;
    }
  } else if (repetition === 2) {
    // Second review: vary based on quality
    // quality 3 (Hard): 3 days
    // quality 4 (Good): 7 days
    // quality 5 (Easy): 14 days
    if (quality === 5) {
      interval = 14;
    } else if (quality === 4) {
      interval = 7;
    } else {
      interval = 3;
    }
  } else {
    // I(n) = I(n-1) * EF
    // For later reviews, use the standard SM-2 formula
    interval = Math.ceil(3 * Math.pow(easeFactor, repetition - 2));
  }

  const nextReviewDate = new Date(lastReviewDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return nextReviewDate.toISOString();
}

/**
 * Calculate new ease factor using SM-2 formula
 *
 * @param {number} currentEaseFactor - Current ease factor
 * @param {number} quality - Quality of response (0-5)
 * @returns {number} New ease factor (minimum 1.3)
 */
export function calculateNewEaseFactor(currentEaseFactor, quality) {
  const newEF = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(1.3, newEF);
}

/**
 * Get human-readable text for review interval
 *
 * @param {Date} nextReviewDate - Next review date
 * @returns {string} Human-readable interval text
 */
export function getReviewIntervalText(nextReviewDate) {
  const now = new Date();
  const next = new Date(nextReviewDate);

  const diffMs = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Due for review';
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return `In ${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `In ${months} month${months > 1 ? 's' : ''}`;
  }
}

/**
 * Determine if a flashcard is due for review
 *
 * @param {string|Date} nextReviewDate - Next review date
 * @returns {boolean} True if due for review
 */
export function isDueForReview(nextReviewDate) {
  if (!nextReviewDate) return true; // Never reviewed = due
  const now = new Date();
  const next = new Date(nextReviewDate);
  return next <= now;
}

/**
 * Get quality rating based on user response
 * Helper to convert user answer correctness to SM-2 quality scale
 *
 * @param {boolean} isCorrect - Was the answer correct?
 * @param {number} confidenceLevel - 1-5 confidence (5 = highest)
 * @returns {number} Quality score 0-5
 */
export function getQualityFromResponse(isCorrect, confidenceLevel = 5) {
  if (!isCorrect) {
    return 1; // Blackout, they got it wrong
  }

  // Map confidence to quality
  const confidenceToQuality = {
    1: 2, // Very unsure but correct
    2: 3, // Unsure but correct
    3: 4, // Somewhat sure
    4: 4, // Sure
    5: 5  // Very sure
  };

  return confidenceToQuality[confidenceLevel] || 3;
}

/**
 * Get cards due for review from a collection
 *
 * @param {Array} cards - Array of cards with user_progress
 * @returns {Array} Cards that are due for review
 */
export function getCardsDueForReview(cards) {
  return cards.filter(card => {
    if (!card.user_progress) return true; // Never reviewed
    return isDueForReview(card.user_progress.next_review_at);
  });
}

/**
 * Get learning stats from progress data
 *
 * @param {Object} progressMap - Map of flashcard_id -> progress
 * @param {number} totalCards - Total cards in collection
 * @returns {Object} Stats object
 */
export function getProgressStats(progressMap, totalCards) {
  const stats = {
    totalCards,
    reviewed: 0,
    dueForReview: 0,
    learned: 0,
    learning: 0,
    newCards: totalCards,
    averageEaseFactor: 2.5,
    totalReviews: 0
  };

  if (!progressMap || Object.keys(progressMap).length === 0) {
    return stats;
  }

  let totalEaseFactor = 0;
  let easeFactorCount = 0;

  for (const progress of Object.values(progressMap)) {
    if (!progress) continue;

    stats.reviewed++;
    stats.newCards--;
    stats.totalReviews += progress.review_count || 1;

    if (isDueForReview(progress.next_review_at)) {
      stats.dueForReview++;
    }

    // Learned: reviewed 5+ times with ease factor > 2.5
    if ((progress.review_count || 1) >= 5 && progress.ease_factor > 2.5) {
      stats.learned++;
    } else if ((progress.review_count || 1) >= 1) {
      stats.learning++;
    }

    totalEaseFactor += progress.ease_factor || 2.5;
    easeFactorCount++;
  }

  stats.averageEaseFactor = easeFactorCount > 0 ? totalEaseFactor / easeFactorCount : 2.5;

  return stats;
}
