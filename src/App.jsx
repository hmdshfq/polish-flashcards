import { useState } from 'react';
import './App.css';
import CategorySelector from './components/CategorySelector';
import Flashcard from './components/Flashcard';
import FlashcardControls from './components/FlashcardControls';
import { vocabulary } from './data/vocabulary';

function App() {
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState(vocabulary.A1);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setCards(vocabulary[level]);
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

      <CategorySelector selectedLevel={selectedLevel} onSelectLevel={handleLevelSelect} />

      {cards.length > 0 && (
        <>
          <Flashcard word={cards[currentIndex]} />
          <FlashcardControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            currentIndex={currentIndex}
            totalCards={cards.length}
          />
        </>
      )}
    </div>
  );
}

export default App;
