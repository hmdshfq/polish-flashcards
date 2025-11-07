import { Shuffle } from 'lucide-react';
import './FlashcardControls.css';

function FlashcardControls({ onPrevious, onNext, onShuffle, currentIndex, totalCards, languageDirection, onToggleLanguage, lastAction, lastKeyAction }) {
  return (
    <div className="flashcard-controls">
      <div className="progress-indicator">
        {currentIndex + 1} / {totalCards}
      </div>
      <div className="control-buttons">
        <button
          className={`control-btn ${lastAction === 'previous' ? 'btn-active' : ''}`}
          onClick={onPrevious}
          disabled={currentIndex === 0}
          aria-label="Go to previous card (Left Arrow key)"
        >
          ← Previous
        </button>
        <button
          className={`control-btn shuffle-btn ${lastAction === 'shuffle' ? 'btn-active' : ''}`}
          onClick={onShuffle}
          aria-label="Shuffle cards (Up or Down Arrow keys)"
        >
          <Shuffle size={18} />
          <span>Shuffle</span>
        </button>
        <button
          className={`control-btn ${lastAction === 'next' ? 'btn-active' : ''}`}
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          aria-label="Go to next card (Right Arrow key)"
        >
          Next →
        </button>
      </div>
      <div className="language-toggle-container">
        <div className={`language-toggle ${lastKeyAction === 'direction' ? 'toggle-pulse' : ''}`}>
          <span className={`toggle-label ${languageDirection === 'pl-to-en' ? 'active' : ''}`}>
            PL → EN
          </span>
          <div className="toggle-switch" onClick={onToggleLanguage} aria-label="Toggle language direction (/ key)">
            <div className={`toggle-slider ${languageDirection === 'en-to-pl' ? 'right' : ''}`}></div>
          </div>
          <span className={`toggle-label ${languageDirection === 'en-to-pl' ? 'active' : ''}`}>
            EN → PL
          </span>
        </div>
      </div>
    </div>
  );
}

export default FlashcardControls;
