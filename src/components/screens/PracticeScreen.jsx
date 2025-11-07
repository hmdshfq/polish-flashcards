import { useState, useEffect, useCallback } from 'react';
import Flashcard from '../Flashcard';
import FlashcardControls from '../FlashcardControls';
import RatingControls from '../RatingControls';
import SettingsMenu from '../common/SettingsMenu';
import ProgressModal from '../common/ProgressModal';
import Breadcrumb from '../common/Breadcrumb';
import { useUserProgress } from '../../hooks/useUserProgress';
import { getCurrentUser } from '../../services/firebase';
import { speakText, stopSpeech } from '../../utils/speechSynthesis';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [lastKeyAction, setLastKeyAction] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // Get current user for progress tracking
  const userId = getCurrentUser()?.uid;
  const { progress, loading: progressLoading, updateProgress } = useUserProgress(userId);

  // Update cards when initialCards changes
  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
  }, [initialCards]);

  // Handle Escape key to go back (only if modals are closed)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        // Don't handle navigation if modals are open (let modal handlers take priority)
        if (showSettings || showProgress) {
          return;
        }

        event.preventDefault();

        // Determine which back function to call based on navigation context
        if (selectedMode) {
          onBackToModeSelection();
        } else if (selectedCategory) {
          onBackToCategorySelection();
        } else {
          onBackToLevelSelection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, showProgress, selectedMode, selectedCategory, onBackToModeSelection, onBackToCategorySelection, onBackToLevelSelection]);

  // Handle arrow key navigation for flashcards
  useEffect(() => {
    const handleArrowKeys = (event) => {
      // Don't handle arrow keys if modals are open
      if (showSettings || showProgress) {
        return;
      }

      // Don't interfere with native form controls or contenteditable elements
      const activeElement = document.activeElement;
      const isFormElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      );

      if (isFormElement) {
        return;
      }

      // Handle arrow key navigation
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setLastAction('next');
            setTimeout(() => setLastAction(null), 300);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setLastAction('previous');
            setTimeout(() => setLastAction(null), 300);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault();
          const shuffled = [...cards].sort(() => Math.random() - 0.5);
          setCards(shuffled);
          setCurrentIndex(0);
          setLastAction('shuffle');
          setTimeout(() => setLastAction(null), 300);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [showSettings, showProgress, currentIndex, cards]);

  // Handle new keyboard shortcuts: / (toggle direction), s (speak), m (mute)
  useEffect(() => {
    const handleNewShortcuts = (event) => {
      // Don't handle if modals are open
      if (showSettings || showProgress) {
        return;
      }

      // Don't interfere with form controls or contenteditable elements
      const activeElement = document.activeElement;
      const isFormElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      );

      if (isFormElement) {
        return;
      }

      switch (event.key) {
        case '/':
          event.preventDefault();
          handleDirectionToggle();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          handleSpeakShortcut();
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          handleMuteToggle();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleNewShortcuts);
    return () => window.removeEventListener('keydown', handleNewShortcuts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSettings, showProgress, languageDirection, isMuted, isFlipped, cards, currentIndex, speechRate]);

  const handleDirectionToggle = () => {
    const newDirection = languageDirection === 'pl-to-en' ? 'en-to-pl' : 'pl-to-en';
    setLanguageDirection(newDirection);
    setLastKeyAction('direction');

    const directionLabel = newDirection === 'pl-to-en' ? 'Polish to English' : 'English to Polish';
    const message = `Language direction changed to ${directionLabel}`;
    setAnnouncement(message);

    setTimeout(() => setLastKeyAction(null), 500);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const handleSpeakShortcut = () => {
    if (!cards[currentIndex]) return;

    if (isMuted) {
      setAnnouncement('Audio is muted. Press M to unmute.');
      setTimeout(() => setAnnouncement(''), 3000);
      return;
    }

    const currentCard = cards[currentIndex];
    const isPolishToEnglish = languageDirection === 'pl-to-en';

    // Speak front side if not flipped, back side if flipped
    const textToSpeak = isFlipped
      ? (isPolishToEnglish ? currentCard.english : currentCard.polish)
      : (isPolishToEnglish ? currentCard.polish : currentCard.english);

    const languageToSpeak = isFlipped
      ? (isPolishToEnglish ? 'english' : 'polish')
      : (isPolishToEnglish ? 'polish' : 'english');

    setLastKeyAction('speak');
    const capitalizedLanguage = languageToSpeak.charAt(0).toUpperCase() + languageToSpeak.slice(1);
    setAnnouncement(`Speaking ${capitalizedLanguage} text`);

    speakText(textToSpeak, languageToSpeak, speechRate, false)
      .catch(error => console.error('Speech failed:', error));

    setTimeout(() => setLastKeyAction(null), 500);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setLastKeyAction('mute');

    if (newMutedState) {
      stopSpeech();
      setAnnouncement('Audio muted');
    } else {
      setAnnouncement('Audio unmuted');
    }

    setTimeout(() => setLastKeyAction(null), 2000);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < cards.length - 1) {
        setLastAction('next');
        setTimeout(() => setLastAction(null), 300);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [cards.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        setLastAction('previous');
        setTimeout(() => setLastAction(null), 300);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const handleShuffle = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setLastAction('shuffle');
    setTimeout(() => setLastAction(null), 300);
  }, [cards]);

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
      // Cycle back to first card after rating the last one
      setTimeout(() => {
        setIsRating(false);
        setNextReviewDate(null);
        setCurrentIndex((prevIndex) =>
          prevIndex < cards.length - 1 ? prevIndex + 1 : 0
        );
      }, 750);
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
      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Keyboard action toast notification */}
      {lastKeyAction && (
        <div className="keyboard-action-toast" role="status" aria-hidden="true">
          {lastKeyAction === 'direction' && (
            <span>🔄 {languageDirection === 'pl-to-en' ? 'PL → EN' : 'EN → PL'}</span>
          )}
          {lastKeyAction === 'speak' && <span>🔊 Speaking...</span>}
          {lastKeyAction === 'mute' && (
            <span>{isMuted ? '🔇 Muted' : '🔊 Unmuted'}</span>
          )}
        </div>
      )}

      {/* Mute status badge */}
      {isMuted && (
        <div className="mute-status-badge" title="Audio is muted">
          🔇
        </div>
      )}

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
            onFlipChange={setIsFlipped}
          />
          <RatingControls
            onRate={handleRate}
            isRating={isRating}
            nextReviewDate={nextReviewDate}
            isFlipped={isFlipped}
          />
          <FlashcardControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            currentIndex={currentIndex}
            totalCards={cards.length}
            languageDirection={languageDirection}
            onToggleLanguage={() => setLanguageDirection(languageDirection === 'pl-to-en' ? 'en-to-pl' : 'pl-to-en')}
            lastAction={lastAction}
            lastKeyAction={lastKeyAction}
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
