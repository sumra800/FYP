import React from "react";
import "./featuresPage.css";

const FeaturesPage = ({ onNavigateToLanding, onNavigateBack }) => {
    return (
        <div className="features-page">
            {/* Header */}
            <header className="features-header">
                <div className="header-content">
                    <button className="back-btn" onClick={onNavigateBack || onNavigateToLanding}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
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
                </div>
            </header>

            {/* Main Content */}
            <main className="features-main">
                <div className="features-container">
                    <section className="features-hero">
                        <h1 className="features-title">Powerful Features</h1>
                        <p className="features-subtitle">Everything you need to excel in your academic journey</p>
                    </section>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                            </div>
                            <h3>AI-Powered Assistant</h3>
                            <p>Get instant help with your questions using advanced AI technology. Our smart assistant is available 24/7 to explain concepts, solve problems, and provide study tips.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <h3>Collaborative Learning</h3>
                            <p>Connect with peers, form study groups, and learn together. Share resources, discuss topics, and support each other in real-time online sessions.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3>Progress Tracking</h3>
                            <p>Monitor your study habits, track assignments, and visualize your academic progress with detailed analytics and productivity insights.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            </div>
                            <h3>Resource Library</h3>
                            <p>Access a comprehensive library of past papers, notes, and study materials shared by the community. Upload your own resources to help others.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                            </div>
                            <h3>Coding Environment</h3>
                            <p>Practice coding with our built-in IDE supporting multiple languages. Share code snippets, get feedback, and collaborate on programming projects.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <h3>Smart Scheduling</h3>
                            <p>Organize your academic life with our intelligent calendar. Manage deadlines, schedule study sessions, and never miss an important event.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FeaturesPage;
