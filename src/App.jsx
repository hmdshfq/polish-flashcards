import { useState } from 'react';
import './App.css';
import CategorySelector from './components/CategorySelector';
import Flashcard from './components/Flashcard';
import FlashcardControls from './components/FlashcardControls';
import { vocabulary } from './data/vocabulary';

function App() {
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedCategory, setSelectedCategory] = useState('Basics');
  const [selectedMode, setSelectedMode] = useState('vocabulary');
  const [languageDirection, setLanguageDirection] = useState('pl-to-en'); // 'pl-to-en' or 'en-to-pl'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState(vocabulary.A1.Basics.vocabulary);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // Check if the level has categories (like A1) or is a flat array
    if (typeof vocabulary[level] === 'object' && !Array.isArray(vocabulary[level])) {
      // Level has categories, select the first one
      const firstCategory = Object.keys(vocabulary[level])[0];
      setSelectedCategory(firstCategory);
      setSelectedMode('vocabulary'); // Reset to vocabulary mode
      setCards(vocabulary[level][firstCategory].vocabulary);
    } else {
      // Level is a flat array (A2, B1)
      setSelectedCategory(null);
      setSelectedMode(null);
      setCards(vocabulary[level]);
    }
    setCurrentIndex(0);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedMode('vocabulary'); // Reset to vocabulary mode when changing category
    setCards(vocabulary[selectedLevel][category].vocabulary);
    setCurrentIndex(0);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setCards(vocabulary[selectedLevel][selectedCategory][mode]);
    setCurrentIndex(0);
  };

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

  return (
    <div className="app">
      <header>
        <h1>🇵🇱 Flashy Polish</h1>
        <p>Learn Polish vocabulary at your own pace</p>
      </header>

      <CategorySelector
        selectedLevel={selectedLevel}
        selectedCategory={selectedCategory}
        selectedMode={selectedMode}
        onSelectLevel={handleLevelSelect}
        onSelectCategory={handleCategorySelect}
        onSelectMode={handleModeSelect}
        vocabulary={vocabulary}
      />

      {cards.length > 0 && (
        <>
          <Flashcard word={cards[currentIndex]} languageDirection={languageDirection} />
          <FlashcardControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            currentIndex={currentIndex}
            totalCards={cards.length}
            languageDirection={languageDirection}
            onToggleLanguage={() => setLanguageDirection(languageDirection === 'pl-to-en' ? 'en-to-pl' : 'pl-to-en')}
          />
        </>
      )}
    </div>
  );
}

export default App;
