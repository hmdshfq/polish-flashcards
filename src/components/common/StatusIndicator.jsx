import { useState, useEffect } from 'react';
import { X, Database, RefreshCw, Signal, Folder, FileText, Trash2, Settings } from 'lucide-react';
import './StatusIndicator.css';

/**
 * StatusIndicator Component
 * Displays online/offline status and sync state
 * Shows connection status, sync progress, and last sync time
 *
 * Firestore handles sync automatically, so we mainly show online/offline status
 */
function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clearMessage, setClearMessage] = useState(null);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Update last sync time when coming back online
      setLastSyncTime(new Date());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial sync time from localStorage
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSyncTime(new Date(savedSyncTime));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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

  // Determine LED color class
  const getLEDClass = () => {
    if (isSyncing) return 'status-indicator__led--syncing';
    if (!isOnline) return 'status-indicator__led--offline';
    return 'status-indicator__led--online';
  };

  // Clear IndexedDB
  const clearIndexedDB = async () => {
    try {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        indexedDB.deleteDatabase(db.name);
      }
      setClearMessage('IndexedDB cleared successfully');
      setTimeout(() => setClearMessage(null), 3000);
    } catch {
      setClearMessage('Failed to clear IndexedDB');
      setTimeout(() => setClearMessage(null), 3000);
    }
  };

  // Clear localStorage cache metadata
  const clearLocalStorage = () => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith('cache-meta:')) {
          localStorage.removeItem(key);
        }
      }
      setClearMessage('Local Storage cache cleared successfully');
      setTimeout(() => setClearMessage(null), 3000);
    } catch {
      setClearMessage('Failed to clear Local Storage');
      setTimeout(() => setClearMessage(null), 3000);
    }
  };

  // Clear all cache
  const clearAllCache = async () => {
    await clearIndexedDB();
    clearLocalStorage();
    setClearMessage('All cache cleared. Reload page to fetch fresh data.');
    setTimeout(() => setClearMessage(null), 4000);
  };

  return (
    <div className="status-indicator">
      <button
        className={`status-indicator__button ${!isOnline ? 'status-indicator__button--offline' : ''} ${isSyncing ? 'status-indicator__button--syncing' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
        aria-label={getStatusMessage()}
        aria-expanded={showDetails}
      >
        <span className={`status-indicator__led ${getLEDClass()}`}>
          <span className="status-indicator__led-shine"></span>
        </span>
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
              <X size={20} />
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
                <span className="status-indicator__feature-icon">
                  <Database size={18} />
                </span>
                <span className="status-indicator__feature-text">Offline storage: Firestore cache</span>
              </div>
              <div className="status-indicator__feature">
                <span className="status-indicator__feature-icon">
                  <RefreshCw size={18} />
                </span>
                <span className="status-indicator__feature-text">Auto-sync: Enabled</span>
              </div>
              <div className="status-indicator__feature">
                <span className="status-indicator__feature-icon">
                  <Signal size={18} />
                </span>
                <span className="status-indicator__feature-text">Real-time updates: Active</span>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="status-indicator__advanced-section">
              <button
                className="status-indicator__advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
                aria-label={showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
                aria-expanded={showAdvanced}
              >
                <Settings size={18} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                Advanced Settings {showAdvanced ? '▼' : '▶'}
              </button>

              {showAdvanced && (
                <div className="status-indicator__advanced-panel">
                  <div className="status-indicator__cache-buttons">
                    <button
                      className="status-indicator__cache-btn status-indicator__cache-btn--indexeddb"
                      onClick={clearIndexedDB}
                      disabled={isSyncing}
                      title="Clear IndexedDB cache"
                    >
                      <Folder size={16} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                      Clear IndexedDB
                    </button>
                    <button
                      className="status-indicator__cache-btn status-indicator__cache-btn--storage"
                      onClick={clearLocalStorage}
                      disabled={isSyncing}
                      title="Clear Local Storage cache metadata"
                    >
                      <FileText size={16} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                      Clear Local Storage
                    </button>
                    <button
                      className="status-indicator__cache-btn status-indicator__cache-btn--all"
                      onClick={clearAllCache}
                      disabled={isSyncing}
                      title="Clear all cache and reload"
                    >
                      <Trash2 size={16} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                      Clear All Cache
                    </button>
                  </div>

                  {clearMessage && (
                    <div className="status-indicator__clear-message">
                      {clearMessage}
                    </div>
                  )}
                </div>
              )}
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
