import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./signupPage.css";

const SignupPage = ({ onNavigateToLogin, onNavigateToProfile }) => {
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
          <div className="logo">
            <div className="logo-icon">📚</div>
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
    </div>
  );
};

export default SignupPage;
