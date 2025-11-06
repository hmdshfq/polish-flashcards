import Breadcrumb from '../common/Breadcrumb';
import ModeCard from '../common/ModeCard';
import './ModeSelectionScreen.css';

function ModeSelectionScreen({ selectedLevel, selectedCategory, onSelectMode, onBack, onBackToLevelSelection, vocabulary, cards }) {
  // Calculate counts from actual cards data (handle null/undefined)
  const safeCards = cards || [];
  const vocabularyCount = safeCards.filter(card => card.mode === 'vocabulary').length;
  const grammarCount = safeCards.filter(card => card.mode === 'grammar').length;

  const modes = [
    {
      id: 'vocabulary',
      icon: '📚',
      label: 'Vocabulary',
      description: 'Practice individual words',
      count: vocabularyCount
    },
    {
      id: 'grammar',
      icon: '✍️',
      label: 'Grammar',
      description: 'Practice phrases & sentences',
      count: grammarCount
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
