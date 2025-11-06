import LevelCard from '../common/LevelCard';
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
      <section className="level-selection-content">
        <h2>Choose Your Learning Level</h2>
        <div className="level-cards">
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              id={level.id}
              name={level.name}
              description={level.description}
              helperText={level.helperText}
              onClick={onSelectLevel}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default LevelSelectionScreen;
