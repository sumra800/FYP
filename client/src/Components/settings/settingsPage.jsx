import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './settingsPage.css';

const SettingsPage = ({ onNavigateToDashboard, onNavigateToLanding, onNavigateToProfile }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleBackToDashboard = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">EduTrack</span>
          </div>
          <div className="header-actions">
            <button className="back-btn" onClick={handleBackToDashboard}>
              <span className="back-arrow">←</span>
              Back to Dashboard
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="settings-main">
        <div className="settings-container">
          {/* Page Header */}
          <div className="settings-page-header">
            <h1 className="settings-title">
              <span className="settings-icon">⚙️</span>
              Settings
            </h1>
            <p className="settings-subtitle">Customize your experience</p>
          </div>

          {/* Settings Sections */}
          <div className="settings-sections">
            
            {/* Appearance Section */}
            <section className="settings-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🎨</span>
                  Appearance
                </h2>
                <p className="section-description">
                  Customize how the application looks
                </p>
              </div>

              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <span className="label-icon">
                        {isDark ? '🌙' : '☀️'}
                      </span>
                      <span className="label-text">Theme Mode</span>
                    </div>
                    <p className="setting-description">
                      Switch between light and dark mode. Dark mode reduces eye strain in low-light environments.
                    </p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                    >
                      <span className={`toggle-slider ${isDark ? 'active' : ''}`}>
                        <span className="slider-icon">
                          {isDark ? '🌙' : '☀️'}
                        </span>
                      </span>
                    </button>
                    <span className="current-theme">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                </div>

                <div className="theme-preview">
                  <div className="preview-label">Preview</div>
                  <div className="preview-container">
                    <div className="preview-card">
                      <div className="preview-header">Sample Card</div>
                      <div className="preview-content">
                        <p>This is how your content will look in {isDark ? 'dark' : 'light'} mode.</p>
                      </div>
                      <div className="preview-footer">
                        <button className="preview-btn">Action Button</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="settings-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🔔</span>
                  Notifications
                </h2>
                <p className="section-description">
                  Manage your notification preferences
                </p>
              </div>

              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <span className="label-icon">🔊</span>
                      <span className="label-text">Sound Notifications</span>
                    </div>
                    <p className="setting-description">
                      Play sounds for assignment reminders and alerts
                    </p>
                  </div>
                  <div className="setting-control">
                    <span className="info-text">
                      Configure this in the Dashboard
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Section */}
            <section className="settings-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">👤</span>
                  Account
                </h2>
                <p className="section-description">
                  Manage your account settings
                </p>
              </div>

              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <span className="label-icon">✏️</span>
                      <span className="label-text">Edit Profile</span>
                    </div>
                    <p className="setting-description">
                      Update your personal information and preferences
                    </p>
                  </div>
                  <div className="setting-control">
                    <button 
                      className="action-btn primary"
                      onClick={() => onNavigateToProfile && onNavigateToProfile()}
                    >
                      Go to Profile
                    </button>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">
                      <span className="label-icon">🔒</span>
                      <span className="label-text">Privacy & Security</span>
                    </div>
                    <p className="setting-description">
                      Your data is stored securely and never shared without permission
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="settings-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">ℹ️</span>
                  About
                </h2>
              </div>

              <div className="settings-card">
                <div className="about-info">
                  <h3 className="app-name">EduTrack</h3>
                  <p className="app-version">Version 1.0.0</p>
                  <p className="app-description">
                    A comprehensive educational platform for tracking assignments, 
                    managing productivity, and collaborating with peers.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

