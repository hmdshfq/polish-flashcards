import { useState, useEffect } from 'react';
import './StatusIndicator.css';

/**
 * StatusIndicator Component
 * Displays online/offline status and sync state
 * Shows connection status, sync progress, and last sync time
 */
function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync events from service worker
    const handleServiceWorkerMessage = (event) => {
      if (event.data.type === 'sync-start') {
        setIsSyncing(true);
      } else if (event.data.type === 'sync-complete') {
        setIsSyncing(false);
        setLastSyncTime(new Date());
      } else if (event.data.type === 'sync-error') {
        setIsSyncing(false);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Set initial sync time from localStorage
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSyncTime(new Date(savedSyncTime));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Format last sync time
  const formatLastSyncTime = (date) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  // Determine status message
  const getStatusMessage = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    return 'Online';
  };

  // Determine status icon
  const getStatusIcon = () => {
    if (isSyncing) return '↻';
    if (!isOnline) return '✗';
    return '✓';
  };

  return (
    <div className="status-indicator">
      <button
        className={`status-indicator__button ${!isOnline ? 'status-indicator__button--offline' : ''} ${isSyncing ? 'status-indicator__button--syncing' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
        aria-label={getStatusMessage()}
        aria-expanded={showDetails}
      >
        <span className="status-indicator__icon">{getStatusIcon()}</span>
        <span className="status-indicator__text">{getStatusMessage()}</span>
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="status-indicator__panel" role="complementary">
          <div className="status-indicator__panel-header">
            <h3>Connection Status</h3>
            <button
              className="status-indicator__close"
              onClick={() => setShowDetails(false)}
              aria-label="Close status details"
            >
              ✕
            </button>
          </div>

          <div className="status-indicator__details">
            {/* Connection Status */}
            <div className="status-indicator__row">
              <span className="status-indicator__label">Status:</span>
              <span
                className={`status-indicator__value ${!isOnline ? 'status-indicator__value--offline' : ''}`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Sync Status */}
            <div className="status-indicator__row">
              <span className="status-indicator__label">Sync:</span>
              <span
                className={`status-indicator__value ${isSyncing ? 'status-indicator__value--syncing' : ''}`}
              >
                {isSyncing ? 'In progress...' : 'Ready'}
              </span>
            </div>

            {/* Last Sync Time */}
            <div className="status-indicator__row">
              <span className="status-indicator__label">Last Sync:</span>
              <span className="status-indicator__value">
                {formatLastSyncTime(lastSyncTime)}
              </span>
            </div>

            {/* Features Indicator */}
            <div className="status-indicator__features">
              <div className="status-indicator__feature">
                <span className="status-indicator__feature-icon">💾</span>
                <span className="status-indicator__feature-text">Offline storage: Enabled</span>
              </div>
              <div className="status-indicator__feature">
                <span className="status-indicator__feature-icon">⚙️</span>
                <span className="status-indicator__feature-text">Service Worker: Active</span>
              </div>
              <div className="status-indicator__feature">
                <span className="status-indicator__feature-icon">📊</span>
                <span className="status-indicator__feature-text">Auto-sync: Enabled</span>
              </div>
            </div>

            {/* Offline Notice */}
            {!isOnline && (
              <div className="status-indicator__notice status-indicator__notice--offline">
                <strong>You're offline</strong>
                <p>Your progress is saved locally and will sync when you're back online.</p>
              </div>
            )}

            {/* Syncing Notice */}
            {isSyncing && (
              <div className="status-indicator__notice status-indicator__notice--syncing">
                <strong>Syncing progress...</strong>
                <p>Your updates are being saved to the cloud.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop (click to close) */}
      {showDetails && (
        <div
          className="status-indicator__backdrop"
          onClick={() => setShowDetails(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default StatusIndicator;
