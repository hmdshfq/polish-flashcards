import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__text">
          Crafted by{' '}
          <a
            href="https://hammadshafiq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
            aria-label="Visit Hammad's website"
          >
            Hammad
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
