import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./signupPage.css";

const SignupPage = ({ onNavigateToLogin, onNavigateToProfile, onNavigateToLanding }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityName: "",
    departmentName: ""
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

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.universityName.trim()) {
      errors.universityName = "University name is required";
    }

    if (!formData.departmentName.trim()) {
      errors.departmentName = "Department name is required";
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
      const result = await register(formData);
      if (result.success) {
        // Navigate to profile page after successful signup
        onNavigateToProfile();
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="signup-page">
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
            <a href="#about" className="nav-link">About</a>
            <a href="#support" className="nav-link">Support</a>
            <a href="#login" className="nav-link">Login</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Create your account</h1>
            <p className="signup-subtitle">And start your collaborative learning journey.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className={`form-input ${validationErrors.fullName ? "error" : ""}`}
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.fullName && (
                <span className="error-text">{validationErrors.fullName}</span>
              )}
            </div>

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

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`form-input ${validationErrors.confirmPassword ? "error" : ""}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.confirmPassword && (
                <span className="error-text">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="universityName"
                placeholder="University Name"
                className={`form-input ${validationErrors.universityName ? "error" : ""}`}
                value={formData.universityName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.universityName && (
                <span className="error-text">{validationErrors.universityName}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="departmentName"
                placeholder="Department Name"
                className={`form-input ${validationErrors.departmentName ? "error" : ""}`}
                value={formData.departmentName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {validationErrors.departmentName && (
                <span className="error-text">{validationErrors.departmentName}</span>
              )}
            </div>

            <button
              type="submit"
              className="create-account-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="signin-link">
              <button
                type="button"
                className="signin-link-text"
                onClick={onNavigateToLogin}
                disabled={isLoading}
              >
                Already have an account? Sign in
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
              <li className="footer-link">About</li>
              <li className="footer-link">Features</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Account</h3>
            <ul className="footer-links">
              <li className="footer-link" onClick={onNavigateToLogin}>Login</li>
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

export default SignupPage;
