import { Modal, ModalFooter, ModalBody } from './Modal';
import './ConfirmDialog.css';

/**
 * Confirmation dialog component
 * Used for delete confirmations and other destructive actions
 */
export function ConfirmDialog({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = null,
  onCancel = null,
  isDangerous = false,
  loading = false
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="sm"
      showCloseButton={true}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <ModalBody>
        <p className="confirm-message">{message}</p>
      </ModalBody>

      <ModalFooter>
        <button
          className="button-secondary"
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={`button-primary ${isDangerous ? 'button-danger' : ''}`}
          onClick={handleConfirm}
          disabled={loading}
          aria-label={confirmText}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}
