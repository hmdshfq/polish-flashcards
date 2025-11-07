import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Settings } from 'lucide-react';
import './App.css';
import LevelSelectionScreen from './components/screens/LevelSelectionScreen';
import CategorySelectionScreen from './components/screens/CategorySelectionScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen';
import PracticeScreen from './components/screens/PracticeScreen';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import AppSettingsModal from './components/common/AppSettingsModal';
import { useLevels } from './hooks/useLevels';
import { useCategories } from './hooks/useCategories';
import { useFlashcards } from './hooks/useFlashcards';
import useUrlSync from './hooks/useUrlSync';
import useFocusManagement from './hooks/useFocusManagement';
import useLayoutHeights from './hooks/useLayoutHeights';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext.jsx';

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

  // App settings modal state
  const [showAppSettings, setShowAppSettings] = useState(false);

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

  // Navigation handlers
  const handleLevelSelect = (level) => {
    // All levels go to mode selection first
    navigateToStage('mode-selection', {
      level,
      category: null,
      mode: null
    });
  };

  const handleModeSelect = (mode) => {
    // Fork based on mode selection
    if (mode === 'vocabulary') {
      // Go to category selection for vocabulary
      navigateToStage('category-selection', {
        mode
      });
    } else {
      // Go directly to practice for sentences
      navigateToStage('practice', {
        mode
      });
    }
  };

  const handleCategorySelect = (categoryObj) => {
    // From category selection, go to practice
    // categoryObj is now { id, name, ... } object
    navigateToStage('practice', {
      category: categoryObj
    });
  };

  const handleBackToLevelSelection = () => {
    navigateToStage('level-selection', {
      level: null,
      category: null,
      mode: null
    });
  };

  const handleBackToModeSelection = () => {
    navigateToStage('mode-selection', {
      mode: null
    });
  };

  const handleBackToCategorySelection = () => {
    navigateToStage('category-selection', {
      category: null
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1>Flashy Polish</h1>
          </div>
          <p>Learn Polish at your own pace</p>
        </div>
        <button
          className="app-header-settings-btn"
          onClick={() => setShowAppSettings(true)}
          aria-label="Open app settings"
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </header>
      <AppSettingsModal
        isOpen={showAppSettings}
        onClose={() => setShowAppSettings(false)}
      />
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

        {currentStage === 'mode-selection' && (
          <div key="mode-selection">
            {levelsLoading ? (
              <LoadingSpinner />
            ) : (
              <ModeSelectionScreen
                selectedLevel={selectedLevel}
                onSelectMode={handleModeSelect}
                onBack={handleBackToLevelSelection}
              />
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
                selectedMode={selectedMode}
                onSelectCategory={handleCategorySelect}
                onBack={handleBackToModeSelection}
                onBackToLevelSelection={handleBackToLevelSelection}
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
