import { useEffect, useRef } from 'react';
import './SettingsMenu.css';

function SettingsMenu({
  isOpen,
  onClose,
  onRestart
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

  return (
    <div className="settings-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-menu" onClick={(e) => e.stopPropagation()} ref={menuRef}>
        <div className="settings-menu__header">
          <h3 id="settings-title">Practice Settings</h3>
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
            <span className="settings-option__subtitle">Go back to the first card</span>
          </button>

          <div className="settings-section">
            <h4 className="settings-section__title">Audio Settings</h4>
            <p className="settings-section__placeholder">Audio controls coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
