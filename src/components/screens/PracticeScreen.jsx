import { useState, useEffect } from 'react';
import Flashcard from '../Flashcard';
import FlashcardControls from '../FlashcardControls';
import SettingsMenu from '../common/SettingsMenu';
import './PracticeScreen.css';

function PracticeScreen({
  selectedLevel,
  selectedCategory,
  selectedMode,
  cards: initialCards,
  onBackToLevelSelection,
  onBackToCategorySelection,
  onBackToModeSelection
}) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [languageDirection, setLanguageDirection] = useState('pl-to-en');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  // Update cards when initialCards changes
  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
  }, [initialCards]);

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
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowSettings(false);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
          aria-label="Open settings menu"
        >
          ⚙️
          <span className="settings-button__text">Settings</span>
        </button>
        <div className="progress-indicator-header">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <SettingsMenu
        isOpen={showSettings}
        onClose={handleCloseSettings}
        selectedLevel={selectedLevel}
        selectedCategory={selectedCategory}
        selectedMode={selectedMode}
        onRestart={handleRestart}
        onBackToModeSelection={selectedMode ? onBackToModeSelection : undefined}
        onBackToCategorySelection={selectedCategory ? onBackToCategorySelection : undefined}
        onBackToLevelSelection={onBackToLevelSelection}
      />

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
          <button className="empty-state__button" onClick={onBackToLevelSelection}>
            Go back to level selection
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticeScreen;
