import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__icon" role="status" aria-live="polite">
        <div className="spinner"></div>
      </div>
      <p className="loading-spinner__message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
