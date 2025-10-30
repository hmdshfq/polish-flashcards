import './FlashcardControls.css';

function FlashcardControls({ onPrevious, onNext, onShuffle, currentIndex, totalCards }) {
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
    </div>
  );
}

export default FlashcardControls;
