import React, { useEffect, useRef } from "react";
import "./landingPage.css";

const LandingPage = ({ onNavigateToSignup, onNavigateToLogin, onNavigateToAbout, onNavigateToFeatures, onNavigateToContact }) => {
  const pictureRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);

  useEffect(() => {
    const picture = pictureRef.current;
    if (!picture) return;

    // helper to handle both mouse and touch events
    const getPointFromEvent = (e) => {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    function handleMove(e) {
      const pt = getPointFromEvent(e);
      movePupilTowards(pt, leftEyeRef.current, leftPupilRef.current);
      movePupilTowards(pt, rightEyeRef.current, rightPupilRef.current);
    }

    function handleLeave() {
      // smoothly return pupils to neutral center
      resetPupil(leftPupilRef.current);
      resetPupil(rightPupilRef.current);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
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

          <nav className="nav-links">
            <span className="nav-link" onClick={() => { console.log('About clicked', onNavigateToAbout); onNavigateToAbout && onNavigateToAbout(); }}>About</span>
            <span className="nav-link" onClick={() => { console.log('Features clicked', onNavigateToFeatures); onNavigateToFeatures && onNavigateToFeatures(); }}>Features</span>
            <span className="nav-link" onClick={() => { console.log('Contact clicked', onNavigateToContact); onNavigateToContact && onNavigateToContact(); }}>Contact</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Study Buddy</h1>
            <p className="hero-subtitle">Your AI-powered study companion for collaborative learning</p>
            <p className="hero-description">
              Join thousands of students who are already using Study Buddy to enhance their learning experience,
              track productivity, and achieve academic success.
            </p>

            <div className="hero-buttons">
              <button
                className="register-btn-hero"
                onClick={onNavigateToSignup}
              >
                Register
              </button>
              <button
                className="login-btn-hero"
                onClick={onNavigateToLogin}
              >
                Login
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="pc-wrapper" role="img" aria-label="Study Buddy poster">
              <div className="pc-frame">
                <div
                  ref={pictureRef}
                  className="pc-picture"
                  aria-hidden="true"
                >
                  <div className="pc-eyes">
                    <div ref={leftEyeRef} className="pc-eye pc-eye--left" aria-hidden>
                      <div ref={leftPupilRef} className="pc-pupil" />
                    </div>

                    <div ref={rightEyeRef} className="pc-eye pc-eye--right" aria-hidden>
                      <div ref={rightPupilRef} className="pc-pupil" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Showcase Section */}
      <section className="features-showcase">
        <div className="section-container">
          <h2 className="section-title">Powerful Features for Better Learning</h2>
          <p className="section-subtitle">Everything you need to excel in your studies</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" fill="#60a5fa" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" />
                  <circle cx="9" cy="9" r="1" fill="white" />
                  <circle cx="15" cy="9" r="1" fill="white" />
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Assistant</h3>
              <p className="feature-description">Get instant help with your questions using advanced AI technology</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="#fbbf24" stroke="#f59e0b" />
                  <circle cx="9" cy="7" r="4" fill="#fbbf24" stroke="#f59e0b" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#f59e0b" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#f59e0b" />
                </svg>
              </div>
              <h3 className="feature-title">Collaborative Learning</h3>
              <p className="feature-description">Study together with peers in real-time collaborative sessions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" stroke="#a78bfa" />
                  <rect x="7" y="9" width="4" height="12" fill="#a78bfa" stroke="#a78bfa" />
                  <rect x="15" y="5" width="4" height="16" fill="#a78bfa" stroke="#a78bfa" />
                </svg>
              </div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">Monitor your productivity and track your learning journey</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#34d399" fill="none" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#34d399" stroke="#10b981" />
                  <line x1="10" y1="8" x2="16" y2="8" stroke="white" />
                  <line x1="10" y1="12" x2="16" y2="12" stroke="white" />
                  <line x1="10" y1="16" x2="14" y2="16" stroke="white" />
                </svg>
              </div>
              <h3 className="feature-title">Resource Library</h3>
              <p className="feature-description">Access a vast collection of study materials and resources</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#fbbf24" stroke="#f59e0b" />
                </svg>
              </div>
              <h3 className="feature-title">Smart Scheduling</h3>
              <p className="feature-description">Optimize your study time with intelligent scheduling tools</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#dc2626" />
                  <circle cx="12" cy="12" r="6" fill="white" stroke="#dc2626" />
                  <circle cx="12" cy="12" r="2" fill="#ef4444" />
                </svg>
              </div>
              <h3 className="feature-title">Goal Setting</h3>
              <p className="feature-description">Set and achieve your academic goals with personalized plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Study Sessions</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose Study Buddy?</h2>
          <p className="section-subtitle">Join thousands of successful students</p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#fbbf24" stroke="#f59e0b" />
                  </svg>
                </div>
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">Personalized Learning</h3>
                <p className="benefit-description">AI adapts to your learning style and pace, providing customized study recommendations</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" stroke="#34d399" fill="none" />
                    <circle cx="12" cy="12" r="10" stroke="#10b981" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">Boost Productivity</h3>
                <p className="benefit-description">Track your study time, set goals, and stay motivated with productivity insights</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#60a5fa" fill="none" />
                    <polyline points="22 4 12 14.01 9 11.01" stroke="#3b82f6" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">Achieve Excellence</h3>
                <p className="benefit-description">Join a community of high-achievers and reach your academic potential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#fbbf24" fill="none" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#fbbf24" stroke="#f59e0b" />
                  <line x1="10" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" />
                  <line x1="10" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" />
                  <line x1="10" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="footer-logo-text">Study Buddy</span>
            </div>
            <p className="footer-description">
              Your AI-powered study companion for collaborative learning and academic success.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li className="footer-link" onClick={onNavigateToAbout}>About</li>
              <li className="footer-link" onClick={onNavigateToFeatures}>Features</li>
              <li className="footer-link" onClick={onNavigateToContact}>Contact</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Get Started</h3>
            <ul className="footer-links">
              <li className="footer-link" onClick={onNavigateToSignup}>Sign Up</li>
              <li className="footer-link" onClick={onNavigateToLogin}>Login</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Connect With Us</h3>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Study Buddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
function movePupilTowards(pointer, eyeEl, pupilEl) {
  if (!eyeEl || !pupilEl) return;

  const eyeRect = eyeEl.getBoundingClientRect();
  const pupilRect = pupilEl.getBoundingClientRect();

  // center of the eye (in client coords)
  const eyeCenter = {
    x: eyeRect.left + eyeRect.width / 2,
    y: eyeRect.top + eyeRect.height / 2,
  };

  // vector from eye center to pointer
  const vx = pointer.x - eyeCenter.x;
  const vy = pointer.y - eyeCenter.y;

  const eyeRadius = Math.min(eyeRect.width, eyeRect.height) / 2;
  const pupilRadius = Math.min(pupilRect.width, pupilRect.height) / 2;
  const margin = 6; // px margin so pupil never touches edge

  const maxDist = Math.max(0, eyeRadius - pupilRadius - margin);

  // actual distance of pointer
  const dist = Math.sqrt(vx * vx + vy * vy);
  if (dist === 0) {
    pupilEl.style.transform = `translate3d(0px, 0px, 0)`;
    return;
  }

  // scale vector to maxDist if outside
  const scale = Math.min(1, maxDist / dist);
  const tx = Math.round(vx * scale);
  const ty = Math.round(vy * scale);

  pupilEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
}

function resetPupil(pupilEl) {
  if (!pupilEl) return;
  // smooth return using transition in CSS
  pupilEl.style.transform = `translate3d(0px, 0px, 0)`;
}
