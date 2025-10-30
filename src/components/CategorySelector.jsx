import './CategorySelector.css';

function CategorySelector({ selectedLevel, selectedCategory, onSelectLevel, onSelectCategory, vocabulary }) {
  const levels = [
    { id: 'A1', name: 'A1', description: 'Beginner' },
    { id: 'A2', name: 'A2', description: 'Elementary' },
    { id: 'B1', name: 'B1', description: 'Intermediate' },
  ];

  // Check if the selected level has categories
  const hasCategories = typeof vocabulary[selectedLevel] === 'object' && !Array.isArray(vocabulary[selectedLevel]);
  const categories = hasCategories ? Object.keys(vocabulary[selectedLevel]) : [];

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
    </div>
  );
}

export default CategorySelector;
