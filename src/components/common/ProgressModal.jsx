import { useEffect, useRef } from 'react';
import ProgressStats from './ProgressStats';
import './ProgressModal.css';

function ProgressModal({
  isOpen,
  onClose,
  cards,
  progress,
  loading
}) {
  const modalRef = useRef(null);
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

      const focusableElements = modalRef.current?.querySelectorAll(
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
    <div className="progress-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="progress-title">
      <div className="progress-modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className="progress-modal__header">
          <h3 id="progress-title">Learning Progress</h3>
          <button
            ref={closeButtonRef}
            className="progress-close"
            onClick={onClose}
            aria-label="Close progress stats"
          >
            ✕
          </button>
        </div>

        <div className="progress-modal__content">
          <ProgressStats
            cards={cards}
            progress={progress}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default ProgressModal;
