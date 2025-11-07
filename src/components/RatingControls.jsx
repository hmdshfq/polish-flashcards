import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import './RatingControls.css';
import { formatNextReview } from '../utils/dateFormatter';

function RatingControls({
  onRate,
  isRating = false,
  nextReviewDate = null,
  isFlipped = false
}) {
  const [ratedButtonId, setRatedButtonId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset when card changes (nextReviewDate becomes null)
  useEffect(() => {
    if (nextReviewDate === null) {
      setRatedButtonId(null);
      setShowFeedback(false);
    }
  }, [nextReviewDate]);

  // Show feedback when a rating is made
  useEffect(() => {
    if (ratedButtonId && nextReviewDate) {
      setShowFeedback(true);
    }
  }, [ratedButtonId, nextReviewDate]);

  const handleRate = (quality, buttonId) => {
    if (onRate && !isRating) {
      setRatedButtonId(buttonId);
      onRate(quality);
    }
  };

  // Handle keyboard shortcuts for ratings (1-4)
  useEffect(() => {
    if (!isFlipped || !onRate || isRating) return;

    const handleKeyPress = (e) => {
      const qualityMap = {
        '1': { quality: 1, buttonId: 'again' },
        '2': { quality: 3, buttonId: 'hard' },
        '3': { quality: 4, buttonId: 'good' },
        '4': { quality: 5, buttonId: 'easy' }
      };

      if (qualityMap[e.key]) {
        e.preventDefault();
        const { quality, buttonId } = qualityMap[e.key];
        handleRate(quality, buttonId);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, isRating]);

  const ratings = [
    {
      id: 'again',
      label: 'Again',
      quality: 1,
      hotkey: '1',
      description: "Didn't know",
      icon: '😓'
    },
    {
      id: 'hard',
      label: 'Hard',
      quality: 3,
      hotkey: '2',
      description: 'Struggled',
      icon: '🤔'
    },
    {
      id: 'good',
      label: 'Good',
      quality: 4,
      hotkey: '3',
      description: 'Recalled',
      icon: '🙂'
    },
    {
      id: 'easy',
      label: 'Easy',
      quality: 5,
      hotkey: '4',
      description: 'Knew easily',
      icon: '😄'
    }
  ];

  // Only show if card is flipped
  if (!isFlipped) {
    return null;
  }

  return (
    <div className={`rating-controls ${showFeedback ? 'rating-controls--feedback' : ''}`}>
      <div className="rating-controls__header">
        <h3 className="rating-controls__title">How well did you know this?</h3>
        {showFeedback && nextReviewDate && (
          <div className="rating-controls__feedback">
            <Check size={18} className="rating-controls__feedback-icon" />
            <span className="rating-controls__feedback-text">
              {formatNextReview(nextReviewDate)}
            </span>
          </div>
        )}
      </div>

      <div className="rating-controls__buttons">
        {ratings.map((rating) => (
          <button
            key={rating.id}
            className={`rating-controls__button rating-controls__button--${rating.id} ${
              ratedButtonId === rating.id ? 'rating-controls__button--selected' : ''
            }`}
            onClick={() => handleRate(rating.quality, rating.id)}
            disabled={isRating}
            aria-label={`${rating.label}: ${rating.description} (Press ${rating.hotkey})`}
            title={`Press ${rating.hotkey} for ${rating.label}`}
          >
            <span className="rating-controls__button-icon">{rating.icon}</span>
            <span className="rating-controls__button-content">
              <span className="rating-controls__button-label">{rating.label}</span>
              <span className="rating-controls__button-description">{rating.description}</span>
            </span>
            <span className="rating-controls__button-hotkey">{rating.hotkey}</span>
            {ratedButtonId === rating.id && (
              <Check size={16} className="rating-controls__checkmark" />
            )}
          </button>
        ))}
      </div>

      <div className="rating-controls__hint">
        Press 1-4 or click to rate
      </div>
    </div>
  );
}

export default RatingControls;
