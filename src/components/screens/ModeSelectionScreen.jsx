import Breadcrumb from '../common/Breadcrumb';
import ModeCard from '../common/ModeCard';
import './ModeSelectionScreen.css';

function ModeSelectionScreen({ selectedLevel, selectedCategory, onSelectMode, onBack, onBackToLevelSelection, vocabulary }) {
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

  // Get level description
  const getLevelDescription = (level) => {
    const descriptions = {
      'A1': 'Beginner',
      'A2': 'Elementary',
      'B1': 'Intermediate'
    };
    return descriptions[level] || '';
  };

  return (
    <div className="mode-selection-screen">
      <Breadcrumb items={[
        {
          label: 'Levels',
          abbreviation: 'Levels',
          onClick: onBackToLevelSelection
        },
        {
          label: `${selectedLevel} (${getLevelDescription(selectedLevel)})`,
          abbreviation: selectedLevel,
          onClick: onBack
        },
        {
          label: selectedCategory,
          abbreviation: selectedCategory,
          onClick: null
        }
      ]} />

      <section className="mode-selection-content">
        <h2>Choose Practice Mode</h2>
        <div className="mode-cards">
          {modes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode.id}
              icon={mode.icon}
              label={mode.label}
              description={mode.description}
              count={mode.count}
              onClick={onSelectMode}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ModeSelectionScreen;
