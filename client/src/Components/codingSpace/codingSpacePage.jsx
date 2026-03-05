import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { codeAPI } from "../../services/api";
import "./codingSpacePage.css";

const CodingSpacePage = ({ onNavigateToDashboard, onNavigateToProductivity, onNavigateToResources, onNavigateToLanding, onNavigateToStudyPartners, onNavigateToMyProfile }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [codes, setCodes] = useState([]);
  const [myCodes, setMyCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [newCode, setNewCode] = useState({
    title: "",
    description: "",
    language: "javascript",
    code: "",
    tags: []
  });
  const [newComment, setNewComment] = useState("");
  const [filters, setFilters] = useState({
    language: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Fetch codes on component mount
  useEffect(() => {
    fetchCodes();
  }, [filters]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await codeAPI.getAllCodes(filters);
      setCodes(response.codes || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching codes:", err);
      setError("Failed to load codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCodes = async () => {
    try {
      const response = await codeAPI.getUserCodes();
      setMyCodes(response.codes || []);
    } catch (err) {
      console.error("Error fetching my codes:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCode(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewCode(prev => ({
      ...prev,
      tags
    }));
  };

  const handleUploadCode = async (e) => {
    e.preventDefault();
    try {
      await codeAPI.createCode(newCode);
      setNewCode({
        title: "",
        description: "",
        language: "javascript",
        code: "",
        tags: []
      });
      setShowUploadForm(false);
      fetchCodes();
      fetchMyCodes();
    } catch (err) {
      console.error("Error uploading code:", err);
      setError("Failed to upload code");
    }
  };

  const handleViewCode = async (id) => {
    try {
      const response = await codeAPI.getCode(id);
      setSelectedCode(response.code);
    } catch (err) {
      console.error("Error fetching code details:", err);
      setError("Failed to load code details");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedCode) return;

    try {
      await codeAPI.addComment(selectedCode._id, newComment);
      setNewComment("");
      // Refresh the selected code to show new comment
      handleViewCode(selectedCode._id);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    }
  };

  const handleToggleLike = async (id) => {
    try {
      await codeAPI.toggleLike(id);
      // Refresh codes to update like count
      fetchCodes();
      if (selectedCode && selectedCode._id === id) {
        handleViewCode(id);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleDeleteCode = async (id) => {
    if (window.confirm("Are you sure you want to delete this code?")) {
      try {
        await codeAPI.deleteCode(id);
        fetchCodes();
        fetchMyCodes();
        if (selectedCode && selectedCode._id === id) {
          setSelectedCode(null);
        }
      } catch (err) {
        console.error("Error deleting code:", err);
        setError("Failed to delete code");
      }
    }
  };

  const handleApproveComment = async (commentId) => {
    if (!selectedCode) return;

    try {
      const response = await codeAPI.approveComment(selectedCode._id, commentId, 10);
      // Refresh the selected code to show updated comment status
      handleViewCode(selectedCode._id);
      // Show success message
      alert(response.message);
    } catch (err) {
      console.error("Error approving comment:", err);
      setError("Failed to approve comment");
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await codeAPI.getLeaderboard(10);
      setLeaderboard(response.leaderboard || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: "🟨",
      python: "🐍",
      java: "☕",
      cpp: "⚡",
      c: "🔧",
      csharp: "🔷",
      php: "🐘",
      ruby: "💎",
      go: "🐹",
      rust: "🦀",
      swift: "🍎",
      kotlin: "🟣",
      typescript: "🔷",
      html: "🌐",
      css: "🎨",
      sql: "🗄️",
      other: "📝"
    };
    return icons[language] || "📝";
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: "#f7df1e",
      python: "#3776ab",
      java: "#007396",
      cpp: "#00599c",
      c: "#a8b9cc",
      csharp: "#239120",
      php: "#777bb4",
      ruby: "#cc342d",
      go: "#00add8",
      rust: "#000000",
      swift: "#fa7343",
      kotlin: "#7f52ff",
      typescript: "#3178c6",
      html: "#e34f26",
      css: "#1572b6",
      sql: "#336791",
      other: "#6c757d"
    };
    return colors[language] || "#6c757d";
  };

  return (
    <div className="coding-space-page">
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
            <button className="nav-link active">
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
            <button className="nav-link my-profile-btn" onClick={onNavigateToMyProfile}>
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



      <div className="coding-layout">
        {/* Sidebar */}
        <aside className="coding-sidebar">
          <div className="sidebar-actions">
            <button className="upload-btn full-width" onClick={() => setShowUploadForm(!showUploadForm)}>
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </span>
              Upload Code
            </button>
          </div>
          <nav className="coding-nav">
            <button
              className={`nav-item ${activeTab === "browse" ? "active" : ""}`}
              onClick={() => setActiveTab("browse")}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <span className="nav-text">Browse Codes</span>
            </button>
            <button
              className={`nav-item ${activeTab === "my-codes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("my-codes");
                fetchMyCodes();
              }}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span className="nav-text">My Codes</span>
            </button>
            <button
              className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              <span className="nav-text">Statistics</span>
            </button>
            <button
              className={`nav-item ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("leaderboard");
                fetchLeaderboard();
              }}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                </svg>
              </span>
              <span className="nav-text">Leaderboard</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="coding-main">
          {/* Upload Form */}
          {showUploadForm && (
            <div className="upload-form-overlay">
              <div className="upload-form">
                <div className="form-header">
                  <h2>Upload New Code</h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowUploadForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUploadCode}>
                  <div className="form-row">
                    <input
                      type="text"
                      name="title"
                      placeholder="Code Title"
                      value={newCode.title}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                    <select
                      name="language"
                      value={newCode.language}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="csharp">C#</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <textarea
                    name="description"
                    placeholder="Description (optional)"
                    value={newCode.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                  />

                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={newCode.tags.join(", ")}
                    onChange={handleTagsChange}
                    className="form-input"
                  />

                  <textarea
                    name="code"
                    placeholder="Paste your code here..."
                    value={newCode.code}
                    onChange={handleInputChange}
                    required
                    className="code-textarea"
                    rows="15"
                  />

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowUploadForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Upload Code
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Browse Codes Tab */}
          {activeTab === "browse" && (
            <div className="browse-tab">
              <div className="tab-header">
                <h1>Browse All Codes</h1>
                <div className="filters">
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    }}
                    className="filter-select"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="views-desc">Most Viewed</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">Loading codes...</div>
              ) : codes.length === 0 ? (
                <div className="empty-state">
                  <p>No codes found. Be the first to upload some code!</p>
                </div>
              ) : (
                <div className="codes-grid">
                  {codes.map((code) => (
                    <div key={code._id} className="code-card">
                      <div className="code-header">
                        <div className="code-language">
                          <span className="language-icon">{getLanguageIcon(code.language)}</span>
                          <span className="language-name">{code.language}</span>
                        </div>
                        <div className="code-stats">
                          <span className="stat">👁️ {code.views}</span>
                          <span className="stat">❤️ {code.likes?.length || 0}</span>
                          <span className="stat">💬 {code.comments?.length || 0}</span>
                        </div>
                      </div>

                      <h3 className="code-title">{code.title}</h3>
                      {code.description && (
                        <p className="code-description">{code.description}</p>
                      )}

                      <div className="code-meta">
                        <div className="code-author">
                          <span className="author-name">
                            {code.userId?.nickname || code.userId?.fullName || 'Anonymous'}
                            {code.userId?.score !== undefined && (
                              <span className="user-score"> ⭐ {code.userId.score}</span>
                            )}
                          </span>
                          <span className="code-date">{formatDate(code.createdAt)}</span>
                        </div>
                      </div>

                      {code.tags && code.tags.length > 0 && (
                        <div className="code-tags">
                          {code.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="code-actions">
                        <button
                          className="view-btn"
                          onClick={() => handleViewCode(code._id)}
                        >
                          View Code
                        </button>
                        <button
                          className="like-btn"
                          onClick={() => handleToggleLike(code._id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={code.likes?.includes(user?._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Codes Tab */}
          {activeTab === "my-codes" && (
            <div className="my-codes-tab">
              <div className="tab-header">
                <h1>My Uploaded Codes</h1>
              </div>

              {myCodes.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't uploaded any code yet. Click "Upload Code" to get started!</p>
                </div>
              ) : (
                <div className="codes-grid">
                  {myCodes.map((code) => (
                    <div key={code._id} className="code-card my-code">
                      <div className="code-header">
                        <div className="code-language">
                          <span className="language-icon">{getLanguageIcon(code.language)}</span>
                          <span className="language-name">{code.language}</span>
                        </div>
                        <div className="code-stats">
                          <span className="stat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {code.views}
                          </span>
                          <span className="stat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {code.likes?.length || 0}
                          </span>
                          <span className="stat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            {code.comments?.length || 0}
                          </span>
                        </div>
                      </div>

                      <h3 className="code-title">{code.title}</h3>
                      {code.description && (
                        <p className="code-description">{code.description}</p>
                      )}

                      <div className="code-meta">
                        <span className="code-date">{formatDate(code.createdAt)}</span>
                      </div>

                      {code.tags && code.tags.length > 0 && (
                        <div className="code-tags">
                          {code.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="code-actions">
                        <button
                          className="view-btn"
                          onClick={() => handleViewCode(code._id)}
                        >
                          View Code
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCode(code._id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && (
            <div className="stats-tab">
              <div className="tab-header">
                <h1>Code Statistics</h1>
              </div>
              <div className="stats-content">
                <p>Statistics feature coming soon!</p>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="leaderboard-tab">
              <div className="tab-header">
                <h1>🏆 Top Contributors</h1>
                <p className="tab-subtitle">Users ranked by their contribution scores</p>
              </div>

              {leaderboard.length === 0 ? (
                <div className="empty-state">
                  <p>No scores yet. Start commenting on code to earn points!</p>
                </div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((user, index) => (
                    <div key={user._id} className={`leaderboard-item rank-${index + 1}`}>
                      <div className="rank-badge">
                        {index === 0 && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                        )}
                        {index === 1 && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                        )}
                        {index === 2 && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                        )}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div className="user-info">
                        {user.profilePicture ? (
                          <img
                            src={`http://localhost:7000${user.profilePicture}`}
                            alt={user.fullName}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {(user.nickname || user.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="user-details">
                          <span className="user-name">{user.nickname || user.fullName}</span>
                          <span className="user-university">{user.universityName}</span>
                        </div>
                      </div>
                      <div className="user-score-display">
                        <span className="score-value">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: '#fbbf24' }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          {user.score}
                        </span>
                        <span className="score-label">points</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Code Detail Modal */}
      {selectedCode && (
        <div className="code-modal-overlay">
          <div className="code-modal">
            <div className="modal-header">
              <div className="modal-title">
                <span className="language-icon">{getLanguageIcon(selectedCode.language)}</span>
                <h2>{selectedCode.title}</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedCode(null)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="code-info">
                <div className="code-author">
                  <span>By: {selectedCode.userId?.nickname || selectedCode.userId?.fullName || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{formatDate(selectedCode.createdAt)}</span>
                  <span>•</span>
                  <span>{selectedCode.language}</span>
                </div>

                {selectedCode.description && (
                  <p className="code-description">{selectedCode.description}</p>
                )}

                {selectedCode.tags && selectedCode.tags.length > 0 && (
                  <div className="code-tags">
                    {selectedCode.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="code-display">
                <div className="code-header">
                  <span className="language-badge" style={{ backgroundColor: getLanguageColor(selectedCode.language) }}>
                    {selectedCode.language}
                  </span>
                  <div className="code-actions">
                    <button
                      className="like-btn"
                      onClick={() => handleToggleLike(selectedCode._id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedCode.likes?.includes(user?._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {selectedCode.likes?.length || 0}
                    </button>
                    <span className="views-count">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {selectedCode.views}
                    </span>
                  </div>
                </div>
                <pre className="code-content">
                  <code>{selectedCode.code}</code>
                </pre>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3>Comments ({selectedCode.comments?.length || 0})</h3>

                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-input"
                    rows="3"
                  />
                  <button type="submit" className="comment-submit-btn">
                    Post Comment
                  </button>
                </form>

                <div className="comments-list">
                  {selectedCode.comments && selectedCode.comments.length > 0 ? (
                    selectedCode.comments.map((comment, index) => (
                      <div key={index} className={`comment ${comment.isApproved ? 'approved' : ''}`}>
                        <div className="comment-header">
                          <div className="comment-author">
                            <span className="author-name">
                              {comment.userId?.nickname || comment.userId?.fullName || 'Anonymous'}
                              {comment.userId?.score !== undefined && (
                                <span className="user-score-badge"> ⭐ {comment.userId.score}</span>
                              )}
                            </span>
                            <span className="comment-date">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {comment.isApproved && (
                            <span className="approved-badge">✓ Approved (+{comment.pointsAwarded} pts)</span>
                          )}
                        </div>
                        <p className="comment-text">{comment.comment}</p>
                        {/* Show approve button only if user is the code author and comment is not yet approved */}
                        {user && selectedCode.userId?._id === user._id &&
                          !comment.isApproved &&
                          comment.userId?._id !== user._id && (
                            <button
                              className="approve-btn"
                              onClick={() => handleApproveComment(comment._id)}
                            >
                              ✓ Approve Comment (Award 10 points)
                            </button>
                          )}
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingSpacePage;
