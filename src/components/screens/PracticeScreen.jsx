import { useState, useEffect } from 'react';
import Flashcard from '../Flashcard';
import FlashcardControls from '../FlashcardControls';
import SettingsMenu from '../common/SettingsMenu';
import Breadcrumb from '../common/Breadcrumb';
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

  // Build breadcrumb items
  const buildBreadcrumbItems = () => {
    const items = [];

    const levelLabels = {
      A1: { full: 'A1 (Beginner)', abbr: 'A1' },
      A2: { full: 'A2 (Elementary)', abbr: 'A2' },
      B1: { full: 'B1 (Intermediate)', abbr: 'B1' }
    };

    // Add "Levels" as first item (always clickable)
    items.push({
      label: 'Levels',
      abbreviation: 'Levels',
      onClick: onBackToLevelSelection
    });

    // Add level
    if (selectedCategory) {
      // For A1: level is clickable (goes to category selection)
      items.push({
        label: levelLabels[selectedLevel].full,
        abbreviation: levelLabels[selectedLevel].abbr,
        onClick: onBackToCategorySelection
      });
    } else {
      // For A2/B1: level is not clickable (current context)
      items.push({
        label: levelLabels[selectedLevel].full,
        abbreviation: levelLabels[selectedLevel].abbr,
        onClick: null
      });
    }

    // Add category if exists (A1 only)
    if (selectedCategory) {
      if (selectedMode) {
        // Category is clickable (goes to mode selection)
        items.push({
          label: selectedCategory,
          abbreviation: selectedCategory,
          onClick: onBackToModeSelection
        });
      } else {
        // Category is not clickable (current context, shouldn't happen in practice screen)
        items.push({
          label: selectedCategory,
          abbreviation: selectedCategory,
          onClick: null
        });
      }
    }

    // Add mode if exists (A1 only)
    if (selectedMode) {
      const modeLabels = {
        vocabulary: { full: 'Vocabulary', abbr: 'Vocab' },
        grammar: { full: 'Grammar', abbr: 'Grammar' }
      };

      items.push({
        label: modeLabels[selectedMode].full,
        abbreviation: modeLabels[selectedMode].abbr,
        onClick: null // Last item, not clickable
      });
    }

    return items;
  };

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <Breadcrumb items={buildBreadcrumbItems()} />
        <div className="practice-header-controls">
          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
            aria-label="Open settings menu"
          >
            ⚙️
          </button>
          <div className="progress-indicator-header">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      </div>

      <SettingsMenu
        isOpen={showSettings}
        onClose={handleCloseSettings}
        onRestart={handleRestart}
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
