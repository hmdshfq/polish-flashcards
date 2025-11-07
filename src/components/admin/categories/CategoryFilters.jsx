import { useCallback } from 'react';
import { useLevels } from '../../../hooks/useLevels';
import './CategoryFilters.css';

/**
 * Filters for category management
 * Allows filtering by level
 */
export function CategoryFilters({ selectedLevel, onFiltersChange }) {
  const { data: levels, loading: levelsLoading } = useLevels();

  const handleLevelChange = useCallback(
    (e) => {
      const level = e.target.value || null;
      onFiltersChange({ level });
    },
    [onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({ level: null });
  }, [onFiltersChange]);

  return (
    <div className="category-filters">
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
              <option key={level.id} value={level.id} disabled={!level.has_categories}>
                {level.name || level.id}
                {!level.has_categories ? ' (no categories)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedLevel && (
          <button
            className="clear-filters-button"
            onClick={handleClearFilters}
            aria-label="Clear filters"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
