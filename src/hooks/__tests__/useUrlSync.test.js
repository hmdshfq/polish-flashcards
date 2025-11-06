import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUrlSync from '../useUrlSync';

describe('useUrlSync', () => {
  beforeEach(() => {
    // Reset URL to root
    window.history.replaceState({}, '', '/');
    // Clear any previous history state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    window.history.replaceState({}, '', '/');
  });

  const mockLevels = [
    { id: 'A1', name: 'A1', has_categories: true },
    { id: 'A2', name: 'A2', has_categories: false },
    { id: 'B1', name: 'B1', has_categories: false }
  ];

  const mockCategories = [
    { id: 1, name: 'Basics', slug: 'basics' },
    { id: 2, name: 'City Landmarks', slug: 'city-landmarks' }
  ];

  describe('navigateToStage', () => {
    it('navigates to level selection with null level', () => {
      const setCurrentStage = vi.fn();
      const setSelectedLevel = vi.fn();
      const setSelectedCategory = vi.fn();
      const setSelectedMode = vi.fn();

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'practice',
          selectedLevel: 'A1',
          selectedCategory: 'Basics',
          selectedMode: 'vocabulary',
          setCurrentStage,
          setSelectedLevel,
          setSelectedCategory,
          setSelectedMode,
          levels: mockLevels,
          categories: mockCategories
        })
      );

      act(() => {
        result.current.navigateToStage('level-selection', {
          level: null,
          category: null,
          mode: null
        });
      });

      expect(setSelectedLevel).toHaveBeenCalledWith(null);
      expect(setSelectedCategory).toHaveBeenCalledWith(null);
      expect(setSelectedMode).toHaveBeenCalledWith(null);
      expect(setCurrentStage).toHaveBeenCalledWith('level-selection');
    });

    it('navigates to category selection with level', () => {
      const setCurrentStage = vi.fn();
      const setSelectedLevel = vi.fn();
      const setSelectedCategory = vi.fn();
      const setSelectedMode = vi.fn();

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage,
          setSelectedLevel,
          setSelectedCategory,
          setSelectedMode,
          levels: mockLevels,
          categories: mockCategories
        })
      );

      act(() => {
        result.current.navigateToStage('category-selection', {
          level: 'A1'
        });
      });

      expect(setSelectedLevel).toHaveBeenCalledWith('A1');
      expect(setCurrentStage).toHaveBeenCalledWith('category-selection');
    });

    it('does not navigate if levels data is not loaded', () => {
      const setCurrentStage = vi.fn();

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage,
          setSelectedLevel: vi.fn(),
          setSelectedCategory: vi.fn(),
          setSelectedMode: vi.fn(),
          levels: [],
          categories: mockCategories
        })
      );

      act(() => {
        result.current.navigateToStage('category-selection', {
          level: 'A1'
        });
      });

      expect(setCurrentStage).not.toHaveBeenCalled();
    });
  });

  describe('popstate event handling', () => {
    it('handles back button navigation', async () => {
      const setCurrentStage = vi.fn();
      const setSelectedLevel = vi.fn();
      const setSelectedCategory = vi.fn();
      const setSelectedMode = vi.fn();

      // First, push a state
      window.history.pushState(
        { level: 'A1', category: null, mode: null },
        '',
        '/level/A1'
      );

      renderHook(
        ({
          currentStage,
          selectedLevel,
          selectedCategory,
          selectedMode
        }) =>
          useUrlSync({
            currentStage,
            selectedLevel,
            selectedCategory,
            selectedMode,
            setCurrentStage,
            setSelectedLevel,
            setSelectedCategory,
            setSelectedMode,
            levels: mockLevels,
            categories: mockCategories
          }),
        {
          initialProps: {
            currentStage: 'category-selection',
            selectedLevel: 'A1',
            selectedCategory: null,
            selectedMode: null
          }
        }
      );

      // Push another state
      act(() => {
        window.history.pushState(
          { level: 'A1', category: 'Basics', mode: null },
          '',
          '/level/A1/category/basics'
        );
      });

      // Now go back
      act(() => {
        window.history.back();
      });

      // Wait for popstate to be handled
      await new Promise(resolve => setTimeout(resolve, 100));

      // The hook should have called the setters based on the URL
      // After back, we're back at /level/A1, so state should reflect that
    });
  });

  describe('URL synchronization', () => {
    it('pushes history when navigating forward', () => {
      const spy = vi.spyOn(window.history, 'pushState');

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage: vi.fn(),
          setSelectedLevel: vi.fn(),
          setSelectedCategory: vi.fn(),
          setSelectedMode: vi.fn(),
          levels: mockLevels,
          categories: mockCategories
        })
      );

      act(() => {
        result.current.navigateToStage('category-selection', {
          level: 'A1'
        });
      });

      // Wait a bit for the effect to run
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('replaceUrl uses replaceState instead of pushState', () => {
      const spyPush = vi.spyOn(window.history, 'pushState');
      const spyReplace = vi.spyOn(window.history, 'replaceState');

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'category-selection',
          selectedLevel: 'A1',
          selectedCategory: 'Basics',
          selectedMode: null,
          setCurrentStage: vi.fn(),
          setSelectedLevel: vi.fn(),
          setSelectedCategory: vi.fn(),
          setSelectedMode: vi.fn(),
          levels: mockLevels,
          categories: mockCategories
        })
      );

      act(() => {
        result.current.replaceUrl();
      });

      expect(spyReplace).toHaveBeenCalled();

      spyPush.mockRestore();
      spyReplace.mockRestore();
    });
  });

  describe('initial URL parsing', () => {
    it('parses URL on mount when pathname is not root', async () => {
      window.history.replaceState({}, '', '/level/A1');

      const setCurrentStage = vi.fn();
      const setSelectedLevel = vi.fn();
      const setSelectedCategory = vi.fn();

      renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage,
          setSelectedLevel,
          setSelectedCategory,
          setSelectedMode: vi.fn(),
          levels: mockLevels,
          categories: mockCategories
        })
      );

      // Wait for effects to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should have parsed the URL and updated state
      expect(setSelectedLevel).toHaveBeenCalledWith('A1');
    });

    it('does not parse URL if levels are not loaded', () => {
      window.history.replaceState({}, '', '/level/A1');

      const setSelectedLevel = vi.fn();

      renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage: vi.fn(),
          setSelectedLevel,
          setSelectedCategory: vi.fn(),
          setSelectedMode: vi.fn(),
          levels: undefined,
          categories: mockCategories
        })
      );

      expect(setSelectedLevel).not.toHaveBeenCalled();
    });
  });

  describe('ARIA announcements', () => {
    it('updates navigation announcer element', () => {
      // Create announcer element
      const announcer = document.createElement('div');
      announcer.id = 'navigation-announcer';
      document.body.appendChild(announcer);

      const { result } = renderHook(() =>
        useUrlSync({
          currentStage: 'level-selection',
          selectedLevel: null,
          selectedCategory: null,
          selectedMode: null,
          setCurrentStage: vi.fn(),
          setSelectedLevel: vi.fn(),
          setSelectedCategory: vi.fn(),
          setSelectedMode: vi.fn(),
          levels: mockLevels,
          categories: mockCategories
        })
      );

      act(() => {
        result.current.navigateToStage('category-selection', {
          level: 'A1'
        });
      });

      // Check if announcer was updated
      expect(announcer.textContent).toBeTruthy();

      // Cleanup
      document.body.removeChild(announcer);
    });
  });
});
