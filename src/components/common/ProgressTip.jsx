import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import './ProgressTip.css';

function ProgressTip() {
  const [isVisible, setIsVisible] = useState(false);

  // Initialize visibility based on localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('hideProgressTip') === 'true';
    setIsVisible(!isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hideProgressTip', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="progress-tip" role="note" aria-label="Progress backup tip">
      <div className="progress-tip-content">
        <Info size={20} className="progress-tip-icon" aria-hidden="true" />
        <p>Your progress is saved locally on this device. Use the Settings menu to export your progress as a backup or import progress from another device.</p>
      </div>
      <button
        className="progress-tip-close"
        onClick={handleDismiss}
        aria-label="Dismiss progress tip"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default ProgressTip;
