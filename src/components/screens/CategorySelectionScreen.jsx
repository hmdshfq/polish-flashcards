import { useEffect } from 'react';
import {
  HandshakeIcon,
  Palette,
  Globe,
  Calculator,
  Landmark,
  Briefcase,
  Apple,
  Clock,
  Plane,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Heart,
  BookOpen,
  Shirt
} from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import CategoryCard from '../common/CategoryCard';
import { useCategories } from '../../hooks/useCategories';
import './CategorySelectionScreen.css';

function CategorySelectionScreen({ selectedLevel, onSelectCategory, onBack, vocabulary }) {
  // Fetch categories
  const { data: categoriesData } = useCategories(selectedLevel);

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

  // Get full category objects from the data, sorted by display_order
  const categories = categoriesData
    ? categoriesData.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    : [];

  const iconSize = 24;
  const iconColor = 'oklch(60% 0.14 150)';
  
  // Category icons mapping
  const categoryIcons = {
    // A1 categories
    'Basics': <HandshakeIcon size={iconSize} color={iconColor} />,
    'Colors': <Palette size={iconSize} color={iconColor} />,
    'Countries': <Globe size={iconSize} color={iconColor} />,
    'Numbers': <Calculator size={iconSize} color={iconColor} />,
    'City Landmarks': <Landmark size={iconSize} color={iconColor} />,
    'Professions': <Briefcase size={iconSize} color={iconColor} />,
    'Food': <Apple size={iconSize} color={iconColor} />,
    // A2 categories
    'Daily Routines & Time Management': <Clock size={iconSize} color={iconColor} />,
    'Travel & Transportation': <Plane size={iconSize} color={iconColor} />,
    'Shopping & Services': <ShoppingBag size={iconSize} color={iconColor} />,
    'Relationships & Social Interactions': <Users size={iconSize} color={iconColor} />,
    'Food & Dining Culture': <UtensilsCrossed size={iconSize} color={iconColor} />,
    'Health & Body': <Heart size={iconSize} color={iconColor} />,
    'Work & Professions': <Briefcase size={iconSize} color={iconColor} />,
    'Hobbies & Leisure': <BookOpen size={iconSize} color={iconColor} />,
    'Education & Learning': <BookOpen size={iconSize} color={iconColor} />,
    'Clothes & Fashion': <Shirt size={iconSize} color={iconColor} />
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
              key={category.id}
              category={category}
              icon={categoryIcons[category.name] || <BookOpen size={iconSize} color={iconColor} />}
              onClick={onSelectCategory}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CategorySelectionScreen;
