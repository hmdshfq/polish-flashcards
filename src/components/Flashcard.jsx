import { useState } from 'react';
import './Flashcard.css';

function Flashcard({ word }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          <div className="language-label">Polish</div>
          <div className="word">{word.polish}</div>
          <div className="hint">Click to reveal</div>
        </div>
        <div className="flashcard-back">
          <div className="language-label">English</div>
          <div className="word">{word.english}</div>
          <div className="hint">Click to go back</div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
