import { useState } from 'react';
import Flashcard from '../Flashcard';
import FlashcardControls from '../FlashcardControls';
import './PracticeScreen.css';

function PracticeScreen({
  selectedLevel,
  selectedCategory,
  selectedMode,
  cards,
  onBackToLevelSelection,
  onBackToCategorySelection,
  onBackToModeSelection
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [languageDirection, setLanguageDirection] = useState('pl-to-en');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    // Note: We can't update the cards directly here since it's a prop
    // For now, just reset to first card
    // In Phase 4, we'll implement this properly with state management
    setCurrentIndex(0);
  };

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Open settings menu"
        >
          ⚙️ Settings
        </button>
        <div className="progress-indicator-header">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
            <div className="settings-menu__header">
              <h3>Settings</h3>
              <button
                className="settings-close"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <div className="settings-menu__content">
              <button className="settings-option" onClick={() => setCurrentIndex(0)}>
                🔄 Restart Current
              </button>

              {selectedMode && (
                <button className="settings-option" onClick={onBackToModeSelection}>
                  ← Change Mode
                  <span className="settings-option__subtitle">(Vocabulary/Grammar)</span>
                </button>
              )}

              {selectedCategory && (
                <button className="settings-option" onClick={onBackToCategorySelection}>
                  ← Change Category
                  <span className="settings-option__subtitle">(Basics, Colors...)</span>
                </button>
              )}

              <button className="settings-option" onClick={onBackToLevelSelection}>
                ← Change Level
                <span className="settings-option__subtitle">(A1, A2, B1)</span>
              </button>

              <div className="current-selection">
                <strong>Current Selection:</strong>
                <br />
                {selectedLevel}
                {selectedCategory && ` › ${selectedCategory}`}
                {selectedMode && ` › ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="practice-content">
          <Flashcard
            word={cards[currentIndex]}
            languageDirection={languageDirection}
            isMuted={isMuted}
            speechRate={speechRate}
          />
          <FlashcardControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            currentIndex={currentIndex}
            totalCards={cards.length}
            languageDirection={languageDirection}
            onToggleLanguage={() => setLanguageDirection(languageDirection === 'pl-to-en' ? 'en-to-pl' : 'pl-to-en')}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
        </div>
      )}

      {cards.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <h3>No flashcards available</h3>
          <p>This selection doesn't have any content yet.</p>
          <button onClick={onBackToLevelSelection}>
            Go back to level selection
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticeScreen;
