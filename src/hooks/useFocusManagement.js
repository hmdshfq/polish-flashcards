import { useEffect, useRef } from 'react';

/**
 * Hook to manage focus on stage transitions for keyboard accessibility
 * Moves focus to the main content heading when navigating to a new stage
 * This helps keyboard users understand what changed and where to begin
 *
 * @param {string} currentStage - Current app stage
 * @param {string} selectedLevel - Currently selected level (optional dependency)
 * @param {string} selectedCategory - Currently selected category (optional dependency)
 * @param {string} selectedMode - Currently selected mode (optional dependency)
 */
export function useFocusManagement(
  currentStage,
  selectedLevel,
  selectedCategory,
  selectedMode
) {
  const previousStage = useRef(currentStage);

  useEffect(() => {
    // Skip focus management on initial mount
    if (previousStage.current === currentStage) {
      previousStage.current = currentStage;
      return;
    }

    // Focus the main heading of new stage after brief delay (allows DOM to update)
    // Using setTimeout to ensure the stage transition animation has started
    const timeoutId = setTimeout(() => {
      const heading = document.querySelector('main h1, main h2');

      if (heading) {
        // Temporarily make heading focusable
        heading.setAttribute('tabindex', '-1');
        heading.focus();

        // Announce focus change for screen readers
        heading.setAttribute('role', 'region');

        // Remove tabindex after focus to maintain normal tab behavior
        // Use once: true to ensure this listener only fires once
        const blurHandler = () => {
          heading.removeAttribute('tabindex');
        };

        heading.addEventListener('blur', blurHandler, { once: true });
      }
    }, 100); // Small delay for stage transition animation

    previousStage.current = currentStage;

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentStage, selectedLevel, selectedCategory, selectedMode]);
}

export default useFocusManagement;
