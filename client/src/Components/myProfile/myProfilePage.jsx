import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./myProfilePage.css";

const MyProfilePage = ({
    onNavigateToCustomizeProfile,
    onNavigateToDashboard,
    onNavigateToCodingSpace,
    onNavigateToProductivity,
    onNavigateToResources,
    onNavigateToStudyPartners,
    onNavigateToLanding
}) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        onNavigateToLanding();
    };

    // Helper function to construct proper image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:7000${imagePath}`;
    };

    // Load partnerProfile subjects and preferred study time
    const primaryCourses = (user?.partnerProfile && user.partnerProfile.primaryCourses) || [];
    const preferredStudyTime = (user?.partnerProfile && user.partnerProfile.preferredStudyTimes && user.partnerProfile.preferredStudyTimes[0]) || "";

    return (
        <div className="my-profile-page">
            {/* Header */}
            <header className="top-header">
                <div className="header-content">
                    <div className="logo" onClick={onNavigateToDashboard} style={{ cursor: 'pointer' }}>
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
                        <button className="nav-link" onClick={onNavigateToStudyPartners}>
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
                        <button className="nav-link active">
                            <span className="nav-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </span>
                            My Profile
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
            <main className="main-content flex-center">
                <div className="my-profile-container">
                    {/* Top Section */}
                    <div className="my-profile-header">
                        <div className="my-profile-avatar-container">
                            {user?.profilePicture ? (
                                <img src={getImageUrl(user.profilePicture)} alt="Profile" className="my-profile-avatar" />
                            ) : (
                                <div className="my-profile-avatar-placeholder">
                                    <span>{user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div className="my-profile-header-info">
                            <h1 className="my-profile-name">{user?.nickname || user?.username || "Study Buddy"}</h1>
                            <div className="my-profile-badges">
                                {user?.studyPersona && (
                                    <span className="badge persona-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        {user.studyPersona.charAt(0).toUpperCase() + user.studyPersona.slice(1)}
                                    </span>
                                )}
                                {user?.currentSemester && (
                                    <span className="badge semester-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                        </svg>
                                        {user.currentSemester} Semester
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="customize-profile-btn" onClick={onNavigateToCustomizeProfile}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            Customize Profile
                        </button>
                    </div>

                    <div className="my-profile-grid">
                        {/* Left Column */}
                        <div className="my-profile-col">
                            <div className="info-card">
                                <h3 className="card-title">About Me</h3>
                                <p className="card-text">
                                    {user?.personalDescription || "No personal description provided yet. Update your profile to add one!"}
                                </p>
                            </div>

                            <div className="info-card">
                                <h3 className="card-title">Coding Skills</h3>
                                {user?.codingSkills ? (
                                    <div className="skills-container">
                                        {user.codingSkills.split(',').map((skill, index) => (
                                            <span key={index} className="skill-chip">{skill.trim()}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="card-text empty-text">No coding skills added.</p>
                                )}
                            </div>

                            <div className="info-card">
                                <h3 className="card-title">Society Position</h3>
                                <p className="card-text">
                                    {user?.societyPosition || "No society positions added."}
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="my-profile-col">
                            <div className="info-card">
                                <h3 className="card-title">Preferred Study Time</h3>
                                {preferredStudyTime ? (
                                    <div className="study-time-display">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <span>
                                            {preferredStudyTime === 'morning' ? 'Early Bird (Morning)' :
                                                preferredStudyTime === 'afternoon' ? 'Midday Person (Afternoon)' :
                                                    'Night Owl (Night)'}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="card-text empty-text">No preferred study time selected.</p>
                                )}
                            </div>

                            <div className="info-card">
                                <h3 className="card-title">Subjects & Courses</h3>
                                {primaryCourses.length > 0 ? (
                                    <div className="subjects-container">
                                        {primaryCourses.map((subject, index) => (
                                            <div key={index} className="subject-box">{subject}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="card-text empty-text">No subjects added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyProfilePage;
