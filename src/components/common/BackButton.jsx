import './BackButton.css';

function BackButton({ onClick, label = 'Back', ariaLabel }) {
  return (
    <button
      className="back-button"
      onClick={onClick}
      aria-label={ariaLabel || `Go back to ${label.toLowerCase()}`}
    >
      ← {label}
    </button>
  );
}

export default BackButton;
