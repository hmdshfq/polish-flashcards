import { useState, useEffect } from 'react';
import './Flashcard.css';
import { speakText } from '../utils/speechSynthesis';
import { formatNextReview } from '../utils/dateFormatter';

function Flashcard({
  word,
  languageDirection = 'pl-to-en',
  isMuted = false,
  speechRate = 1.0,
  onRate,
  isRating = false,
  nextReviewDate = null
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedButtonId, setRatedButtonId] = useState(null);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setRatedButtonId(null);
  }, [word?.id, word?.polish]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (text, language, event) => {
    // Prevent card flip when clicking speaker button
    event.stopPropagation();
    speakText(text, language, speechRate, isMuted).catch((error) => {
      console.error('Failed to speak:', error);
    });
  };

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

  // Determine which language shows on which side based on direction
  const isPolishToEnglish = languageDirection === 'pl-to-en';
  const frontLanguage = isPolishToEnglish ? 'Polish' : 'English';
  const frontWord = isPolishToEnglish ? word.polish : word.english;
  const backLanguage = isPolishToEnglish ? 'English' : 'Polish';
  const backWord = isPolishToEnglish ? word.english : word.polish;

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          <div className="language-label">{frontLanguage}</div>
          <div className="word">{frontWord}</div>
          <button
            className="speaker-btn"
            onClick={(e) => handleSpeak(frontWord, frontLanguage, e)}
            disabled={isMuted}
            title={isMuted ? 'Audio is muted' : 'Click to hear pronunciation'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <div className="hint">Click to reveal</div>
        </div>
        <div className="flashcard-back">
          <div className="language-label">{backLanguage}</div>
          <div className="word">{backWord}</div>
          <button
            className="speaker-btn"
            onClick={(e) => handleSpeak(backWord, backLanguage, e)}
            disabled={isMuted}
            title={isMuted ? 'Audio is muted' : 'Click to hear pronunciation'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <div className="hint">Click to go back</div>

          {onRate && (
            <div className="rating-overlay">
              <p className="rating-label">How well did you know this?</p>
              <div className="rating-buttons">
                <button
                  className={`rating-btn rating-btn--again ${ratedButtonId === 'again' ? 'rating-btn--rated' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(1, 'again');
                  }}
                  title="Press 1 to rate as Again"
                  aria-label="I didn't know this (Again)"
                  disabled={isRating}
                >
                  {ratedButtonId === 'again' && <span className="rating-checkmark">✓</span>}
                  <span className="rating-btn-text">Again</span>
                  <span className="rating-btn-hotkey">1</span>
                </button>
                <button
                  className={`rating-btn rating-btn--hard ${ratedButtonId === 'hard' ? 'rating-btn--rated' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(3, 'hard');
                  }}
                  title="Press 2 to rate as Hard"
                  aria-label="I struggled with this (Hard)"
                  disabled={isRating}
                >
                  {ratedButtonId === 'hard' && <span className="rating-checkmark">✓</span>}
                  <span className="rating-btn-text">Hard</span>
                  <span className="rating-btn-hotkey">2</span>
                </button>
                <button
                  className={`rating-btn rating-btn--good ${ratedButtonId === 'good' ? 'rating-btn--rated' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(4, 'good');
                  }}
                  title="Press 3 to rate as Good"
                  aria-label="I was unsure but recalled it (Good)"
                  disabled={isRating}
                >
                  {ratedButtonId === 'good' && <span className="rating-checkmark">✓</span>}
                  <span className="rating-btn-text">Good</span>
                  <span className="rating-btn-hotkey">3</span>
                </button>
                <button
                  className={`rating-btn rating-btn--easy ${ratedButtonId === 'easy' ? 'rating-btn--rated' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(5, 'easy');
                  }}
                  title="Press 4 to rate as Easy"
                  aria-label="I knew this easily (Easy)"
                  disabled={isRating}
                >
                  {ratedButtonId === 'easy' && <span className="rating-checkmark">✓</span>}
                  <span className="rating-btn-text">Easy</span>
                  <span className="rating-btn-hotkey">4</span>
                </button>
              </div>
              {nextReviewDate && (
                <p className="next-review-text">{formatNextReview(nextReviewDate)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
