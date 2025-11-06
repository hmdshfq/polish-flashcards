import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the data fetching hooks
vi.mock('../hooks/useLevels', () => ({
  useLevels: () => ({
    data: [
      { id: 'A1', name: 'A1', has_categories: true },
      { id: 'A2', name: 'A2', has_categories: false },
      { id: 'B1', name: 'B1', has_categories: false }
    ],
    loading: false,
    error: null
  })
}));

vi.mock('../hooks/useCategories', () => ({
  useCategories: (levelId) => ({
    data:
      levelId === 'A1'
        ? [
            { id: 1, name: 'Basics', slug: 'basics' },
            { id: 2, name: 'Food', slug: 'food' }
          ]
        : [],
    loading: false
  })
}));

vi.mock('../hooks/useFlashcards', () => ({
  useFlashcards: (level, category, mode) => ({
    data:
      level && category && mode
        ? [
            { id: 1, polish: 'Tak', english: 'Yes' },
            { id: 2, polish: 'Nie', english: 'No' }
          ]
        : level && !category
          ? [
              { id: 3, polish: 'Cześć', english: 'Hello' },
              { id: 4, polish: 'Do widzenia', english: 'Goodbye' }
            ]
          : [],
    loading: false,
    error: null
  })
}));

// Mock child components to simplify testing
vi.mock('../components/screens/LevelSelectionScreen', () => ({
  default: ({ onSelectLevel }) => (
    <div>
      <h1>Choose Your Learning Level</h1>
      <button onClick={() => onSelectLevel('A1')}>A1</button>
      <button onClick={() => onSelectLevel('A2')}>A2</button>
    </div>
  )
}));

vi.mock('../components/screens/CategorySelectionScreen', () => ({
  default: ({ onSelectCategory, onBack }) => (
    <div>
      <h1>Choose a Category</h1>
      <button onClick={() => onSelectCategory('Basics')}>Basics</button>
      <button onClick={onBack}>Back</button>
    </div>
  )
}));

vi.mock('../components/screens/ModeSelectionScreen', () => ({
  default: ({ onSelectMode, onBack }) => (
    <div>
      <h1>Choose a Mode</h1>
      <button onClick={() => onSelectMode('vocabulary')}>Vocabulary</button>
      <button onClick={onBack}>Back</button>
    </div>
  )
}));

vi.mock('../components/screens/PracticeScreen', () => ({
  default: ({ selectedLevel, selectedCategory, onBackToLevelSelection }) => (
    <div>
      <h1>
        Practice -{' '}
        {selectedCategory
          ? `${selectedCategory} (${selectedLevel})`
          : selectedLevel}
      </h1>
      <button onClick={onBackToLevelSelection}>Back to Levels</button>
    </div>
  )
}));

vi.mock('../components/common/Footer', () => ({
  default: () => <footer>Footer</footer>
}));

vi.mock('../components/common/StatusIndicator', () => ({
  default: () => <div>Status Indicator</div>
}));

describe('App Navigation Integration Tests', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders level selection on root URL', () => {
    render(<App />);
    expect(screen.getByText('Choose Your Learning Level')).toBeInTheDocument();
  });

  it('updates URL when selecting a level', async () => {
    const user = userEvent.setup();
    render(<App />);

    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/level/A1');
    });
  });

  it('navigates to category selection when A1 is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    await waitFor(() => {
      expect(screen.getByText('Choose a Category')).toBeInTheDocument();
    });
  });

  it('navigates directly to practice for A2', async () => {
    const user = userEvent.setup();
    render(<App />);

    const a2Button = screen.getByRole('button', { name: 'A2' });
    await user.click(a2Button);

    await waitFor(() => {
      expect(screen.getByText('Practice - A2')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/level/A2');
    });
  });

  it('navigates through full A1 flow: level → category → mode → practice', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Select A1
    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    await waitFor(() => {
      expect(screen.getByText('Choose a Category')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/level/A1');
    });

    // Step 2: Select Category
    const basicsButton = screen.getByRole('button', { name: 'Basics' });
    await user.click(basicsButton);

    await waitFor(() => {
      expect(screen.getByText('Choose a Mode')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/level/A1/category/basics');
    });

    // Step 3: Select Mode
    const vocabButton = screen.getByRole('button', { name: 'Vocabulary' });
    await user.click(vocabButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Practice - Basics \(A1\)/)
      ).toBeInTheDocument();
      expect(window.location.pathname).toBe(
        '/level/A1/category/basics/mode/vocabulary'
      );
    });
  });

  it('back button returns to previous screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to category selection
    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    await waitFor(() => {
      expect(screen.getByText('Choose a Category')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByRole('button', { name: 'Back' });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning Level')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/');
    });
  });

  it('browser back button restores previous state', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate forward
    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/level/A1');
    });

    // Use browser back button
    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
      expect(screen.getByText('Choose Your Learning Level')).toBeInTheDocument();
    });
  });

  it('creates correct history entries for forward navigation', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(window.history, 'pushState');

    render(<App />);

    const a1Button = screen.getByRole('button', { name: 'A1' });
    await user.click(a1Button);

    // Should have pushed state to history
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('includes ARIA live region for announcements', () => {
    render(<App />);
    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();
  });

  it('includes skip link for keyboard navigation', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
  });

  it('main content has correct ID for skip link', () => {
    render(<App />);
    const mainContent = document.querySelector('main#main-content');
    expect(mainContent).toBeInTheDocument();
  });

  it('parses URL on direct access', async () => {
    window.history.replaceState({}, '', '/level/A1');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Choose a Category')).toBeInTheDocument();
    });
  });

  it('parses full A1 practice URL on direct access', async () => {
    window.history.replaceState(
      {},
      '',
      '/level/A1/category/basics/mode/vocabulary'
    );

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/Practice - Basics \(A1\)/)
      ).toBeInTheDocument();
    });
  });

  it('redirects invalid URLs to level selection', async () => {
    window.history.replaceState({}, '', '/invalid/url/path');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning Level')).toBeInTheDocument();
    });
  });

  it('maintains history state through navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a navigation path
    await user.click(screen.getByRole('button', { name: 'A1' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/level/A1');
    });

    await user.click(screen.getByRole('button', { name: 'Basics' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/level/A1/category/basics');
    });

    // Go back should navigate to A1
    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toBe('/level/A1');
    });

    // Go back again should navigate to root
    window.history.back();
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});
