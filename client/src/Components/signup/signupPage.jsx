import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./signupPage.css";

const SignupPage = ({ onNavigateToLogin, onNavigateToProfile, onNavigateToLanding, onNavigateToAbout, onNavigateToContact, onNavigateToFeatures }) => {
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

    // Full Name Validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters long";
    } else if (formData.fullName.trim().length > 50) {
      errors.fullName = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName.trim())) {
      errors.fullName = "Name can only contain letters, spaces, hyphens, and apostrophes";
    } else if (!/^[a-zA-Z]/.test(formData.fullName.trim())) {
      errors.fullName = "Name must start with a letter";
    }

    // Email Validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (formData.email.trim().length > 100) {
      errors.email = "Email must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address (e.g., user@example.com)";
    }

    // Password Validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (formData.password.length > 128) {
      errors.password = "Password must not exceed 128 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/\\|`~])/.test(formData.password)) {
      errors.password = "Password must contain at least one special character";
    } else if (/\s/.test(formData.password)) {
      errors.password = "Password must not contain spaces";
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // University Name Validation
    if (!formData.universityName.trim()) {
      errors.universityName = "University name is required";
    } else if (formData.universityName.trim().length < 3) {
      errors.universityName = "University name must be at least 3 characters long";
    } else if (formData.universityName.trim().length > 100) {
      errors.universityName = "University name must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s.,'&()-]+$/.test(formData.universityName.trim())) {
      errors.universityName = "University name contains invalid characters";
    }

    // Department Name Validation
    if (!formData.departmentName.trim()) {
      errors.departmentName = "Department name is required";
    } else if (formData.departmentName.trim().length < 2) {
      errors.departmentName = "Department name must be at least 2 characters long";
    } else if (formData.departmentName.trim().length > 100) {
      errors.departmentName = "Department name must not exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s.,'&()-]+$/.test(formData.departmentName.trim())) {
      errors.departmentName = "Department name contains invalid characters";
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
            <span className="nav-link" onClick={onNavigateToAbout} style={{ cursor: 'pointer' }}>About</span>
            <span className="nav-link" onClick={onNavigateToFeatures} style={{ cursor: 'pointer' }}>Features</span>
            <span className="nav-link" onClick={onNavigateToContact} style={{ cursor: 'pointer' }}>Contact</span>
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

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
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
                type="text"
                name="email"
                placeholder="Email address"
                className={`form-input ${validationErrors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
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
