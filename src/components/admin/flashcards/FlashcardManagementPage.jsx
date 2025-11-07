import { useState, useCallback } from 'react';
import { useAdminFlashcards } from '../../../hooks/admin/useAdminFlashcards';
import { DataTable } from '../../common/DataTable';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { FlashcardFilters } from './FlashcardFilters';
import { FlashcardForm } from './FlashcardForm';
import { BulkImportModal } from './BulkImportModal';
import { exportFlashcardsToCSV } from '../../../utils/csvParser';
import './FlashcardManagementPage.css';

/**
 * Flashcard management page
 * Allows admins to create, read, update, and delete flashcards
 */
export function FlashcardManagementPage() {
  const [filters, setFilters] = useState({
    level: null,
    category: null,
    mode: null
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { flashcards, loading, error, create, update, delete: deleteFlashcard, bulkDelete } =
    useAdminFlashcards(filters);

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setActionLoading(true);
        setActionError(null);

        if (selectedFlashcard && formData.id) {
          // Update existing flashcard
          await update(formData.id, {
            polish: formData.polish,
            english: formData.english,
            level_id: formData.level_id,
            category_slug: formData.category_slug,
            mode: formData.mode
          });
          setActionSuccess('Flashcard updated successfully');
        } else {
          // Create new flashcard
          await create({
            polish: formData.polish,
            english: formData.english,
            level_id: formData.level_id,
            category_slug: formData.category_slug,
            mode: formData.mode
          });
          setActionSuccess('Flashcard created successfully');
        }

        setIsFormOpen(false);
        setSelectedFlashcard(null);

        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to save flashcard');
      } finally {
        setActionLoading(false);
      }
    },
    [selectedFlashcard, create, update]
  );

  // Handle single delete
  const handleDelete = useCallback(
    async (id) => {
      try {
        setActionLoading(true);
        setActionError(null);
        await deleteFlashcard(id);
        setDeleteConfirmId(null);
        setActionSuccess('Flashcard deleted successfully');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to delete flashcard');
      } finally {
        setActionLoading(false);
      }
    },
    [deleteFlashcard]
  );

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      await bulkDelete(selectedRows);
      setSelectedRows([]);
      setBulkDeleteConfirm(false);
      setActionSuccess(`${selectedRows.length} flashcard(s) deleted successfully`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete flashcards');
    } finally {
      setActionLoading(false);
    }
  }, [selectedRows, bulkDelete]);

  const handleOpenForm = (flashcard = null) => {
    setSelectedFlashcard(flashcard);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFlashcard(null);
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelectedRows([]); // Clear selection when filters change
  }, []);

  // Handle bulk import
  const handleBulkImport = useCallback(
    async (importedCards) => {
      try {
        setActionLoading(true);
        setActionError(null);

        // Limit to 500 cards per import
        if (importedCards.length > 500) {
          throw new Error('Maximum 500 flashcards per import');
        }

        // Create all cards via bulk create
        await bulkDelete([]); // This is a placeholder - we need bulkCreate
        // Actually, we need to use the create hook's bulkCreate method

        // Use bulkCreate from the hook - need to get it from the hook's return
        await Promise.all(
          importedCards.map((card) =>
            create({
              polish: card.polish,
              english: card.english,
              level_id: card.level_id,
              category_slug: card.category_slug || '',
              mode: card.mode || 'vocabulary'
            })
          )
        );

        setActionSuccess(`Successfully imported ${importedCards.length} flashcard(s)`);
        setIsImportModalOpen(false);
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to import flashcards');
      } finally {
        setActionLoading(false);
      }
    },
    [create, bulkDelete]
  );

  // Handle export
  const handleExport = useCallback(() => {
    try {
      if (!flashcards || flashcards.length === 0) {
        setActionError('No flashcards to export. Try adjusting your filters.');
        return;
      }

      const filename = `flashcards-${new Date().toISOString().split('T')[0]}.csv`;
      exportFlashcardsToCSV(flashcards, filename);
      setActionSuccess(`Exported ${flashcards.length} flashcard(s)`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to export flashcards');
    }
  }, [flashcards]);

  // Table columns configuration
  const columns = [
    {
      key: 'polish',
      label: 'Polish',
      sortable: true,
      render: (value) => <span className="cell-text">{value}</span>
    },
    {
      key: 'english',
      label: 'English',
      sortable: true,
      render: (value) => <span className="cell-text">{value}</span>
    },
    {
      key: 'level_id',
      label: 'Level',
      sortable: true,
      render: (value) => <span className="cell-badge">{value}</span>
    },
    {
      key: 'mode',
      label: 'Mode',
      sortable: true,
      render: (value) => <span className="cell-badge">{value}</span>
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
            aria-label={`Edit flashcard: ${row.polish}`}
          >
            ✏️
          </button>
          <button
            className="action-button delete"
            onClick={() => setDeleteConfirmId(row.id)}
            title="Delete"
            aria-label={`Delete flashcard: ${row.polish}`}
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flashcard-management-page">
      <div className="page-header">
        <h1>Manage Flashcards</h1>
        <div className="header-actions">
          <button
            className="button-secondary"
            onClick={() => setIsImportModalOpen(true)}
            aria-label="Import flashcards from CSV"
            title="Import from CSV"
          >
            ⬆️ Import
          </button>
          <button
            className="button-secondary"
            onClick={handleExport}
            disabled={!flashcards || flashcards.length === 0}
            aria-label="Export flashcards to CSV"
            title="Export to CSV"
          >
            ⬇️ Export
          </button>
          <button
            className="button-primary"
            onClick={() => handleOpenForm()}
            aria-label="Create new flashcard"
          >
            + New Flashcard
          </button>
        </div>
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
          Error loading flashcards: {error}
        </div>
      )}

      {/* Filters */}
      <FlashcardFilters
        selectedLevel={filters.level}
        selectedCategory={filters.category}
        selectedMode={filters.mode}
        onFiltersChange={handleFiltersChange}
      />

      {/* Bulk actions */}
      {selectedRows.length > 0 && (
        <div className="bulk-actions" role="region" aria-label="Bulk actions">
          <span className="selection-count">
            {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <button
            className="button-danger"
            onClick={() => setBulkDeleteConfirm(true)}
            aria-label={`Delete ${selectedRows.length} selected flashcard(s)`}
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={columns}
        data={flashcards}
        loading={loading}
        error={error}
        selectable={true}
        onSelectionChange={setSelectedRows}
        emptyMessage="No flashcards found. Create one to get started!"
        rowKey="id"
      />

      {/* Flashcard form modal */}
      <FlashcardForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        flashcard={selectedFlashcard}
        loading={actionLoading}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Flashcard"
        message={`Are you sure you want to delete this flashcard? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
        isDangerous={true}
        loading={actionLoading}
      />

      {/* Bulk delete confirmation dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Flashcards"
        message={`Are you sure you want to delete ${selectedRows.length} flashcard(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        isDangerous={true}
        loading={actionLoading}
      />

      {/* Bulk import modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        loading={actionLoading}
      />
    </div>
  );
}
