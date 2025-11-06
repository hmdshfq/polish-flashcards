import Breadcrumb from '../common/Breadcrumb';
import CategoryCard from '../common/CategoryCard';
import { useCategories } from '../../hooks/useCategories';
import { useCategoryCounts } from '../../hooks/useCategoryCounts';
import './CategorySelectionScreen.css';

function CategorySelectionScreen({ selectedLevel, onSelectCategory, onBack, vocabulary }) {
  // Fetch categories and their counts
  const { data: categoriesData } = useCategories(selectedLevel);
  const { counts } = useCategoryCounts(selectedLevel, categoriesData);

  // Get category names from the data, sorted by display_order
  const categories = categoriesData
    ? categoriesData
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(cat => cat.name)
    : [];

  // Category icons mapping
  const categoryIcons = {
    // A1 categories
    'Basics': '👋',
    'Colors': '🎨',
    'Countries': '🌍',
    'Numbers': '🔢',
    'City Landmarks': '🏛️',
    'Professions': '👔',
    'Food': '🍎',
    // A2 categories
    'Daily Routines & Time Management': '⏰',
    'Travel & Transportation': '✈️',
    'Shopping & Services': '🛍️',
    'Relationships & Social Interactions': '👥',
    'Food & Dining Culture': '🍽️',
    'Health & Body': '🏥',
    'Work & Professions': '💼',
    'Hobbies & Leisure': '🎮',
    'Education & Learning': '📚',
    'Clothes & Fashion': '👗'
  };

  // Get word count from counts map
  const getCategoryWordCount = (category) => {
    return counts[category] || 0;
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
