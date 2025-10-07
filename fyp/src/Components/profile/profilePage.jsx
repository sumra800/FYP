import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./profilePage.css";

const ProfilePage = ({ onNavigateToDashboard }) => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    nickname: "",
    currentSemester: "",
    codingSkills: "",
    studyPersona: "",
    personalDescription: "",
    profilePicture: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        currentSemester: user.currentSemester || "",
        codingSkills: user.codingSkills || "",
        studyPersona: user.studyPersona || "",
        personalDescription: user.personalDescription || "",
        profilePicture: user.profilePicture || null
      });
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
    setFormData({
      ...formData,
      profilePicture: e.target.files[0]
    });
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
        profilePicture: user.profilePicture || null
      });
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

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <div className="header-actions">
            <button className="back-btn" onClick={onNavigateToDashboard}>
              <span className="back-arrow"></span>
              Back to Dashboard
            </button>
          </div>
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

            {/* Current Semester */}
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

            {/* Study Persona */}
            <div className="form-group">
              <label className="form-label">Study Persona</label>
              <div className="persona-options">
                <button 
                  type="button"
                  className={`persona-btn ${formData.studyPersona === "geek" ? "selected" : ""}`}
                  onClick={() => handlePersonaSelect("geek")}
                  disabled={isLoading}
                >
                   Geek
                </button>
                <button 
                  type="button"
                  className={`persona-btn ${formData.studyPersona === "nerd" ? "selected" : ""}`}
                  onClick={() => handlePersonaSelect("nerd")}
                  disabled={isLoading}
                >
                   Nerd
                </button>
                <button 
                  type="button"
                  className={`persona-btn ${formData.studyPersona === "chill" ? "selected" : ""}`}
                  onClick={() => handlePersonaSelect("chill")}
                  disabled={isLoading}
                >
                   Chill
                </button>
              </div>
              {validationErrors.studyPersona && (
                <span className="error-text">{validationErrors.studyPersona}</span>
              )}
            </div>

            {/* Profile Picture */}
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
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
                  <div className="upload-icon"></div>
                  <div className="upload-text">Upload a file or drag and drop</div>
                  <div className="upload-info">PNG, JPG, GIF up to 10MB</div>
                </label>
              </div>
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
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
