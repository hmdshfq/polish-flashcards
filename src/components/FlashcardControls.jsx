import './FlashcardControls.css';
import AudioControls from './AudioControls';

function FlashcardControls({ onPrevious, onNext, onShuffle, currentIndex, totalCards, languageDirection, onToggleLanguage, isMuted, onToggleMute, speechRate, onSpeechRateChange }) {
  return (
    <div className="flashcard-controls">
      <div className="progress-indicator">
        {currentIndex + 1} / {totalCards}
      </div>
      <div className="control-buttons">
        <button className="control-btn" onClick={onPrevious} disabled={currentIndex === 0}>
          ← Previous
        </button>
        <button className="control-btn shuffle-btn" onClick={onShuffle}>
          🔀 Shuffle
        </button>
        <button className="control-btn" onClick={onNext} disabled={currentIndex === totalCards - 1}>
          Next →
        </button>
      </div>
      <div className="language-toggle-container">
        <div className="language-toggle">
          <span className={`toggle-label ${languageDirection === 'pl-to-en' ? 'active' : ''}`}>
            PL → EN
          </span>
          <div className="toggle-switch" onClick={onToggleLanguage}>
            <div className={`toggle-slider ${languageDirection === 'en-to-pl' ? 'right' : ''}`}></div>
          </div>
          <span className={`toggle-label ${languageDirection === 'en-to-pl' ? 'active' : ''}`}>
            EN → PL
          </span>
        </div>
      </div>
      <AudioControls
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        speechRate={speechRate}
        onSpeechRateChange={onSpeechRateChange}
      />
    </div>
  );
}

export default FlashcardControls;
