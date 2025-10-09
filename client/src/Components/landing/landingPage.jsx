import React, { useEffect, useRef } from "react";
import "./landingPage.css";

const LandingPage = ({ onNavigateToSignup, onNavigateToLogin }) => {
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

    picture.addEventListener("mousemove", handleMove);
    picture.addEventListener("touchmove", handleMove, { passive: true });
    picture.addEventListener("mouseleave", handleLeave);
    picture.addEventListener("touchend", handleLeave);
    picture.addEventListener("touchcancel", handleLeave);

    return () => {
      picture.removeEventListener("mousemove", handleMove);
      picture.removeEventListener("touchmove", handleMove);
      picture.removeEventListener("mouseleave", handleLeave);
      picture.removeEventListener("touchend", handleLeave);
      picture.removeEventListener("touchcancel", handleLeave);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <nav className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#contact" className="nav-link">Contact</a>
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

              <div className="pc-footer">
                <div className="pc-hex">Study Buddy</div>
                <div className="pc-title">AI powered study companion</div>
                <div className="pc-sub">Start your journey today</div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
