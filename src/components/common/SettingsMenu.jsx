import { useEffect, useRef } from 'react';
import Breadcrumb from './Breadcrumb';
import './SettingsMenu.css';

function SettingsMenu({
  isOpen,
  onClose,
  selectedLevel,
  selectedCategory,
  selectedMode,
  onRestart,
  onBackToModeSelection,
  onBackToCategorySelection,
  onBackToLevelSelection
}) {
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  // Build breadcrumb
  const getLevelDescription = (level) => {
    const descriptions = { 'A1': 'Beginner', 'A2': 'Elementary', 'B1': 'Intermediate' };
    return descriptions[level] || '';
  };

  const breadcrumbItems = [`Level: ${selectedLevel} (${getLevelDescription(selectedLevel)})`];
  if (selectedCategory) breadcrumbItems.push(selectedCategory);
  if (selectedMode) breadcrumbItems.push(selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1));

  return (
    <div className="settings-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-menu" onClick={(e) => e.stopPropagation()} ref={menuRef}>
        <div className="settings-menu__header">
          <h3 id="settings-title">Settings</h3>
          <button
            ref={closeButtonRef}
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-menu__content">
          <button className="settings-option" onClick={onRestart}>
            <span className="settings-option__icon">🔄</span>
            <span className="settings-option__label">Restart Current</span>
          </button>

          {selectedMode && onBackToModeSelection && (
            <button className="settings-option" onClick={onBackToModeSelection}>
              <span className="settings-option__icon">←</span>
              <span className="settings-option__label">Change Mode</span>
              <span className="settings-option__subtitle">(Vocabulary/Grammar)</span>
            </button>
          )}

          {selectedCategory && onBackToCategorySelection && (
            <button className="settings-option" onClick={onBackToCategorySelection}>
              <span className="settings-option__icon">←</span>
              <span className="settings-option__label">Change Category</span>
              <span className="settings-option__subtitle">(Basics, Colors...)</span>
            </button>
          )}

          <button className="settings-option" onClick={onBackToLevelSelection}>
            <span className="settings-option__icon">←</span>
            <span className="settings-option__label">Change Level</span>
            <span className="settings-option__subtitle">(A1, A2, B1)</span>
          </button>

          <div className="current-selection">
            <strong>Current Selection:</strong>
            <div className="current-selection__breadcrumb">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
