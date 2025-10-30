import { useState } from 'react';
import './Flashcard.css';
import { speakText } from '../utils/speechSynthesis';

function Flashcard({ word, languageDirection = 'pl-to-en', isMuted = false, speechRate = 1.0 }) {
  const [isFlipped, setIsFlipped] = useState(false);

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
