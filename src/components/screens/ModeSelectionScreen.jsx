import { useEffect } from 'react';
import { BookOpen, PenTool } from 'lucide-react';
import { useFlashcards } from '../../hooks/useFlashcards';
import Breadcrumb from '../common/Breadcrumb';
import ModeCard from '../common/ModeCard';
import './ModeSelectionScreen.css';

function ModeSelectionScreen({ selectedLevel, onSelectMode, onBack }) {
  const { data: cards } = useFlashcards(selectedLevel, null, null);

  // Calculate counts from actual cards data (handle null/undefined)
  const safeCards = cards || [];
  const vocabularyCount = safeCards.filter(card => card.mode === 'vocabulary').length;
  const sentencesCount = safeCards.filter(card => card.mode === 'sentences').length;

  // Check if B1 level (only has vocabulary, no sentences)
  const isBOneLevel = selectedLevel === 'B1';

  // Handle Escape key to go back
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  const iconSize = 24;
  const iconColor = 'oklch(60% 0.14 150)';

  const modes = [
    {
      id: 'vocabulary',
      icon: <BookOpen size={iconSize} color={iconColor} />,
      label: 'Vocabulary',
      description: 'Practice individual words',
      count: vocabularyCount,
      disabled: false
    },
    {
      id: 'sentences',
      icon: <PenTool size={iconSize} color={iconColor} />,
      label: 'Sentences',
      description: 'Practice phrases & sentences',
      count: sentencesCount,
      disabled: isBOneLevel
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
          onClick: onBack
        },
        {
          label: `${selectedLevel} (${getLevelDescription(selectedLevel)})`,
          abbreviation: selectedLevel,
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
              disabled={mode.disabled}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ModeSelectionScreen;
