import Breadcrumb from '../common/Breadcrumb';
import CategoryCard from '../common/CategoryCard';
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
    <div className="category-selection-screen">
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

      <section className="category-selection-content">
        <h2>Choose a Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              name={category}
              icon={categoryIcons[category] || '📚'}
              wordCount={getCategoryWordCount(category)}
              onClick={onSelectCategory}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CategorySelectionScreen;
