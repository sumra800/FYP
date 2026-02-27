import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./loginPage.css";

const LoginPage = ({ onNavigateToSignup, onNavigateToLanding, onNavigateToAbout, onNavigateToContact, onNavigateToFeatures }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        // User will be automatically redirected to dashboard/profile based on auth state
        console.log("Login successful:", result.user);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={onNavigateToLanding} style={{ cursor: 'pointer' }}>
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
            <span className="nav-link" onClick={onNavigateToAbout} style={{ cursor: 'pointer' }}>About</span>
            <span className="nav-link" onClick={onNavigateToFeatures} style={{ cursor: 'pointer' }}>Features</span>
            <span className="nav-link" onClick={onNavigateToContact} style={{ cursor: 'pointer' }}>Contact</span>
          </nav>

          <div className="header-actions">
            <button
              className="register-btn-header"
              onClick={onNavigateToSignup}
              disabled={isLoading}
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Study Buddy</h1>
          <p className="welcome-subtitle">Join our community of learners and unlock your full potential.</p>
        </div>

        {/* Login Form Card */}
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className={`form-input ${validationErrors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.email && (
                <span className="error-text">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`form-input ${validationErrors.password ? "error" : ""}`}
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.password && (
                <span className="error-text">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" disabled={isLoading} />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-password">Forgot your password?</a>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </button>

            <div className="register-link">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="register-link-text"
                onClick={onNavigateToSignup}
                disabled={isLoading}
              >
                Register now
              </button>
            </div>
          </form>
        </div>
      </main>

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
              <li className="footer-link" onClick={onNavigateToLanding}>Home</li>
              <li className="footer-link" onClick={onNavigateToAbout}>About</li>
              <li className="footer-link" onClick={onNavigateToFeatures}>Features</li>
              <li className="footer-link" onClick={onNavigateToContact}>Contact</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Account</h3>
            <ul className="footer-links">
              <li className="footer-link" onClick={onNavigateToSignup}>Sign Up</li>
              <li className="footer-link">Help</li>
            </ul>
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

export default LoginPage;
