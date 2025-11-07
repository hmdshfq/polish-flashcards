import './EmptyState.css';

/**
 * EmptyState Component
 * Displays helpful message when no data is available
 *
 * @param {Object} props
 * @param {string} props.type - Type of empty state: 'no-data', 'no-results', 'error', 'custom'
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.icon - Icon/emoji to display
 * @param {Object} props.action - Action button { label, onClick }
 * @param {Object} props.secondaryAction - Secondary action button { label, onClick }
 * @param {string} props.variant - Variant: 'default', 'compact'
 */
export function EmptyState({
  type = 'no-data',
  title = 'No data available',
  description = 'There is nothing to display right now.',
  icon = '📋',
  action,
  secondaryAction,
  variant = 'default',
}) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'no-results':
        return '🔍';
      case 'error':
        return '⚠';
      case 'no-data':
      default:
        return '📋';
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-icon" aria-hidden="true">
        {displayIcon}
      </div>

      <h2 className="empty-state-title">{title}</h2>

      {description && <p className="empty-state-description">{description}</p>}

      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {action && (
            <button className="btn-primary" onClick={action.onClick}>
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button className="btn-secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured empty state variants
 */

export function NoDataEmptyState({ title, description, action, variant }) {
  return (
    <EmptyState
      type="no-data"
      title={title || 'No data available'}
      description={description || 'Get started by creating your first item.'}
      icon="📋"
      action={action}
      variant={variant}
    />
  );
}

export function NoResultsEmptyState({ title, description, action, variant }) {
  return (
    <EmptyState
      type="no-results"
      title={title || 'No results found'}
      description={description || 'Try adjusting your search or filters.'}
      icon="🔍"
      action={action}
      variant={variant}
    />
  );
}

export function ErrorEmptyState({ title, description, action, variant }) {
  return (
    <EmptyState
      type="error"
      title={title || 'Something went wrong'}
      description={description || 'An error occurred while loading this content.'}
      icon="⚠"
      action={action}
      variant={variant}
    />
  );
}
