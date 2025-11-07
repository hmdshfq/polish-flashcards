import { useState, useEffect } from 'react';
import './Alert.css';

/**
 * Alert Component
 * Displays toast notifications with auto-dismiss functionality
 *
 * @param {Object} props
 * @param {string} props.type - Type of alert: 'success', 'warning', 'error', 'info'
 * @param {string} props.message - Alert message to display
 * @param {function} props.onClose - Callback when alert is closed
 * @param {number} props.duration - Duration in ms before auto-dismiss (0 = no auto-dismiss)
 * @param {string} props.id - Unique identifier for the alert
 */
export function Alert({ type = 'info', message, onClose, duration = 5000, id }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      // Delay callback to allow animation to complete
      setTimeout(onClose, 300);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`alert alert-${type} ${isVisible ? 'alert-visible' : 'alert-hidden'}`} role="alert">
      <div className="alert-content">
        <span className={`alert-icon alert-icon-${type}`}>{getIcon()}</span>
        <p className="alert-message">{message}</p>
      </div>

      <button className="alert-close" onClick={handleClose} aria-label="Close alert">
        ×
      </button>

      {duration > 0 && <div className="alert-progress" style={{ width: `${progress}%` }}></div>}
    </div>
  );
}

/**
 * AlertProvider Context and Hook
 * Usage: Wrap your app with <AlertProvider>, then use useAlert() in components
 */

import { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const success = useCallback((message, duration) => addAlert(message, 'success', duration), [addAlert]);
  const warning = useCallback((message, duration) => addAlert(message, 'warning', duration), [addAlert]);
  const error = useCallback((message, duration) => addAlert(message, 'error', duration), [addAlert]);
  const info = useCallback((message, duration) => addAlert(message, 'info', duration), [addAlert]);

  return (
    <AlertContext.Provider value={{ addAlert, removeAlert, success, warning, error, info }}>
      {children}

      <div className="alert-container">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            id={alert.id}
            type={alert.type}
            message={alert.message}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

/**
 * Hook to use alerts
 * @returns {Object} Alert methods: success(), warning(), error(), info()
 */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
