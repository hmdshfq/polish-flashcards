import './ModeCard.css';

function ModeCard({ mode, icon, label, description, count, onClick, disabled }) {
  return (
    <button
      className="mode-card"
      onClick={() => !disabled && onClick(mode)}
      aria-label={`Select ${label} mode with ${count} flashcards${disabled ? ' (unavailable)' : ''}`}
      disabled={disabled}
      title={disabled ? `${label} mode is not available for this level` : ''}
    >
      <div className="mode-card__icon">{icon}</div>
      <div className="mode-card__label">{label}</div>
      <div className="mode-card__description">{description}</div>
      <div className="mode-card__count">{count} flashcards</div>
    </button>
  );
}

export default ModeCard;
