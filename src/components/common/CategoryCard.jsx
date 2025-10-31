import './CategoryCard.css';

function CategoryCard({ name, icon, wordCount, onClick }) {
  return (
    <button
      className="category-card"
      onClick={() => onClick(name)}
      aria-label={`Select ${name} category with ${wordCount} words`}
    >
      <div className="category-card__icon">{icon}</div>
      <div className="category-card__name">{name}</div>
      <div className="category-card__count">{wordCount} words</div>
    </button>
  );
}

export default CategoryCard;
