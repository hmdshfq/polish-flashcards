import { useState, useEffect } from 'react';
import './Flashcard.css';
import { speakText } from '../utils/speechSynthesis';

function Flashcard({
  word,
  languageDirection = 'pl-to-en',
  isMuted = false,
  speechRate = 1.0,
  onFlipChange
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word?.id, word?.polish]);

  // Notify parent when flip state changes
  useEffect(() => {
    if (onFlipChange) {
      onFlipChange(isFlipped);
    }
  }, [isFlipped, onFlipChange]);

  // Handle spacebar key press to flip card
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if spacebar was pressed (key code 32 or key name 'Space' or ' ')
      if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
        // Prevent default spacebar behavior (scrolling)
        event.preventDefault();
        // Use functional state update to avoid stale closure
        setIsFlipped((prev) => !prev);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Empty dependency array since we use functional state update

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
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
