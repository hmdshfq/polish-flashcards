import { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalFooter } from '../../common/Modal';
import { useLevels } from '../../../hooks/useLevels';
import { useCategories } from '../../../hooks/useCategories';
import './FlashcardForm.css';

/**
 * Form for creating or editing flashcards
 * Displayed in a modal dialog
 */
export function FlashcardForm({
  isOpen = false,
  onClose = null,
  onSubmit = null,
  flashcard = null,
  loading = false
}) {
  const [formData, setFormData] = useState({
    polish: '',
    english: '',
    level_id: '',
    category_slug: '',
    mode: 'vocabulary'
  });

  const [errors, setErrors] = useState({});
  const { data: levels } = useLevels();
  const [selectedLevel, setSelectedLevel] = useState(flashcard?.level_id || '');
  const { data: categories } = useCategories(selectedLevel);

  // Initialize form with flashcard data if editing
  useEffect(() => {
    if (flashcard) {
      setFormData({
        polish: flashcard.polish || '',
        english: flashcard.english || '',
        level_id: flashcard.level_id || '',
        category_slug: flashcard.category_slug || '',
        mode: flashcard.mode || 'vocabulary'
      });
      setSelectedLevel(flashcard.level_id || '');
    } else {
      setFormData({
        polish: '',
        english: '',
        level_id: '',
        category_slug: '',
        mode: 'vocabulary'
      });
      setSelectedLevel('');
    }
    setErrors({});
  }, [flashcard, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.polish.trim()) {
      newErrors.polish = 'Polish translation is required';
    }

    if (!formData.english.trim()) {
      newErrors.english = 'English translation is required';
    }

    if (!formData.level_id) {
      newErrors.level_id = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setSelectedLevel(level);
    setFormData((prev) => ({
      ...prev,
      level_id: level,
      category_slug: '' // Reset category when level changes
    }));
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
        id: flashcard?.id
      });
      setFormData({
        polish: '',
        english: '',
        level_id: '',
        category_slug: '',
        mode: 'vocabulary'
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || 'Failed to save flashcard'
      }));
    }
  };

  const isEditing = !!flashcard;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Flashcard' : 'New Flashcard'}
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
            <label htmlFor="polish" className="form-label">
              Polish <span className="required">*</span>
            </label>
            <textarea
              id="polish"
              name="polish"
              value={formData.polish}
              onChange={handleChange}
              className={`form-input form-textarea ${errors.polish ? 'error' : ''}`}
              placeholder="Enter Polish word or phrase"
              disabled={loading}
              rows="3"
              aria-invalid={!!errors.polish}
              aria-describedby={errors.polish ? 'polish-error' : undefined}
            />
            {errors.polish && (
              <span id="polish-error" className="error-message">
                {errors.polish}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="english" className="form-label">
              English <span className="required">*</span>
            </label>
            <textarea
              id="english"
              name="english"
              value={formData.english}
              onChange={handleChange}
              className={`form-input form-textarea ${errors.english ? 'error' : ''}`}
              placeholder="Enter English translation"
              disabled={loading}
              rows="3"
              aria-invalid={!!errors.english}
              aria-describedby={errors.english ? 'english-error' : undefined}
            />
            {errors.english && (
              <span id="english-error" className="error-message">
                {errors.english}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="level" className="form-label">
                Level <span className="required">*</span>
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={handleLevelChange}
                className={`form-input ${errors.level_id ? 'error' : ''}`}
                disabled={loading}
                aria-invalid={!!errors.level_id}
                aria-describedby={errors.level_id ? 'level-error' : undefined}
              >
                <option value="">Select Level</option>
                {levels?.map((level) => (
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
            </div>

            {selectedLevel && categories && categories.length > 0 && (
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category_slug"
                  value={formData.category_slug}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mode" className="form-label">
              Mode
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="sentences">Sentences</option>
            </select>
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
