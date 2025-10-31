import './ModeSelectionScreen.css';

function ModeSelectionScreen({ selectedLevel, selectedCategory, onSelectMode, onBack, vocabulary }) {
  // Get the category data
  const categoryData = vocabulary[selectedLevel]?.[selectedCategory] || {};

  const modes = [
    {
      id: 'vocabulary',
      icon: '📚',
      label: 'Vocabulary',
      description: 'Practice individual words',
      count: categoryData.vocabulary?.length || 0
    },
    {
      id: 'grammar',
      icon: '✍️',
      label: 'Grammar',
      description: 'Practice phrases & sentences',
      count: categoryData.grammar?.length || 0
    }
  ];

  return (
    <div className="mode-selection-screen">
      <button className="back-button" onClick={onBack} aria-label="Go back to category selection">
        ← Back to Categories
      </button>

      <div className="breadcrumb">
        Level: {selectedLevel} ({selectedLevel === 'A1' ? 'Beginner' : selectedLevel === 'A2' ? 'Elementary' : 'Intermediate'}) › {selectedCategory}
      </div>

      <section className="mode-selection-content">
        <h2>Choose Practice Mode</h2>
        <div className="mode-cards">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className="mode-card"
              onClick={() => onSelectMode(mode.id)}
              aria-label={`Select ${mode.label} mode with ${mode.count} flashcards`}
            >
              <div className="mode-card__icon">{mode.icon}</div>
              <div className="mode-card__label">{mode.label}</div>
              <div className="mode-card__description">{mode.description}</div>
              <div className="mode-card__count">{mode.count} flashcards</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ModeSelectionScreen;
