import { describe, it, expect } from 'vitest';
import {
  slugify,
  unslugify,
  buildUrl,
  parseUrl,
  validateUrlState,
  shouldUpdateUrl
} from '../urlHelpers';

describe('urlHelpers', () => {
  describe('slugify', () => {
    it('converts spaces to hyphens', () => {
      expect(slugify('City Landmarks')).toBe('city-landmarks');
    });

    it('converts to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(slugify('Café & Restaurant')).toBe('cafe-restaurant');
    });

    it('removes consecutive hyphens', () => {
      expect(slugify('Hello---World')).toBe('hello-world');
    });

    it('removes leading and trailing hyphens', () => {
      expect(slugify('-hello-world-')).toBe('hello-world');
    });

    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('handles null/undefined', () => {
      expect(slugify(null)).toBe('');
      expect(slugify(undefined)).toBe('');
    });

    it('handles whitespace-only string', () => {
      expect(slugify('   ')).toBe('');
    });
  });

  describe('unslugify', () => {
    it('converts slug to readable text', () => {
      expect(unslugify('city-landmarks')).toBe('City Landmarks');
    });

    it('capitalizes each word', () => {
      expect(unslugify('hello-world-test')).toBe('Hello World Test');
    });

    it('handles single word', () => {
      expect(unslugify('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(unslugify('')).toBe('');
    });

    it('handles null/undefined', () => {
      expect(unslugify(null)).toBe('');
      expect(unslugify(undefined)).toBe('');
    });
  });

  describe('buildUrl', () => {
    it('returns root path when no level', () => {
      expect(buildUrl(null)).toBe('/');
      expect(buildUrl('')).toBe('/');
    });

    it('builds level-only URL', () => {
      expect(buildUrl('A1')).toBe('/level/A1');
      expect(buildUrl('A2')).toBe('/level/A2');
    });

    it('builds level and category URL', () => {
      expect(buildUrl('A1', 'Basics')).toBe('/level/A1/category/basics');
      expect(buildUrl('A1', 'City Landmarks')).toBe(
        '/level/A1/category/city-landmarks'
      );
    });

    it('builds full URL with level, category, and mode', () => {
      expect(buildUrl('A1', 'Basics', 'vocabulary')).toBe(
        '/level/A1/category/basics/mode/vocabulary'
      );
      expect(buildUrl('A1', 'Basics', 'grammar')).toBe(
        '/level/A1/category/basics/mode/grammar'
      );
    });

    it('builds URL with special characters in category', () => {
      expect(buildUrl('A1', 'Café & Food', 'vocabulary')).toBe(
        '/level/A1/category/cafe-food/mode/vocabulary'
      );
    });
  });

  describe('parseUrl', () => {
    it('parses root path', () => {
      expect(parseUrl('/')).toEqual({
        level: null,
        category: null,
        mode: null,
        stage: 'level-selection'
      });
    });

    it('parses empty pathname', () => {
      expect(parseUrl('')).toEqual({
        level: null,
        category: null,
        mode: null,
        stage: 'level-selection'
      });
    });

    it('parses level-only URL', () => {
      expect(parseUrl('/level/A1')).toEqual({
        level: 'A1',
        category: null,
        mode: null,
        stage: 'category-selection'
      });
    });

    it('parses level and category URL', () => {
      expect(parseUrl('/level/A1/category/basics')).toEqual({
        level: 'A1',
        category: 'Basics',
        mode: null,
        stage: 'mode-selection'
      });
    });

    it('parses full URL with mode', () => {
      expect(parseUrl('/level/A1/category/basics/mode/vocabulary')).toEqual({
        level: 'A1',
        category: 'Basics',
        mode: 'vocabulary',
        stage: 'practice'
      });
    });

    it('parses slug with multiple hyphens', () => {
      expect(parseUrl('/level/A1/category/city-landmarks/mode/grammar')).toEqual({
        level: 'A1',
        category: 'City Landmarks',
        mode: 'grammar',
        stage: 'practice'
      });
    });

    it('returns root state for invalid URL', () => {
      expect(parseUrl('/invalid/path')).toEqual({
        level: null,
        category: null,
        mode: null,
        stage: 'level-selection'
      });
    });

    it('returns root state for malformed URL', () => {
      expect(parseUrl('/level/')).toEqual({
        level: null,
        category: null,
        mode: null,
        stage: 'level-selection'
      });
    });
  });

  describe('validateUrlState', () => {
    const mockLevels = [
      { id: 'A1', name: 'A1', has_categories: true },
      { id: 'A2', name: 'A2', has_categories: false },
      { id: 'B1', name: 'B1', has_categories: false }
    ];

    const mockCategories = [
      { id: 1, name: 'Basics', slug: 'basics' },
      { id: 2, name: 'City Landmarks', slug: 'city-landmarks' },
      { id: 3, name: 'Food', slug: 'food' }
    ];

    it('returns level-selection for null level', () => {
      const result = validateUrlState(
        { level: null, category: null, mode: null, stage: 'level-selection' },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('level-selection');
      expect(result.level).toBeNull();
    });

    it('returns level-selection for non-existent level', () => {
      const result = validateUrlState(
        { level: 'C1', category: null, mode: null, stage: 'category-selection' },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('level-selection');
      expect(result.level).toBeNull();
    });

    it('redirects to practice for level without categories (A2)', () => {
      const result = validateUrlState(
        { level: 'A2', category: null, mode: null, stage: 'category-selection' },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('practice');
      expect(result.level).toBe('A2');
      expect(result.category).toBeNull();
    });

    it('redirects to category-selection for A1 without category', () => {
      const result = validateUrlState(
        { level: 'A1', category: null, mode: null, stage: 'category-selection' },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('category-selection');
      expect(result.level).toBe('A1');
      expect(result.category).toBeNull();
    });

    it('redirects to category-selection for non-existent category', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'NonExistent',
          mode: null,
          stage: 'mode-selection'
        },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('category-selection');
      expect(result.category).toBeNull();
    });

    it('corrects category name to canonical form', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'basics', // lowercase slug form
          mode: null,
          stage: 'mode-selection'
        },
        mockLevels,
        mockCategories
      );
      expect(result.category).toBe('Basics'); // canonical form
    });

    it('redirects to mode-selection for invalid mode', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'Basics',
          mode: 'invalid',
          stage: 'practice'
        },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('mode-selection');
      expect(result.mode).toBeNull();
    });

    it('validates correct practice state', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'Basics',
          mode: 'vocabulary',
          stage: 'practice'
        },
        mockLevels,
        mockCategories
      );
      expect(result.stage).toBe('practice');
      expect(result.level).toBe('A1');
      expect(result.category).toBe('Basics');
      expect(result.mode).toBe('vocabulary');
    });

    it('handles case-insensitive category matching', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'BASICS',
          mode: null,
          stage: 'mode-selection'
        },
        mockLevels,
        mockCategories
      );
      expect(result.category).toBe('Basics');
    });

    it('handles grammar mode', () => {
      const result = validateUrlState(
        {
          level: 'A1',
          category: 'Basics',
          mode: 'grammar',
          stage: 'practice'
        },
        mockLevels,
        mockCategories
      );
      expect(result.mode).toBe('grammar');
      expect(result.stage).toBe('practice');
    });
  });

  describe('shouldUpdateUrl', () => {
    it('returns true when URL differs from state', () => {
      const result = shouldUpdateUrl(
        '/level/A1',
        { level: 'A1', category: 'Basics', mode: null }
      );
      expect(result).toBe(true);
    });

    it('returns false when URL matches state', () => {
      const result = shouldUpdateUrl(
        '/level/A1/category/basics',
        { level: 'A1', category: 'Basics', mode: null }
      );
      expect(result).toBe(false);
    });

    it('handles full URL with mode', () => {
      const result = shouldUpdateUrl(
        '/level/A1/category/basics/mode/vocabulary',
        { level: 'A1', category: 'Basics', mode: 'vocabulary' }
      );
      expect(result).toBe(false);
    });

    it('detects slug differences', () => {
      const result = shouldUpdateUrl(
        '/level/A1/category/city-landmarks',
        { level: 'A1', category: 'City Landmarks', mode: null }
      );
      expect(result).toBe(false); // Should match due to slugification
    });
  });
});
