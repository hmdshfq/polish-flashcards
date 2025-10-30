import './AudioControls.css';

function AudioControls({ isMuted, onToggleMute, speechRate, onSpeechRateChange }) {
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
  ];

  return (
    <div className="audio-controls">
      <button
        className={`audio-control-btn mute-btn ${isMuted ? 'muted' : ''}`}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? '🔇' : '🔊'}
        <span className="control-label">{isMuted ? 'Muted' : 'Audio On'}</span>
      </button>

      <div className="speed-control">
        <label htmlFor="speed-selector" className="speed-label">
          ⚡ Speed:
        </label>
        <select
          id="speed-selector"
          className="speed-selector"
          value={speechRate}
          onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
        >
          {speedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default AudioControls;
