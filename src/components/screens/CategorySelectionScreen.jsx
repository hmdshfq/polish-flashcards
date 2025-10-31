import './CategorySelectionScreen.css';

function CategorySelectionScreen({ selectedLevel, onSelectCategory, onBack, vocabulary }) {
  // Get categories for the selected level
  const categories = Object.keys(vocabulary[selectedLevel] || {});

  // Category icons mapping
  const categoryIcons = {
    'Basics': '👋',
    'Colors': '🎨',
    'Countries': '🌍',
    'Numbers': '🔢',
    'City Landmarks': '🏛️',
    'Professions': '👔',
    'Food': '🍎'
  };

  // Calculate word count for each category
  const getCategoryWordCount = (category) => {
    const categoryData = vocabulary[selectedLevel][category];
    if (categoryData.vocabulary) {
      return categoryData.vocabulary.length;
    }
    return 0;
  };

  return (
    <div className="category-selection-screen">
      <button className="back-button" onClick={onBack} aria-label="Go back to level selection">
        ← Back to Levels
      </button>

      <div className="level-badge">
        Level: {selectedLevel} ({selectedLevel === 'A1' ? 'Beginner' : selectedLevel === 'A2' ? 'Elementary' : 'Intermediate'})
      </div>

      <section className="category-selection-content">
        <h2>Choose a Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category}
              className="category-card"
              onClick={() => onSelectCategory(category)}
              aria-label={`Select ${category} category with ${getCategoryWordCount(category)} words`}
            >
              <div className="category-card__icon">{categoryIcons[category] || '📚'}</div>
              <div className="category-card__name">{category}</div>
              <div className="category-card__count">{getCategoryWordCount(category)} words</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CategorySelectionScreen;
