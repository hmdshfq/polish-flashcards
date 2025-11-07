import { useRef, useEffect } from 'react';
import { X, Download, Upload } from 'lucide-react';
import ConnectionStatusAccordion from './ConnectionStatusAccordion';
import './AppSettingsModal.css';

function AppSettingsModal({ isOpen, onClose }) {
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
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
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

  const handleExport = () => {
    try {
      // Get progress data from localStorage
      const progressData = localStorage.getItem('userProgress');
      if (!progressData) {
        alert('No progress data to export');
        return;
      }

      const dataStr = JSON.stringify(JSON.parse(progressData), null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `polish-flashcards-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export progress:', error);
      alert('Failed to export progress data');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate the imported data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid progress file format');
        }

        // Merge with existing data or replace
        const confirmed = window.confirm(
          'This will merge the imported progress with your existing data. Continue?'
        );

        if (confirmed) {
          localStorage.setItem('userProgress', JSON.stringify(data));
          alert('Progress imported successfully!');
          // Optionally reload the page to reflect changes
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to import progress:', error);
        alert('Failed to import progress data. Please check the file format.');
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="app-settings-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="app-settings-title">
      <div className="app-settings-modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className="app-settings-header">
          <h3 id="app-settings-title">App Settings</h3>
          <button
            ref={closeButtonRef}
            className="app-settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        <div className="app-settings-content">
          {/* Connection Status Accordion */}
          <ConnectionStatusAccordion />

          {/* Data Management Section */}
          <div className="app-settings-section">
            <h4 className="app-settings-section-title">Data Management</h4>

            <button className="app-settings-action-btn" onClick={handleExport}>
              <Download size={20} />
              <span>Export Progress</span>
            </button>

            <button className="app-settings-action-btn" onClick={handleImport}>
              <Upload size={20} />
              <span>Import Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppSettingsModal;
