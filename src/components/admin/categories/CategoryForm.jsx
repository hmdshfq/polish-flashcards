import { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from '../../common/Modal';
import { useLevels } from '../../../hooks/useLevels';
import './CategoryForm.css';

/**
 * Form for creating or editing categories
 * Displayed in a modal dialog
 */
export function CategoryForm({
  isOpen = false,
  onClose = null,
  onSubmit = null,
  category = null,
  loading = false,
  selectedLevel = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level_id: selectedLevel || ''
  });

  const [errors, setErrors] = useState({});
  const { data: levels } = useLevels();

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        level_id: category.level_id || selectedLevel || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        level_id: selectedLevel || ''
      });
    }
    setErrors({});
  }, [category, isOpen, selectedLevel]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.level_id) {
      newErrors.level_id = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        id: category?.id
      });
      setFormData({
        name: '',
        description: '',
        level_id: selectedLevel || ''
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || 'Failed to save category'
      }));
    }
  };

  const isEditing = !!category;
  const levelsWithCategories = levels?.filter((l) => l.has_categories) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {errors.submit && (
            <div className="form-error-alert" role="alert">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Category Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Food, Animals, Family"
              disabled={loading}
              maxLength="100"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Optional: describe what this category covers"
              disabled={loading}
              rows="3"
              maxLength="500"
            />
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="level" className="form-label">
              Level <span className="required">*</span>
            </label>
            <select
              id="level"
              name="level_id"
              value={formData.level_id}
              onChange={handleChange}
              className={`form-input ${errors.level_id ? 'error' : ''}`}
              disabled={loading || isEditing}
              aria-invalid={!!errors.level_id}
              aria-describedby={errors.level_id ? 'level-error' : undefined}
            >
              <option value="">Select Level</option>
              {levelsWithCategories.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name || level.id}
                </option>
              ))}
            </select>
            {errors.level_id && (
              <span id="level-error" className="error-message">
                {errors.level_id}
              </span>
            )}
            {isEditing && (
              <span className="form-hint">Cannot change level when editing</span>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            className="button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
