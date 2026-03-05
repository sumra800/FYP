import React from "react";
import "./footer.css";

const Footer = ({ onNavigateToAbout, onNavigateToFeatures, onNavigateToContact, onNavigateToLanding }) => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand" onClick={onNavigateToLanding} role="button" tabIndex={0}>
          <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#fbbf24" fill="none" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#fbbf24" stroke="#f59e0b" />
                <line x1="10" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
          <span className="logo-text">Study Buddy</span>
        </div>

        <nav className="footer-nav">
          <button className="footer-link" onClick={onNavigateToAbout}>About</button>
          <button className="footer-link" onClick={onNavigateToFeatures}>Features</button>
          <button className="footer-link" onClick={onNavigateToContact}>Contact Us</button>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Study Buddy — Built for learners.</p>
      </div>
    </footer>
  );
};

export default Footer;
