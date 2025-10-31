import './LevelCard.css';

function LevelCard({ id, name, description, helperText, onClick, isSelected = false }) {
  return (
    <button
      className={`level-card ${isSelected ? 'level-card--selected' : ''}`}
      onClick={() => onClick(id)}
      aria-label={`Select ${name} ${description} level. ${helperText}`}
      aria-pressed={isSelected}
    >
      <div className="level-card__name">{name}</div>
      <div className="level-card__description">{description}</div>
      <div className="level-card__helper">{helperText}</div>
    </button>
  );
}

export default LevelCard;
