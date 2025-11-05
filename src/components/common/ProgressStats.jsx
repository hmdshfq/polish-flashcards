import { useMemo } from 'react';
import './ProgressStats.css';

/**
 * ProgressStats Component
 * Displays learning metrics for the current practice session
 *
 * Props:
 * - cards: Array of flashcards in current set
 * - progress: Object mapping flashcard_id to progress data
 * - loading: Boolean indicating if progress is loading
 */
function ProgressStats({ cards, progress, loading }) {
  const stats = useMemo(() => {
    if (loading || !progress || !cards || cards.length === 0) {
      return {
        totalCards: cards?.length || 0,
        reviewed: 0,
        dueForReview: 0,
        averageEaseFactor: 0,
        masteredCount: 0,
        reviewPercentage: 0
      };
    }

    const now = new Date();
    let reviewed = 0;
    let dueForReview = 0;
    let totalEaseFactor = 0;
    let masteredCount = 0;

    // Iterate through cards and check their progress
    for (const card of cards) {
      const cardProgress = progress[card.id];

      if (cardProgress) {
        // Card has been reviewed at least once
        reviewed += 1;

        // Check if card is due for review
        const nextReviewDate = new Date(cardProgress.next_review_at);
        if (nextReviewDate <= now) {
          dueForReview += 1;
        }

        // Accumulate ease factor
        totalEaseFactor += cardProgress.ease_factor || 2.5;

        // Check if mastered (high ease factor indicates mastery)
        if (cardProgress.ease_factor >= 3.5 && cardProgress.review_count >= 3) {
          masteredCount += 1;
        }
      }
    }

    const averageEaseFactor = reviewed > 0 ? (totalEaseFactor / reviewed).toFixed(2) : 0;
    const reviewPercentage = cards.length > 0 ? Math.round((reviewed / cards.length) * 100) : 0;

    return {
      totalCards: cards.length,
      reviewed,
      dueForReview,
      averageEaseFactor: parseFloat(averageEaseFactor),
      masteredCount,
      reviewPercentage
    };
  }, [cards, progress, loading]);

  if (loading) {
    return (
      <div className="progress-stats" aria-label="Loading progress statistics">
        <div className="progress-stats__skeleton" />
      </div>
    );
  }

  return (
    <div className="progress-stats" aria-label="Learning progress statistics">
      <div className="progress-stats__grid">
        {/* Total Cards */}
        <div className="progress-stats__item">
          <div className="progress-stats__value">{stats.totalCards}</div>
          <div className="progress-stats__label">Total Cards</div>
        </div>

        {/* Cards Reviewed */}
        <div className="progress-stats__item">
          <div className="progress-stats__value">
            {stats.reviewed}
            <span className="progress-stats__percentage">({stats.reviewPercentage}%)</span>
          </div>
          <div className="progress-stats__label">Reviewed</div>
        </div>

        {/* Due for Review */}
        <div className="progress-stats__item progress-stats__item--due">
          <div className="progress-stats__value">{stats.dueForReview}</div>
          <div className="progress-stats__label">Due for Review</div>
        </div>

        {/* Average Ease Factor */}
        <div className="progress-stats__item">
          <div className="progress-stats__value">{stats.averageEaseFactor}</div>
          <div className="progress-stats__label">Avg. Ease Factor</div>
        </div>

        {/* Mastered Cards */}
        <div className="progress-stats__item progress-stats__item--success">
          <div className="progress-stats__value">{stats.masteredCount}</div>
          <div className="progress-stats__label">Mastered</div>
        </div>

        {/* Progress Bar */}
        <div className="progress-stats__item progress-stats__item--full-width">
          <div className="progress-stats__label">Progress</div>
          <div className="progress-stats__bar-container">
            <div
              className="progress-stats__bar"
              style={{ width: `${stats.reviewPercentage}%` }}
              role="progressbar"
              aria-valuenow={stats.reviewPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="progress-stats__bar-label">{stats.reviewPercentage}% complete</div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;
