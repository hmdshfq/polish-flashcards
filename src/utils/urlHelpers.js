/**
 * URL Helper Utilities for Browser History Integration
 * Handles bidirectional conversion between app state and URLs
 */

/**
 * Convert text to URL-safe slug
 * "City Landmarks" → "city-landmarks"
 * @param {string} text - Text to slugify
 * @returns {string} URL-safe slug
 */
export function slugify(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert URL slug back to readable text
 * "city-landmarks" → "City Landmarks"
 * Note: Cannot restore original casing without data lookup
 * @param {string} slug - URL slug to unsluggify
 * @returns {string} Readable text
 */
export function unslugify(slug) {
  if (!slug) return '';

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build URL path from app state
 * @param {string} level - Selected level (A1/A2/B1)
 * @param {string} category - Selected category name (optional)
 * @param {string} mode - Selected mode: vocabulary|sentences (optional)
 * @returns {string} URL path
 */
export function buildUrl(level, category, mode) {
  if (!level) return '/';

  let path = `/level/${level}`;

  if (category) {
    path += `/category/${slugify(category)}`;
  }

  if (mode) {
    path += `/mode/${mode}`;
  }

  return path;
}

/**
 * Parse URL pathname into app state
 * Validates structure but not against data
 * @param {string} pathname - URL pathname from window.location
 * @returns {{level: string|null, category: string|null, mode: string|null, stage: string}} Parsed state
 */
export function parseUrl(pathname) {
  // Root path
  if (pathname === '/' || !pathname) {
    return {
      level: null,
      category: null,
      mode: null,
      stage: 'level-selection'
    };
  }

  // Match pattern: /level/:level[/category/:slug[/mode/:mode]]
  const pattern = /^\/level\/([^/]+)(?:\/category\/([^/]+)(?:\/mode\/([^/]+))?)?$/;
  const match = pathname.match(pattern);

  if (!match) {
    // Invalid URL pattern - redirect to root
    return {
      level: null,
      category: null,
      mode: null,
      stage: 'level-selection'
    };
  }

  const [, level, categorySlug, mode] = match;
  const category = categorySlug ? unslugify(categorySlug) : null;

  // Determine stage from URL structure
  let stage = 'level-selection';
  if (mode) {
    stage = 'practice';
  } else if (category) {
    stage = 'mode-selection';
  } else if (level) {
    // Could be category-selection or practice (depends on level data)
    stage = 'category-selection';
  }

  return {
    level,
    category,
    mode: mode || null,
    stage
  };
}

/**
 * Validate parsed URL state against available data
 * Corrects invalid states and returns updated state
 * @param {object} parsedState - State from parseUrl
 * @param {array} levels - Available levels from database
 * @param {array} categories - Available categories from database
 * @returns {{level: string|null, category: string|null, mode: string|null, stage: string}} Validated state
 */
export function validateUrlState(parsedState, levels, categories) {
  const { level, category, mode } = parsedState;

  // No level specified
  if (!level) {
    return {
      level: null,
      category: null,
      mode: null,
      stage: 'level-selection'
    };
  }

  // Validate level exists
  const levelData = levels?.find(l => l.id === level);
  if (!levelData) {
    return {
      level: null,
      category: null,
      mode: null,
      stage: 'level-selection'
    };
  }

  // Check if level has categories
  const hasCategories = levelData.has_categories;

  // Level without categories (A2/B1)
  if (!hasCategories) {
    // Should go directly to practice
    return {
      level,
      category: null,
      mode: null,
      stage: 'practice'
    };
  }

  // Level with categories (A1) - validate category if present
  if (category) {
    // Find matching category (case-insensitive for robustness)
    const categoryData = categories?.find(
      c => c.name.toLowerCase() === category.toLowerCase()
    );

    if (!categoryData) {
      // Invalid category - go to category selection
      return {
        level,
        category: null,
        mode: null,
        stage: 'category-selection'
      };
    }

    // Use canonical category name from database
    const validCategory = categoryData.name;

    // Validate mode if present
    if (mode) {
      const validModes = ['vocabulary', 'sentences'];
      if (!validModes.includes(mode)) {
        // Invalid mode - go to mode selection
        return {
          level,
          category: validCategory,
          mode: null,
          stage: 'mode-selection'
        };
      }

      // Valid practice state
      return {
        level,
        category: validCategory,
        mode,
        stage: 'practice'
      };
    }

    // Valid category, no mode specified
    return {
      level,
      category: validCategory,
      mode: null,
      stage: 'mode-selection'
    };
  }

  // Level with categories but no category specified
  return {
    level,
    category: null,
    mode: null,
    stage: 'category-selection'
  };
}

/**
 * Check if current URL needs updating based on state
 * Useful for redirecting from old slugs to canonical slugs
 * @param {string} currentPath - Current window.location.pathname
 * @param {{level: string|null, category: string|null, mode: string|null}} state - Current app state
 * @returns {boolean} True if URL should be updated
 */
export function shouldUpdateUrl(currentPath, state) {
  const expectedPath = buildUrl(state.level, state.category, state.mode);
  return currentPath !== expectedPath;
}
