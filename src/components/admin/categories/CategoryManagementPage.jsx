import { useState, useCallback } from 'react';
import { Edit, Trash2, ArrowRight } from 'lucide-react';
import { useAdminCategories } from '../../../hooks/admin/useAdminCategories';
import { useLevels } from '../../../hooks/useLevels';
import { DataTable } from '../../common/DataTable';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { CategoryFilters } from './CategoryFilters';
import { CategoryForm } from './CategoryForm';
import './CategoryManagementPage.css';

/**
 * Category management page
 * Allows admins to create, read, update, and delete categories
 */
export function CategoryManagementPage() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { data: levels } = useLevels();
  const { categories, loading, error, create, update, delete: deleteCategory } =
    useAdminCategories(selectedLevel);

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setActionLoading(true);
        setActionError(null);

        if (selectedCategory && formData.id) {
          // Update existing category
          await update(formData.id, {
            name: formData.name,
            description: formData.description
          });
          setActionSuccess('Category updated successfully');
        } else {
          // Create new category
          await create({
            name: formData.name,
            description: formData.description,
            level_id: formData.level_id
          });
          setActionSuccess('Category created successfully');
        }

        setIsFormOpen(false);
        setSelectedCategory(null);

        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to save category');
      } finally {
        setActionLoading(false);
      }
    },
    [selectedCategory, create, update]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id) => {
      try {
        setActionLoading(true);
        setActionError(null);
        await deleteCategory(id);
        setDeleteConfirmId(null);
        setActionSuccess('Category deleted successfully');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err) {
        setActionError(err.message || 'Failed to delete category');
      } finally {
        setActionLoading(false);
      }
    },
    [deleteCategory]
  );

  const handleOpenForm = (category = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleFiltersChange = useCallback((filters) => {
    setSelectedLevel(filters.level);
  }, []);

  // Get the selected level name
  const selectedLevelName =
    levels?.find((l) => l.id === selectedLevel)?.name || selectedLevel;

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (value) => <span className="cell-text">{value}</span>
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
      key: 'slug',
      label: 'Slug',
      sortable: false,
      render: (value) => (
        <span className="cell-badge">{value}</span>
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
            aria-label={`Edit category: ${row.name}`}
          >
            <Edit size={18} />
          </button>
          <button
            className="action-button delete"
            onClick={() => setDeleteConfirmId(row.id)}
            title="Delete"
            aria-label={`Delete category: ${row.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="category-management-page">
      <div className="page-header">
        <h1>Manage Categories</h1>
        {selectedLevel && (
          <button
            className="button-primary"
            onClick={() => handleOpenForm()}
            aria-label={`Create new category for ${selectedLevelName}`}
          >
            + New Category
          </button>
        )}
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
          Error loading categories: {error}
        </div>
      )}

      {/* Filters */}
      <CategoryFilters
        selectedLevel={selectedLevel}
        onFiltersChange={handleFiltersChange}
      />

      {/* Data table - only show if level is selected */}
      {selectedLevel ? (
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          error={error}
          selectable={false}
          emptyMessage="No categories found for this level. Create one to get started!"
          rowKey="id"
        />
      ) : (
        <div className="no-level-selected">
          <p className="flex items-center">
            <ArrowRight size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Select a level above to view and manage categories
          </p>
        </div>
      )}

      {/* Category form modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        selectedLevel={selectedLevel}
        loading={actionLoading}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Category"
        message={`Are you sure you want to delete this category? All flashcards in this category will remain but lose their category assignment. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
        isDangerous={true}
        loading={actionLoading}
      />
    </div>
  );
}
