import { useState } from 'react';
import './App.css';
import LevelSelectionScreen from './components/screens/LevelSelectionScreen';
import CategorySelectionScreen from './components/screens/CategorySelectionScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen';
import PracticeScreen from './components/screens/PracticeScreen';
import Footer from './components/common/Footer';
import StatusIndicator from './components/common/StatusIndicator';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useLevels } from './hooks/useLevels';
import { useCategories } from './hooks/useCategories';
import { useFlashcards } from './hooks/useFlashcards';

function App() {
  // Stage management
  const [currentStage, setCurrentStage] = useState('level-selection');

  // Selection state
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  // Fetch data from Supabase
  const { data: levels, loading: levelsLoading, error: levelsError } = useLevels();
  const { data: categories, loading: categoriesLoading } = useCategories(selectedLevel);
  const { data: cards, loading: cardsLoading, error: cardsError } = useFlashcards(
    selectedLevel,
    selectedCategory,
    selectedMode
  );

  // Build vocabulary object for screens that still need it
  const vocabulary = buildVocabularyObject(levels, categories, selectedLevel);

  // Navigation handlers
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);

    // Check if level has categories (A1)
    const levelData = levels?.find(l => l.id === level);
    const hasCategories = levelData?.has_categories;

    if (hasCategories) {
      // A1 - go to category selection
      setCurrentStage('category-selection');
    } else {
      // A2 or B1 - go straight to practice
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
    setCurrentStage('practice');
  };

  const handleBackToLevelSelection = () => {
    setCurrentStage('level-selection');
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSelectedMode(null);
  };

  const handleBackToCategorySelection = () => {
    setCurrentStage('category-selection');
    setSelectedCategory(null);
    setSelectedMode(null);
  };

  const handleBackToModeSelection = () => {
    setCurrentStage('mode-selection');
    setSelectedMode(null);
  };

  // Show error if data loading failed
  if (levelsError) {
    return (
      <div className="app">
        <main className="app-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Error Loading Data</h2>
            <p>{levelsError}</p>
            <p>Please check your internet connection and refresh the page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <StatusIndicator />
      </header>
      <main className="app-content">
        {currentStage === 'level-selection' && (
          <div key="level-selection">
            {levelsLoading ? (
              <LoadingSpinner />
            ) : (
              <LevelSelectionScreen onSelectLevel={handleLevelSelect} />
            )}
          </div>
        )}

        {currentStage === 'category-selection' && (
          <div key="category-selection">
            {categoriesLoading ? (
              <LoadingSpinner />
            ) : (
              <CategorySelectionScreen
                selectedLevel={selectedLevel}
                onSelectCategory={handleCategorySelect}
                onBack={handleBackToLevelSelection}
                vocabulary={vocabulary}
              />
            )}
          </div>
        )}

        {currentStage === 'mode-selection' && (
          <div key="mode-selection">
            {cardsLoading ? (
              <LoadingSpinner />
            ) : (
              <ModeSelectionScreen
                selectedLevel={selectedLevel}
                selectedCategory={selectedCategory}
                onSelectMode={handleModeSelect}
                onBack={handleBackToCategorySelection}
                onBackToLevelSelection={handleBackToLevelSelection}
                vocabulary={vocabulary}
                cards={cards}
              />
            )}
          </div>
        )}

        {currentStage === 'practice' && (
          <div key="practice">
            {cardsLoading ? (
              <LoadingSpinner />
            ) : cardsError ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Error Loading Flashcards</h2>
                <p>{cardsError}</p>
                <button onClick={handleBackToLevelSelection}>Go Back</button>
              </div>
            ) : (
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
        )}
      </main>
      <Footer />
    </div>
  );
}

/**
 * Build a vocabulary object compatible with existing screens
 * This allows minimal changes to other components
 */
function buildVocabularyObject(levels, categories, selectedLevel) {
  if (!levels) return {};

  const vocab = {};
  for (const level of levels) {
    if (level.has_categories && level.id === selectedLevel && categories) {
      // A1 with categories
      vocab[level.id] = {};
      for (const category of categories) {
        vocab[level.id][category.name] = {
          vocabulary: [],
          grammar: []
        };
      }
    } else if (!level.has_categories) {
      // A2/B1 - just create empty array placeholder
      vocab[level.id] = [];
    }
  }
  return vocab;
}

export default App;
