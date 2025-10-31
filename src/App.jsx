import { useState } from 'react';
import './App.css';
import LevelSelectionScreen from './components/screens/LevelSelectionScreen';
import CategorySelectionScreen from './components/screens/CategorySelectionScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen';
import PracticeScreen from './components/screens/PracticeScreen';
import { vocabulary } from './data/vocabulary';

function App() {
  // Stage management
  const [currentStage, setCurrentStage] = useState('level-selection');

  // Selection state
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  // Flashcard data
  const [cards, setCards] = useState([]);

  // Navigation handlers
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);

    // Check if level has categories
    const hasCategories = typeof vocabulary[level] === 'object' && !Array.isArray(vocabulary[level]);

    if (hasCategories) {
      // A1 - go to category selection
      setCurrentStage('category-selection');
    } else {
      // A2 or B1 - go straight to practice
      setCards(vocabulary[level]);
      setSelectedCategory(null);
      setSelectedMode(null);
      setCurrentStage('practice');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStage('mode-selection');
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setCards(vocabulary[selectedLevel][selectedCategory][mode]);
    setCurrentStage('practice');
  };

  const handleBackToLevelSelection = () => {
    setCurrentStage('level-selection');
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSelectedMode(null);
    setCards([]);
  };

  const handleBackToCategorySelection = () => {
    setCurrentStage('category-selection');
    setSelectedCategory(null);
    setSelectedMode(null);
    setCards([]);
  };

  const handleBackToModeSelection = () => {
    setCurrentStage('mode-selection');
    setSelectedMode(null);
    setCards([]);
  };

  return (
    <div className="app">
      {currentStage === 'level-selection' && (
        <LevelSelectionScreen onSelectLevel={handleLevelSelect} />
      )}

      {currentStage === 'category-selection' && (
        <CategorySelectionScreen
          selectedLevel={selectedLevel}
          onSelectCategory={handleCategorySelect}
          onBack={handleBackToLevelSelection}
          vocabulary={vocabulary}
        />
      )}

      {currentStage === 'mode-selection' && (
        <ModeSelectionScreen
          selectedLevel={selectedLevel}
          selectedCategory={selectedCategory}
          onSelectMode={handleModeSelect}
          onBack={handleBackToCategorySelection}
          vocabulary={vocabulary}
        />
      )}

      {currentStage === 'practice' && (
        <PracticeScreen
          selectedLevel={selectedLevel}
          selectedCategory={selectedCategory}
          selectedMode={selectedMode}
          cards={cards}
          onBackToLevelSelection={handleBackToLevelSelection}
          onBackToCategorySelection={handleBackToCategorySelection}
          onBackToModeSelection={handleBackToModeSelection}
        />
      )}
    </div>
  );
}

export default App;
