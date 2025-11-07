import { useCallback } from 'react';
import { useLevels } from '../../../hooks/useLevels';
import { useCategories } from '../../../hooks/useCategories';
import './FlashcardFilters.css';

/**
 * Filters for flashcard management
 * Allows filtering by level, category, and mode
 */
export function FlashcardFilters({
  selectedLevel,
  selectedCategory,
  selectedMode,
  onFiltersChange
}) {
  const { data: levels, loading: levelsLoading } = useLevels();
  const { data: categories, loading: categoriesLoading } = useCategories(selectedLevel);

  const handleLevelChange = useCallback(
    (e) => {
      const level = e.target.value || null;
      onFiltersChange({
        level,
        category: null, // Reset category when level changes
        mode: selectedMode
      });
    },
    [selectedMode, onFiltersChange]
  );

  const handleCategoryChange = useCallback(
    (e) => {
      const category = e.target.value || null;
      onFiltersChange({
        level: selectedLevel,
        category,
        mode: selectedMode
      });
    },
    [selectedLevel, selectedMode, onFiltersChange]
  );

  const handleModeChange = useCallback(
    (e) => {
      const mode = e.target.value || null;
      onFiltersChange({
        level: selectedLevel,
        category: selectedCategory,
        mode
      });
    },
    [selectedLevel, selectedCategory, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      level: null,
      category: null,
      mode: null
    });
  }, [onFiltersChange]);

  const hasActiveFilters = selectedLevel || selectedCategory || selectedMode;

  return (
    <div className="flashcard-filters">
      <div className="filters-group">
        <div className="filter-item">
          <label htmlFor="level-filter" className="filter-label">
            Level
          </label>
          <select
            id="level-filter"
            value={selectedLevel || ''}
            onChange={handleLevelChange}
            disabled={levelsLoading}
            className="filter-select"
          >
            <option value="">All Levels</option>
            {levels?.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name || level.id}
              </option>
            ))}
          </select>
        </div>

        {selectedLevel && (
          <div className="filter-item">
            <label htmlFor="category-filter" className="filter-label">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory || ''}
              onChange={handleCategoryChange}
              disabled={categoriesLoading || !selectedLevel}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-item">
          <label htmlFor="mode-filter" className="filter-label">
            Mode
          </label>
          <select
            id="mode-filter"
            value={selectedMode || ''}
            onChange={handleModeChange}
            className="filter-select"
          >
            <option value="">All Modes</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="sentences">Sentences</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="clear-filters-button"
            onClick={handleClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
