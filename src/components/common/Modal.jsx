import { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * Reusable modal component with focus trap and accessibility features
 * Supports different sizes and customizable content
 */
export function Modal({
  isOpen = false,
  onClose = null,
  title = '',
  children = null,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true
}) {
  const modalRef = useRef(null);
  const dialogRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap: keep focus within modal when open
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    setTimeout(() => firstElement.focus(), 100);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === modalRef.current && onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`modal-dialog modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal header */}
        <div className="modal-header">
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          {showCloseButton && onClose && (
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        {/* Modal content */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

/**
 * Modal footer component for actions (OK, Cancel buttons)
 */
export function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}

/**
 * Modal body component for content wrapper
 */
export function ModalBody({ children }) {
  return <div className="modal-body">{children}</div>;
}
