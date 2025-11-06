import './CategoryCard.css';

function CategoryCard({ category, icon, wordCount, onClick }) {
  return (
    <button
      className="category-card"
      onClick={() => onClick(category)}
      aria-label={`Select ${category.name} category with ${wordCount} words`}
    >
      <div className="category-card__icon">{icon}</div>
      <div className="category-card__name">{category.name}</div>
      <div className="category-card__count">{wordCount} words</div>
    </button>
  );
}

export default CategoryCard;
