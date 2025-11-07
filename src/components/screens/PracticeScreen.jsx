import { useState, useEffect } from 'react';
import Flashcard from '../Flashcard';
import FlashcardControls from '../FlashcardControls';
import SettingsMenu from '../common/SettingsMenu';
import ProgressModal from '../common/ProgressModal';
import Breadcrumb from '../common/Breadcrumb';
import { useUserProgress } from '../../hooks/useUserProgress';
import { getCurrentUser } from '../../services/firebase';
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
  const [showProgress, setShowProgress] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState(null);

  // Get current user for progress tracking
  const userId = getCurrentUser()?.uid;
  const { progress, loading: progressLoading, updateProgress } = useUserProgress(userId);

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

  const handleCloseProgress = () => {
    setShowProgress(false);
  };

  const handleRate = async (quality) => {
    if (!userId || isRating) return;

    const currentCard = cards[currentIndex];
    if (!currentCard || !currentCard.id) {
      console.warn('Current card or card ID not found');
      return;
    }

    setIsRating(true);

    try {
      const result = await updateProgress(currentCard.id, quality);

      // Display next review date from the result
      if (result?.next_review_at) {
        setNextReviewDate(result.next_review_at);
      }

      // Auto-advance to next card after a delay (1500ms for feedback visibility)
      setTimeout(() => {
        setIsRating(false);
        setNextReviewDate(null);
        setCurrentIndex((prevIndex) =>
          prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex
        );
      }, 1500);
    } catch (error) {
      console.error('Failed to update progress:', error);
      setIsRating(false);
      setNextReviewDate(null);
    }
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
      const categoryName = selectedCategory?.name || selectedCategory;
      if (selectedMode) {
        // Category is clickable (goes to mode selection)
        items.push({
          label: categoryName,
          abbreviation: categoryName,
          onClick: onBackToModeSelection
        });
      } else {
        // Category is not clickable (current context, shouldn't happen in practice screen)
        items.push({
          label: categoryName,
          abbreviation: categoryName,
          onClick: null
        });
      }
    }

    // Add mode if exists (A1 only)
    if (selectedMode) {
      const modeLabels = {
        vocabulary: { full: 'Vocabulary', abbr: 'Vocab' },
        sentences: { full: 'Sentences', abbr: 'Sentences' }
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
            className="progress-button"
            onClick={() => setShowProgress(true)}
            aria-label="Open progress stats"
          >
            📊
          </button>
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
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
      />

      <ProgressModal
        isOpen={showProgress}
        onClose={handleCloseProgress}
        cards={cards}
        progress={progress}
        loading={progressLoading}
      />

      {cards.length > 0 && (
        <div className="practice-content">
          <Flashcard
            key={`${currentIndex}-${cards[currentIndex]?.id || cards[currentIndex]?.polish}`}
            word={cards[currentIndex]}
            languageDirection={languageDirection}
            isMuted={isMuted}
            speechRate={speechRate}
            onRate={handleRate}
            isRating={isRating}
            nextReviewDate={nextReviewDate}
          />
          <FlashcardControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            currentIndex={currentIndex}
            totalCards={cards.length}
            languageDirection={languageDirection}
            onToggleLanguage={() => setLanguageDirection(languageDirection === 'pl-to-en' ? 'en-to-pl' : 'pl-to-en')}
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
