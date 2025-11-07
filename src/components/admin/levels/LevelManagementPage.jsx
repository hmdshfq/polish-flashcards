import { useState, useCallback } from 'react';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { useAdminLevels } from '../../../hooks/admin/useAdminLevels';
import { DataTable } from '../../common/DataTable';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { LevelForm } from './LevelForm';
import './LevelManagementPage.css';

/**
 * Level management page
 * Allows admins to view and edit level metadata
 */
export function LevelManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { levels, loading, error, update } = useAdminLevels();

  // Handle form submission (update only, can't create new levels)
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setActionLoading(true);
        setActionError(null);

        await update(formData.id, {
          description: formData.description,
          display_order: formData.display_order,
          has_categories: formData.has_categories
        });

        setActionSuccess('Level updated successfully');
        setIsFormOpen(false);
        setSelectedLevel(null);

        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to save level');
      } finally {
        setActionLoading(false);
      }
    },
    [update]
  );

  const handleOpenForm = (level) => {
    setSelectedLevel(level);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLevel(null);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Level Name',
      sortable: true,
      render: (value) => <span className="cell-text level-name">{value}</span>
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <span className="cell-text cell-description">{value || '—'}</span>
      )
    },
    {
      key: 'display_order',
      label: 'Order',
      sortable: true,
      render: (value) => <span className="cell-order">{value}</span>
    },
    {
      key: 'has_categories',
      label: 'Categories',
      sortable: false,
      render: (value) => (
        <span className={`cell-badge ${value ? 'has' : 'none'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {value ? (
            <>
              <CheckCircle size={14} />
              Yes
            </>
          ) : (
            <>
              <XCircle size={14} />
              No
            </>
          )}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="cell-actions">
          <button
            className="action-button edit"
            onClick={() => handleOpenForm(row)}
            title="Edit"
            aria-label={`Edit level: ${row.name}`}
          >
            <Edit size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="level-management-page">
      <div className="page-header">
        <h1>Manage Levels</h1>
      </div>

      {/* Success message */}
      {actionSuccess && (
        <div className="success-alert" role="alert">
          {actionSuccess}
        </div>
      )}

      {/* Error message */}
      {actionError && (
        <div className="error-alert" role="alert">
          {actionError}
        </div>
      )}

      {/* Global error */}
      {error && (
        <div className="error-alert" role="alert">
          Error loading levels: {error}
        </div>
      )}

      {/* Info banner */}
      <div className="info-banner">
        <p>
          <strong>Note:</strong> Levels are predefined (A1, A2, B1) and cannot be created or deleted.
          You can only edit metadata like description and display order.
        </p>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={levels}
        loading={loading}
        error={error}
        selectable={false}
        emptyMessage="No levels found"
        rowKey="id"
      />

      {/* Level form modal */}
      <LevelForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        level={selectedLevel}
        loading={actionLoading}
      />
    </div>
  );
}
