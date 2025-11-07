import { useState, useEffect } from 'react';
import './DataTable.css';

/**
 * Reusable data table component with sorting, filtering, and row selection
 * Supports both desktop and mobile views
 */
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onSort = null,
  selectable = false,
  onSelectionChange = null,
  emptyMessage = 'No data available',
  rowKey = 'id'
}) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Attach resize listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSort = (columnKey) => {
    let newDirection = 'asc';
    if (sortBy === columnKey && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    setSortBy(columnKey);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(columnKey, newDirection);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(data.map((row) => row[rowKey]));
      setSelectedRows(allIds);
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIds));
      }
    } else {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (rowId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedRows);

    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }

    setSelectedRows(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  if (loading) {
    return (
      <div className="data-table-container">
        <div className="data-table-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row">
              {[...Array(columns.length)].map((_, j) => (
                <div key={j} className="skeleton-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-error" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="data-table-cards">
        {data.map((row) => (
          <div key={row[rowKey]} className="data-card">
            {selectable && (
              <input
                type="checkbox"
                className="card-checkbox"
                checked={selectedRows.has(row[rowKey])}
                onChange={(e) => handleSelectRow(row[rowKey], e)}
                aria-label={`Select row ${row[rowKey]}`}
              />
            )}
            {columns.map((column) => (
              <div key={column.key} className="card-field">
                <span className="card-label">{column.label}</span>
                <span className="card-value">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="data-table-container">
      <table className="data-table" role="grid">
        <thead>
          <tr role="row">
            {selectable && (
              <th role="columnheader" className="table-cell table-checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                className={`table-cell ${column.sortable ? 'sortable' : ''}`}
              >
                {column.sortable ? (
                  <button
                    className="sort-button"
                    onClick={() => handleSort(column.key)}
                    aria-label={`Sort by ${column.label}`}
                  >
                    {column.label}
                    {sortBy === column.key && (
                      <span className="sort-icon">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[rowKey]} role="row" className="table-row">
              {selectable && (
                <td className="table-cell table-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row[rowKey])}
                    onChange={(e) => handleSelectRow(row[rowKey], e)}
                    aria-label={`Select row ${row[rowKey]}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="table-cell">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
