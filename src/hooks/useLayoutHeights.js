import { useEffect } from 'react';

/**
 * Custom hook to dynamically measure and update header and footer heights
 * as CSS custom properties. This ensures accurate height calculations across
 * all breakpoints and screen sizes.
 */
function useLayoutHeights() {
  useEffect(() => {
    const updateHeights = () => {
      // Get header and footer elements
      const header = document.querySelector('.app-header');
      const footer = document.querySelector('.footer');

      if (header && footer) {
        // Measure actual heights
        const headerHeight = header.offsetHeight;
        const footerHeight = footer.offsetHeight;

        // Update CSS custom properties on document root
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      }
    };

    // Initial measurement
    updateHeights();

    // Update on window resize
    window.addEventListener('resize', updateHeights);

    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', updateHeights);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('resize', updateHeights);
      window.removeEventListener('orientationchange', updateHeights);
    };
  }, []);
}

export default useLayoutHeights;
