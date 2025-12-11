import React from "react";
import "./aboutPage.css";

const AboutPage = ({ onNavigateToLanding }) => {
    return (
        <div className="about-page">
            {/* Header */}
            <header className="about-header">
                <div className="header-content">
                    <div className="logo" onClick={onNavigateToLanding} style={{ cursor: 'pointer' }}>
                        <div className="logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </div>
                        <span className="logo-text">Study Buddy</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="about-main">
                <div className="about-container">
                    <section className="about-hero">
                        <h1 className="about-title">About Study Buddy</h1>
                        <p className="about-subtitle">Empowering students through AI-powered collaborative learning</p>
                    </section>

                    <section className="about-mission">
                        <div className="mission-card">
                            <h2>Our Mission</h2>
                            <p>
                                Study Buddy is dedicated to revolutionizing the way students learn and collaborate.
                                We believe that education should be accessible, engaging, and personalized to each
                                student's unique needs. Our AI-powered platform combines cutting-edge technology
                                with proven learning methodologies to help students achieve academic success.
                            </p>
                        </div>
                    </section>

                    <section className="about-values">
                        <h2 className="section-title">Our Core Values</h2>
                        <div className="values-grid">
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="6"></circle>
                                        <circle cx="12" cy="12" r="2"></circle>
                                    </svg>
                                </div>
                                <h3>Focus on Learning</h3>
                                <p>We prioritize effective learning strategies that help students retain knowledge and develop critical thinking skills.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <h3>Collaboration</h3>
                                <p>We foster a community where students can learn together, share insights, and support each other's growth.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                                        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                                    </svg>
                                </div>
                                <h3>Innovation</h3>
                                <p>We continuously evolve our platform with the latest AI technology to provide the best learning experience.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="9" y1="18" x2="15" y2="18"></line>
                                        <line x1="10" y1="22" x2="14" y2="22"></line>
                                        <path d="M15.09 14c.18-.9.27-1.85.27-2.83 0-3.9-3.45-7.1-7.71-7.1-3.32 0-6.15 1.94-7.22 4.66a8.55 8.55 0 0 0-.25 2c0 2.5 1.5 4.8 3.83 6.1"></path>
                                        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.8"></path>
                                    </svg>
                                </div>
                                <h3>Accessibility</h3>
                                <p>We make quality education tools available to all students, regardless of their background or location.</p>
                            </div>
                        </div>
                    </section>

                    <section className="about-story">
                        <div className="story-card">
                            <h2>Our Story</h2>
                            <p>
                                Study Buddy was born from a simple observation: students learn better when they have
                                the right tools and support. Founded by a team of educators and technologists, we set
                                out to create a platform that combines the power of artificial intelligence with the
                                human touch of collaborative learning.
                            </p>
                            <p>
                                Today, thousands of students use Study Buddy to enhance their learning experience,
                                track their productivity, and achieve their academic goals. We're proud to be part of
                                their journey and committed to continuously improving our platform to serve them better.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AboutPage;
