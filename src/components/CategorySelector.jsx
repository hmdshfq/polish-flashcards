import './CategorySelector.css';

function CategorySelector({ selectedLevel, onSelectLevel }) {
  const levels = [
    { id: 'A1', name: 'A1', description: 'Beginner' },
    { id: 'A2', name: 'A2', description: 'Elementary' },
    { id: 'B1', name: 'B1', description: 'Intermediate' },
  ];

  return (
    <div className="category-selector">
      <h2>Choose Your Level</h2>
      <div className="level-buttons">
        {levels.map((level) => (
          <button
            key={level.id}
            className={`level-button ${selectedLevel === level.id ? 'active' : ''}`}
            onClick={() => onSelectLevel(level.id)}
          >
            <span className="level-name">{level.name}</span>
            <span className="level-description">{level.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;
