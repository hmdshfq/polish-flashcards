import './CategorySelector.css';

function CategorySelector({ selectedLevel, selectedCategory, selectedMode, onSelectLevel, onSelectCategory, onSelectMode, vocabulary }) {
  const levels = [
    { id: 'A1', name: 'A1', description: 'Beginner' },
    { id: 'A2', name: 'A2', description: 'Elementary' },
    { id: 'B1', name: 'B1', description: 'Intermediate' },
  ];

  // Check if the selected level has categories
  const hasCategories = typeof vocabulary[selectedLevel] === 'object' && !Array.isArray(vocabulary[selectedLevel]);
  const categories = hasCategories ? Object.keys(vocabulary[selectedLevel]) : [];

  // Check if the selected category has modes (vocabulary/sentences)
  const hasModes = hasCategories && selectedCategory && typeof vocabulary[selectedLevel][selectedCategory] === 'object' && vocabulary[selectedLevel][selectedCategory].vocabulary;

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

      {hasCategories && (
        <>
          <h3>Choose a Category</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => onSelectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </>
      )}

      {hasModes && (
        <>
          <h3>Choose Practice Mode</h3>
          <div className="mode-buttons">
            <button
              className={`mode-button ${selectedMode === 'vocabulary' ? 'active' : ''}`}
              onClick={() => onSelectMode('vocabulary')}
            >
              <span className="mode-icon">📚</span>
              <span className="mode-label">Vocabulary</span>
              <span className="mode-desc">Practice individual words</span>
            </button>
            <button
              className={`mode-button ${selectedMode === 'sentences' ? 'active' : ''}`}
              onClick={() => onSelectMode('sentences')}
            >
              <span className="mode-icon">✍️</span>
              <span className="mode-label">Sentences</span>
              <span className="mode-desc">Practice phrases & sentences</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CategorySelector;
