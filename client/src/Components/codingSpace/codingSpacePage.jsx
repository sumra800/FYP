import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { codeAPI } from "../../services/api";
import "./codingSpacePage.css";

const CodingSpacePage = ({ onNavigateToDashboard, onNavigateToProductivity, onNavigateToResources, onNavigateToLanding }) => {
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
      <header className="top-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <nav className="nav-links">
            <button className="nav-link" onClick={onNavigateToDashboard}>
              <span className="nav-icon">🏠</span>
              Dashboard
            </button>
            <button className="nav-link">
              <span className="nav-icon">👥</span>
              Study Partners
            </button>
            <button className="nav-link active">
              <span className="nav-icon">&lt;/&gt;</span>
              Coding Environment
            </button>
            <button className="nav-link" onClick={onNavigateToProductivity}>
              <span className="nav-icon">📋</span>
              Productivity Tools
            </button>
            <button className="nav-link" onClick={onNavigateToResources}>
              <span className="nav-icon">📑</span>
              Resources
            </button>
            <button className="nav-link">
              <span className="nav-icon">❓</span>
              Ask-A-Senior Assistant  
            </button>
            <button className="nav-link logout-link" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <header className="coding-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">💻</div>
            <span className="logo-text">Coding Space</span>
          </div>
          
          <div className="header-actions">
            <button className="upload-btn" onClick={() => setShowUploadForm(!showUploadForm)}>
              <span className="btn-icon">📤</span>
              Upload Code
            </button>
          </div>
        </div>
      </header>

      <div className="coding-layout">
        {/* Sidebar */}
        <aside className="coding-sidebar">
          <nav className="coding-nav">
            <button 
              className={`nav-item ${activeTab === "browse" ? "active" : ""}`}
              onClick={() => setActiveTab("browse")}
            >
              <span className="nav-icon">🔍</span>
              <span className="nav-text">Browse Codes</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "my-codes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("my-codes");
                fetchMyCodes();
              }}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-text">My Codes</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Statistics</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("leaderboard");
                fetchLeaderboard();
              }}
            >
              <span className="nav-icon">🏆</span>
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
                          ❤️
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
                          🗑️
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
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
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
                        <span className="score-value">⭐ {user.score}</span>
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
                ✕
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
                      ❤️ {selectedCode.likes?.length || 0}
                    </button>
                    <span className="views-count">👁️ {selectedCode.views}</span>
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
