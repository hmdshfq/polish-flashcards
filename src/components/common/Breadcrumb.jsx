import './Breadcrumb.css';

function Breadcrumb({ items }) {
  const handleKeyDown = (event, onClick) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && item.onClick;

          return (
            <li key={index} className="breadcrumb__item">
              {index > 0 && <span className="breadcrumb__separator" aria-hidden="true"> › </span>}
              {isClickable ? (
                <button
                  type="button"
                  className="breadcrumb__link"
                  onClick={item.onClick}
                  onKeyDown={(e) => handleKeyDown(e, item.onClick)}
                  aria-current={isLast ? 'page' : undefined}
                >
                  <span className="breadcrumb__text breadcrumb__text--full">{item.label}</span>
                  {item.abbreviation && (
                    <span className="breadcrumb__text breadcrumb__text--abbr">{item.abbreviation}</span>
                  )}
                </button>
              ) : (
                <span className="breadcrumb__current" aria-current="page">
                  <span className="breadcrumb__text breadcrumb__text--full">{item.label}</span>
                  {item.abbreviation && (
                    <span className="breadcrumb__text breadcrumb__text--abbr">{item.abbreviation}</span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
