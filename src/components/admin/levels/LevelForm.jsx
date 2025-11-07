import { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from '../../common/Modal';
import './LevelForm.css';

/**
 * Form for editing level metadata
 * Displayed in a modal dialog
 */
export function LevelForm({
  isOpen = false,
  onClose = null,
  onSubmit = null,
  level = null,
  loading = false
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
    has_categories: false
  });

  const [errors, setErrors] = useState({});

  // Initialize form with level data
  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name || '',
        description: level.description || '',
        display_order: level.display_order ?? 0,
        has_categories: level.has_categories ?? false
      });
    }
    setErrors({});
  }, [level, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Level name is required';
    }

    if (formData.display_order === null || formData.display_order === '') {
      newErrors.display_order = 'Display order is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
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
        id: level?.id
      });
      setFormData({
        name: '',
        description: '',
        display_order: 0,
        has_categories: false
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || 'Failed to save level'
      }));
    }
  };

  const isEditing = !!level;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Level' : 'New Level'}
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
              Level Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., A1, A2, B1"
              disabled={loading || isEditing}
              maxLength="10"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message">
                {errors.name}
              </span>
            )}
            {isEditing && (
              <span className="form-hint">Cannot change level name when editing</span>
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
              placeholder="Describe this proficiency level"
              disabled={loading}
              rows="3"
              maxLength="500"
            />
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="display_order" className="form-label">
              Display Order <span className="required">*</span>
            </label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              className={`form-input ${errors.display_order ? 'error' : ''}`}
              disabled={loading}
              min="0"
              aria-invalid={!!errors.display_order}
              aria-describedby={errors.display_order ? 'display-order-error' : undefined}
            />
            {errors.display_order && (
              <span id="display-order-error" className="error-message">
                {errors.display_order}
              </span>
            )}
            <span className="form-hint">Lower numbers appear first</span>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="has_categories" className="checkbox-label">
              <input
                type="checkbox"
                id="has_categories"
                name="has_categories"
                checked={formData.has_categories}
                onChange={handleChange}
                disabled={loading}
              />
              <span>This level has categories</span>
            </label>
            <span className="form-hint">
              Only A1 should have this enabled (for vocabulary organization)
            </span>
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
