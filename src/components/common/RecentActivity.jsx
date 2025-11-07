import './RecentActivity.css';

/**
 * RecentActivity Component
 * Displays recent actions in a clean, readable format
 *
 * @param {Object} props
 * @param {Array} props.activities - Array of activity objects
 * @param {number} props.maxItems - Maximum items to display (default: 5)
 * @param {function} props.onViewAll - Callback when "View all" is clicked
 */
export function RecentActivity({ activities = [], maxItems = 5, onViewAll }) {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return '+';
      case 'update':
        return '✎';
      case 'delete':
        return '−';
      case 'import':
        return '↓';
      default:
        return '•';
    }
  };

  const getActivityType = (type) => {
    switch (type) {
      case 'create':
        return 'Added';
      case 'update':
        return 'Updated';
      case 'delete':
        return 'Deleted';
      case 'import':
        return 'Imported';
      default:
        return 'Modified';
    }
  };

  const getRelativeTime = (date) => {
    try {
      const now = new Date();
      const activityDate = new Date(date);
      const seconds = Math.floor((now - activityDate) / 1000);

      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return `${Math.floor(seconds / 604800)}w ago`;
    } catch {
      return 'recently';
    }
  };

  if (displayedActivities.length === 0) {
    return (
      <div className="recent-activity-empty">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="activity-list">
        {displayedActivities.map((activity, index) => (
          <div key={activity.id || index} className={`activity-item activity-${activity.type}`}>
            <div className="activity-icon" aria-hidden="true">
              {getActivityIcon(activity.type)}
            </div>

            <div className="activity-content">
              <p className="activity-description">
                <span className="activity-action">{getActivityType(activity.type)}</span>
                {' '}
                <span className="activity-subject">{activity.subject}</span>
                {activity.category && (
                  <>
                    {' '}
                    <span className="activity-category">to {activity.category}</span>
                  </>
                )}
              </p>
              <time className="activity-time" dateTime={activity.timestamp}>
                {getRelativeTime(activity.timestamp)}
              </time>
            </div>
          </div>
        ))}
      </div>

      {activities.length > maxItems && onViewAll && (
        <button className="activity-view-all" onClick={onViewAll}>
          View all activity
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

/**
 * Mock activity data generator for development
 */
export const mockActivities = [
  {
    id: 1,
    type: 'create',
    subject: '"Dzień dobry"',
    category: 'A1 Greetings',
    timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
  },
  {
    id: 2,
    type: 'update',
    subject: '"Colours" category',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
  },
  {
    id: 3,
    type: 'import',
    subject: '50 flashcards',
    category: 'to B1',
    timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
  },
  {
    id: 4,
    type: 'create',
    subject: '"Weather" category',
    timestamp: new Date(Date.now() - 48 * 60 * 60000), // 2 days ago
  },
  {
    id: 5,
    type: 'update',
    subject: 'Admin level permissions',
    timestamp: new Date(Date.now() - 72 * 60 * 60000), // 3 days ago
  },
  {
    id: 6,
    type: 'delete',
    subject: 'Obsolete category',
    timestamp: new Date(Date.now() - 96 * 60 * 60000), // 4 days ago
  },
];
