import { useState } from 'react';
import './Flashcard.css';

function Flashcard({ word, languageDirection = 'pl-to-en' }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
          <div className="hint">Click to reveal</div>
        </div>
        <div className="flashcard-back">
          <div className="language-label">{backLanguage}</div>
          <div className="word">{backWord}</div>
          <div className="hint">Click to go back</div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
