import './LevelSelectionScreen.css';

function LevelSelectionScreen({ onSelectLevel }) {
  const levels = [
    {
      id: 'A1',
      name: 'A1',
      description: 'Beginner',
      helperText: 'Perfect for getting started with Polish'
    },
    {
      id: 'A2',
      name: 'A2',
      description: 'Elementary',
      helperText: 'Build on basic knowledge'
    },
    {
      id: 'B1',
      name: 'B1',
      description: 'Intermediate',
      helperText: 'Advance your skills'
    },
  ];

  return (
    <div className="level-selection-screen">
      <header className="level-selection-header">
        <h1>🇵🇱 Flashy Polish</h1>
        <p>Learn Polish at your own pace</p>
      </header>

      <section className="level-selection-content">
        <h2>Choose Your Learning Level</h2>
        <div className="level-cards">
          {levels.map((level) => (
            <button
              key={level.id}
              className="level-card"
              onClick={() => onSelectLevel(level.id)}
              aria-label={`Select ${level.name} ${level.description} level. ${level.helperText}`}
            >
              <div className="level-card__name">{level.name}</div>
              <div className="level-card__description">{level.description}</div>
              <div className="level-card__helper">{level.helperText}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LevelSelectionScreen;
