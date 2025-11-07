import { useState, useEffect } from 'react';
import { ChevronDown, Settings, Folder, FileText, Trash2 } from 'lucide-react';
import './ConnectionStatusAccordion.css';

function ConnectionStatusAccordion() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clearMessage, setClearMessage] = useState(null);

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncTime(new Date());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
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
    <div className="connection-status-accordion">
      <button
        className={`connection-status-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="connection-status-details"
      >
        <span className="connection-status-header-left">
          <span className={`connection-status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
          <span className="connection-status-title">Connection Status</span>
        </span>
        <ChevronDown
          size={20}
          className="connection-status-chevron"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isExpanded && (
        <div id="connection-status-details" className="connection-status-details">
          <div className="connection-status-row">
            <span className="connection-status-label">Status:</span>
            <span className={`connection-status-value ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="connection-status-row">
            <span className="connection-status-label">Sync:</span>
            <span className="connection-status-value">Ready</span>
          </div>

          <div className="connection-status-row">
            <span className="connection-status-label">Last Sync:</span>
            <span className="connection-status-value">{formatLastSyncTime(lastSyncTime)}</span>
          </div>

          {!isOnline && (
            <div className="connection-status-notice">
              <strong>You're offline</strong>
              <p>Your progress is saved locally and will sync when you're back online.</p>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="connection-status-advanced-section">
            <button
              className="connection-status-advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-label={showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
              aria-expanded={showAdvanced}
            >
              <Settings size={18} />
              Advanced Settings
              <span className="connection-status-arrow">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="connection-status-advanced-panel">
                <div className="connection-status-cache-buttons">
                  <button
                    className="connection-status-cache-btn connection-status-cache-btn--indexeddb"
                    onClick={clearIndexedDB}
                    title="Clear IndexedDB cache"
                  >
                    <Folder size={16} />
                    Clear IndexedDB
                  </button>
                  <button
                    className="connection-status-cache-btn connection-status-cache-btn--storage"
                    onClick={clearLocalStorage}
                    title="Clear Local Storage cache metadata"
                  >
                    <FileText size={16} />
                    Clear Local Storage
                  </button>
                  <button
                    className="connection-status-cache-btn connection-status-cache-btn--all"
                    onClick={clearAllCache}
                    title="Clear all cache and reload"
                  >
                    <Trash2 size={16} />
                    Clear All Cache
                  </button>
                </div>

                {clearMessage && (
                  <div className="connection-status-clear-message">
                    {clearMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatusAccordion;
