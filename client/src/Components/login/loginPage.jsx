import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./loginPage.css";

const LoginPage = ({ onNavigateToSignup, onNavigateToLanding }) => {
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
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <nav className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
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
    </div>
  );
};

export default LoginPage;
