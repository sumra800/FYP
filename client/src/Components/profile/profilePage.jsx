import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AvatarBuilder from "./AvatarBuilder";
import "./profilePage.css";

const ProfilePage = ({ onNavigateToDashboard, onNavigateToCodingSpace, onNavigateToProductivity, onNavigateToResources, onNavigateToLanding }) => {
  const { user, updateProfile, isLoading, error, clearError, logout } = useAuth();
  const [formData, setFormData] = useState({
    nickname: "",
    currentSemester: "",
    codingSkills: "",
    studyPersona: "",
    personalDescription: "",
    societyPosition: "",
    profilePicture: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        currentSemester: user.currentSemester || "",
        codingSkills: user.codingSkills || "",
        studyPersona: user.studyPersona || "",
        personalDescription: user.personalDescription || "",
        societyPosition: user.societyPosition || "",
        profilePicture: user.profilePicture || null
      });

      // Set preview image if user has a profile picture
      if (user.profilePicture) {
        setPreviewImage(user.profilePicture);
      }
    }
  }, [user]);

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

    // Clear messages when user starts typing
    if (error) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: file
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonaSelect = (persona) => {
    setFormData({
      ...formData,
      studyPersona: persona
    });

    // Clear validation error
    if (validationErrors.studyPersona) {
      setValidationErrors({
        ...validationErrors,
        studyPersona: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nickname.trim()) {
      errors.nickname = "Nickname is required";
    }

    if (!formData.currentSemester) {
      errors.currentSemester = "Please select your current semester";
    }

    if (!formData.studyPersona) {
      errors.studyPersona = "Please select a study persona";
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
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          onNavigateToDashboard();
        }, 1500);
      }
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        currentSemester: user.currentSemester || "",
        codingSkills: user.codingSkills || "",
        studyPersona: user.studyPersona || "",
        personalDescription: user.personalDescription || "",
        societyPosition: user.societyPosition || "",
        profilePicture: user.profilePicture || null
      });

      // Reset preview image
      setPreviewImage(user.profilePicture || null);
    }

    // Clear errors and messages
    setValidationErrors({});
    if (error) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  const handleAvatarSave = (file, config) => {
    setFormData({
      ...formData,
      profilePicture: file
    });
    setAvatarConfig(config);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setShowAvatarBuilder(false);
  };

  // Helper function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:7000${imagePath}`;
  };

  return (
    <div className="profile-page">
      {/* Header */}
      {/* Top Header */}
      <header className="top-header">
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
            <button className="nav-link" onClick={onNavigateToDashboard}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Dashboard
            </button>
            <button className="nav-link">
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              Study Partners
            </button>
            <button className="nav-link" onClick={onNavigateToCodingSpace}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </span>
              Coding Environment
            </button>
            <button className="nav-link" onClick={onNavigateToProductivity}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </span>
              Productivity Tools
            </button>
            <button className="nav-link" onClick={onNavigateToResources}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </span>
              Resources
            </button>
            <button className="nav-link">
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              Ask-A-Senior Assistant
            </button>
            <button className="nav-link logout-link" onClick={handleLogout}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="profile-header">
          <h1 className="profile-title">Customize Your Profile</h1>
          <p className="profile-subtitle">Make your profile stand out and connect with the right study partners.</p>
        </div>

        <div className="profile-card">
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-layout-grid">
              {/* Left Column: Identity & Access */}
              <div className="profile-column-left">
                {/* Profile Picture */}
                <div className="form-group profile-picture-group">
                  <label className="form-label">Profile Picture</label>
                  <div className="profile-picture-container">
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/png,image/jpg,image/jpeg,image/gif"
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={isLoading}
                      />
                      <label htmlFor="profile-picture" className="file-upload-label">
                        {previewImage ? (
                          <div className="image-preview">
                            <img
                              src={getImageUrl(previewImage)}
                              alt="Profile preview"
                              className="preview-img"
                            />
                            <div className="preview-overlay">
                              <div className="upload-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                  <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                              </div>
                              <div className="upload-text">Change</div>
                            </div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <div className="upload-icon">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                            </div>
                            <div className="upload-text">Upload Image</div>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="divider-section">
                      <div className="divider-line"></div>
                      <span className="divider-text">OR</span>
                      <div className="divider-line"></div>
                    </div>

                    <button
                      type="button"
                      className="create-avatar-btn"
                      onClick={() => setShowAvatarBuilder(true)}
                      disabled={isLoading}
                    >
                      <span className="avatar-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                        </svg>
                      </span>
                      <span className="avatar-text">Avatar Builder</span>
                    </button>
                  </div>
                </div>

                {/* Nickname */}
                <div className="form-group">
                  <label className="form-label">Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    placeholder="e.g., CodeNinja"
                    className={`form-input ${validationErrors.nickname ? "error" : ""}`}
                    value={formData.nickname}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  {validationErrors.nickname && (
                    <span className="error-text">{validationErrors.nickname}</span>
                  )}
                </div>

                {/* Study Persona */}
                <div className="form-group">
                  <label className="form-label">Study Persona</label>
                  <div className="persona-options-vertical">
                    <button
                      type="button"
                      className={`persona-btn ${formData.studyPersona === "geek" ? "selected" : ""}`}
                      onClick={() => handlePersonaSelect("geek")}
                      disabled={isLoading}
                    >
                      <span className="persona-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </span>
                      <div className="persona-info">
                        <span className="persona-name">Geek</span>
                        <span className="persona-desc">Deep diver into tech</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`persona-btn ${formData.studyPersona === "nerd" ? "selected" : ""}`}
                      onClick={() => handlePersonaSelect("nerd")}
                      disabled={isLoading}
                    >
                      <span className="persona-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </span>
                      <div className="persona-info">
                        <span className="persona-name">Nerd</span>
                        <span className="persona-desc">Knowledge seeker</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`persona-btn ${formData.studyPersona === "chill" ? "selected" : ""}`}
                      onClick={() => handlePersonaSelect("chill")}
                      disabled={isLoading}
                    >
                      <span className="persona-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                          <line x1="6" y1="1" x2="6" y2="4"></line>
                          <line x1="10" y1="1" x2="10" y2="4"></line>
                          <line x1="14" y1="1" x2="14" y2="4"></line>
                        </svg>
                      </span>
                      <div className="persona-info">
                        <span className="persona-name">Chill</span>
                        <span className="persona-desc">Laid back learner</span>
                      </div>
                    </button>
                  </div>
                  {validationErrors.studyPersona && (
                    <span className="error-text">{validationErrors.studyPersona}</span>
                  )}
                </div>
              </div>

              {/* Right Column: Details & Info */}
              <div className="profile-column-right">
                {/* Current Semester */}
                {/* ... (rest of the form remains unchanged) ... */}
                <div className="form-group">
                  <label className="form-label">Current Semester</label>
                  <div className="select-wrapper">
                    <select
                      name="currentSemester"
                      className={`form-select ${validationErrors.currentSemester ? "error" : ""}`}
                      value={formData.currentSemester}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select Your Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="4th">4th Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="6th">6th Semester</option>
                      <option value="7th">7th Semester</option>
                      <option value="8th">8th Semester</option>
                    </select>
                    <span className="select-arrow"></span>
                  </div>
                  {validationErrors.currentSemester && (
                    <span className="error-text">{validationErrors.currentSemester}</span>
                  )}
                </div>

                {/* Coding Skills */}
                <div className="form-group">
                  <label className="form-label">Coding Skills</label>
                  <textarea
                    name="codingSkills"
                    placeholder="e.g., Python, JavaScript, React, SQL..."
                    className="form-textarea"
                    value={formData.codingSkills}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows="3"
                  />
                </div>

                {/* Personal Description */}
                <div className="form-group">
                  <label className="form-label">Personal Description</label>
                  <textarea
                    name="personalDescription"
                    placeholder="Tell us a little bit about yourself."
                    className="form-textarea"
                    value={formData.personalDescription}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows="4"
                  />
                </div>

                {/* University Society Position */}
                <div className="form-group">
                  <label className="form-label">University Society Position</label>
                  <textarea
                    name="societyPosition"
                    placeholder="e.g., President of Computer Science Society, Member of Robotics Club, Vice President of Debate Society..."
                    className="form-textarea society-position"
                    value={formData.societyPosition}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows="3"
                  />
                  <small className="form-hint">
                    Mention your roles in university clubs or societies.
                  </small>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Avatar Builder Modal */}
      {showAvatarBuilder && (
        <AvatarBuilder
          onSave={handleAvatarSave}
          onClose={() => setShowAvatarBuilder(false)}
          initialAvatar={avatarConfig}
        />
      )}
    </div>
  );
};

export default ProfilePage;
