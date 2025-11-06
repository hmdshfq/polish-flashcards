import { useEffect, useRef, useCallback } from 'react';
import { buildUrl, parseUrl, validateUrlState } from '../utils/urlHelpers';

/**
 * Hook to synchronize browser history with app navigation state
 * Handles:
 * - Browser back/forward button clicks (popstate events)
 * - URL parsing on initial mount (direct access, page refresh)
 * - Pushing new entries to history on navigation
 * - Circular update prevention
 *
 * @param {object} props - Configuration object
 * @param {string} props.currentStage - Current app stage
 * @param {string} props.selectedLevel - Currently selected level
 * @param {string} props.selectedCategory - Currently selected category
 * @param {string} props.selectedMode - Currently selected mode
 * @param {function} props.setCurrentStage - State setter for stage
 * @param {function} props.setSelectedLevel - State setter for level
 * @param {function} props.setSelectedCategory - State setter for category
 * @param {function} props.setSelectedMode - State setter for mode
 * @param {array} props.levels - Available levels from Supabase
 * @param {array} props.categories - Available categories from Supabase
 * @returns {object} Navigation helper functions
 */
export function useUrlSync({
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
}) {
  const isInitialMount = useRef(true);
  const isNavigating = useRef(false);
  const navigationTimeout = useRef(null);

  /**
   * Update app state from URL (browser back/forward or direct access)
   */
  const syncStateFromUrl = useCallback(() => {
    if (isNavigating.current) return; // Prevent circular updates

    const pathname = window.location.pathname;
    const parsed = parseUrl(pathname);

    // Validate against available data
    const validated = validateUrlState(parsed, levels, categories);

    // Update state
    setSelectedLevel(validated.level);
    setSelectedCategory(validated.category);
    setSelectedMode(validated.mode);
    setCurrentStage(validated.stage);

    // Announce navigation for screen readers
    announceNavigation(validated.stage);
  }, [levels, categories, setCurrentStage, setSelectedLevel, setSelectedCategory, setSelectedMode]);

  /**
   * Update URL from app state (user navigation)
   */
  const syncUrlFromState = useCallback(
    (pushHistory = true) => {
      const newPath = buildUrl(selectedLevel, selectedCategory, selectedMode);
      const currentPath = window.location.pathname;

      if (newPath !== currentPath) {
        isNavigating.current = true;

        if (pushHistory) {
          window.history.pushState(
            {
              level: selectedLevel,
              category: selectedCategory,
              mode: selectedMode,
              stage: currentStage
            },
            '',
            newPath
          );
        } else {
          window.history.replaceState(
            {
              level: selectedLevel,
              category: selectedCategory,
              mode: selectedMode,
              stage: currentStage
            },
            '',
            newPath
          );
        }

        // Clear navigation flag after brief delay
        clearTimeout(navigationTimeout.current);
        navigationTimeout.current = setTimeout(() => {
          isNavigating.current = false;
        }, 100);
      }
    },
    [selectedLevel, selectedCategory, selectedMode, currentStage]
  );

  /**
   * Handle browser back/forward buttons (popstate event)
   */
  useEffect(() => {
    const handlePopState = () => {
      syncStateFromUrl();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncStateFromUrl]);

  /**
   * Parse URL on initial mount (handle direct access, page refresh)
   */
  useEffect(() => {
    // Only parse URL once on mount, and only if we have levels data
    if (isInitialMount.current && levels && levels.length > 0) {
      const pathname = window.location.pathname;

      // Only sync from URL if not at root path
      if (pathname !== '/') {
        syncStateFromUrl();
      }

      isInitialMount.current = false;
    }
  }, [levels, syncStateFromUrl]);

  /**
   * Update URL when state changes (user navigation)
   */
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) return;

    // Skip if we're currently processing a popstate event
    if (isNavigating.current) return;

    // Determine if we should push or replace history
    // Push for normal navigation, replace to fix invalid URLs
    const shouldPush = true; // Most navigation is intentional
    syncUrlFromState(shouldPush);
  }, [currentStage, selectedLevel, selectedCategory, selectedMode, syncUrlFromState]);

  /**
   * Navigate to a new stage (called by navigation handlers)
   * Updates all relevant state atomically
   */
  const navigateToStage = useCallback(
    (newStage, newState = {}) => {
      // Ensure data is loaded before navigation
      if (!levels || levels.length === 0) return;

      // Update state in order (to ensure URL is built correctly)
      if (newState.level !== undefined) setSelectedLevel(newState.level);
      if (newState.category !== undefined) setSelectedCategory(newState.category);
      if (newState.mode !== undefined) setSelectedMode(newState.mode);
      setCurrentStage(newStage);
    },
    [levels, setCurrentStage, setSelectedLevel, setSelectedCategory, setSelectedMode]
  );

  /**
   * Replace current URL without creating history entry
   * Useful for redirecting from invalid URLs to canonical ones
   */
  const replaceUrl = useCallback(() => {
    syncUrlFromState(false);
  }, [syncUrlFromState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, []);

  return {
    navigateToStage,
    replaceUrl
  };
}

/**
 * Announce navigation changes to screen readers
 * Updates the ARIA live region with navigation status
 */
function announceNavigation(stage) {
  const announcer = document.getElementById('navigation-announcer');
  if (!announcer) return;

  const messages = {
    'level-selection': 'Navigated to level selection screen',
    'category-selection': 'Navigated to category selection screen',
    'mode-selection': 'Navigated to mode selection screen',
    practice: 'Navigated to practice screen. Press Tab to focus on the main heading.'
  };

  announcer.textContent = messages[stage] || 'Navigation updated';
}

export default useUrlSync;
