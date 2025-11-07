import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import useUrlSync from './hooks/useUrlSync';
import useFocusManagement from './hooks/useFocusManagement';
import useLayoutHeights from './hooks/useLayoutHeights';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

/**
 * Learning app component (existing flashcard learning interface)
 */
function LearningApp() {
  // Stage management
  const [currentStage, setCurrentStage] = useState('level-selection');

  // Selection state
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  // Fetch data from Firebase
  const { data: levels, loading: levelsLoading, error: levelsError } = useLevels();
  const { data: categories, loading: categoriesLoading } = useCategories(selectedLevel);
  const { data: cards, loading: cardsLoading, error: cardsError } = useFlashcards(
    selectedLevel,
    selectedCategory,
    selectedMode
  );

  // Initialize URL synchronization and focus management
  const { navigateToStage } = useUrlSync({
    currentStage,
    selectedLevel,
    selectedCategory,
    selectedMode,
    setCurrentStage,
    setSelectedLevel,
    setSelectedCategory,
    setSelectedMode,
    levels,
    categories
  });

  useFocusManagement(currentStage, selectedLevel, selectedCategory, selectedMode);

  // Dynamically measure and update header/footer heights
  useLayoutHeights();

  // Build vocabulary object for screens that still need it
  const vocabulary = buildVocabularyObject(levels, categories, selectedLevel);

  // Navigation handlers
  const handleLevelSelect = (level) => {
    // Check if level has categories (A1)
    const levelData = levels?.find(l => l.id === level);
    const hasCategories = levelData?.has_categories;

    if (hasCategories) {
      // A1 - go to category selection
      navigateToStage('category-selection', {
        level,
        category: null,
        mode: null
      });
    } else {
      // A2 or B1 - go straight to practice
      navigateToStage('practice', {
        level,
        category: null,
        mode: null
      });
    }
  };

  const handleCategorySelect = (categoryObj) => {
    // Both A1 and A2 have vocabulary and sentences modes for each category
    // categoryObj is now { id, name, ... } object
    navigateToStage('mode-selection', {
      category: categoryObj
    });
  };

  const handleModeSelect = (mode) => {
    navigateToStage('practice', {
      mode
    });
  };

  const handleBackToLevelSelection = () => {
    navigateToStage('level-selection', {
      level: null,
      category: null,
      mode: null
    });
  };

  const handleBackToCategorySelection = () => {
    navigateToStage('category-selection', {
      category: null,
      mode: null
    });
  };

  const handleBackToModeSelection = () => {
    navigateToStage('mode-selection', {
      mode: null
    });
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
      {/* Screen reader navigation announcements */}
      <div
        id="navigation-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header">
        <div
          className="app-header-brand"
          onClick={handleBackToLevelSelection}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBackToLevelSelection();
            }
          }}
          aria-label="Go to level selection"
        >
          <h1>🇵🇱 Flashy Polish</h1>
          <p>Learn Polish at your own pace</p>
        </div>
        <StatusIndicator />
      </header>
      <main id="main-content" className="app-content">
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
            {cardsLoading || !cards ? (
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
            {cardsLoading || !cards ? (
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
        // category is now an object with id, name, etc.
        const categoryName = typeof category === 'string' ? category : category.name;
        vocab[level.id][categoryName] = {
          vocabulary: [],
          sentences: []
        };
      }
    } else if (!level.has_categories) {
      // A2/B1 - just create empty array placeholder
      vocab[level.id] = [];
    }
  }
  return vocab;
}

/**
 * Root app component with routing
 * Handles both learning app and admin panel routes
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginScreen />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />

          {/* Learning app routes (catch-all for backward compatibility) */}
          <Route path="*" element={<LearningApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
