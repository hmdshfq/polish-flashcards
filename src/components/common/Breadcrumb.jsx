import './Breadcrumb.css';

function Breadcrumb({ items }) {
  return (
    <div className="breadcrumb" aria-label="Breadcrumb navigation">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb__item">
          {index > 0 && <span className="breadcrumb__separator"> › </span>}
          <span className="breadcrumb__text">{item}</span>
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;
