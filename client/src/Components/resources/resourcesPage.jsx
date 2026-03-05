import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { resourceAPI } from "../../services/api";
import "./resourcesPage.css";

const ResourcesPage = ({ onNavigateToDashboard, onNavigateToCodingSpace, onNavigateToProductivity, onNavigateToLanding, onNavigateToStudyPartners, onNavigateToMyProfile }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("pastPapers");

  // Resources state
  const [pastPapers, setPastPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload form state
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    resourceType: "pastPaper",
    courseName: "",
    year: "",
    semester: "",
    description: "",
    file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  // Fetch resources when tab changes
  useEffect(() => {
    if (activeTab === "pastPapers") {
      fetchPastPapers();
    } else if (activeTab === "notes") {
      fetchNotes();
    }
  }, [activeTab]);

  const fetchPastPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resourceAPI.getResourcesByType("pastPaper");
      setPastPapers(response.resources || []);
    } catch (err) {
      console.error("Error fetching past papers:", err);
      setError("Failed to load past papers");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resourceAPI.getResourcesByType("notes");
      setNotes(response.resources || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    try {
      await resourceAPI.downloadResource(resource._id, resource.fileName);
    } catch (err) {
      console.error("Error downloading resource:", err);
      alert("Failed to download resource");
    }
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setUploadFormData((prev) => ({ ...prev, file }));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!uploadFormData.courseName || !uploadFormData.year || !uploadFormData.semester || !uploadFormData.file) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    try {
      setUploadLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append("title", uploadFormData.title || `${uploadFormData.courseName} - ${uploadFormData.resourceType}`);
      formData.append("resourceType", uploadFormData.resourceType);
      formData.append("courseName", uploadFormData.courseName);
      formData.append("year", uploadFormData.year);
      formData.append("semester", uploadFormData.semester);
      formData.append("description", uploadFormData.description);
      formData.append("file", uploadFormData.file);

      await resourceAPI.uploadResource(formData);

      setUploadSuccess(true);

      // Reset form
      setUploadFormData({
        title: "",
        resourceType: "pastPaper",
        courseName: "",
        year: "",
        semester: "",
        description: "",
        file: null,
      });

      // Refresh the resources list
      if (uploadFormData.resourceType === "pastPaper") {
        fetchPastPapers();
      } else if (uploadFormData.resourceType === "notes") {
        fetchNotes();
      }

      // Switch to the appropriate tab
      setTimeout(() => {
        setActiveTab(uploadFormData.resourceType === "pastPaper" ? "pastPapers" : "notes");
      }, 1000);
    } catch (err) {
      console.error("Error uploading resource:", err);
      alert(err.message || "Failed to upload resource");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setUploadFormData({
      title: "",
      resourceType: "pastPaper",
      courseName: "",
      year: "",
      semester: "",
      description: "",
      file: null,
    });
  };

  return (
    <div className="resources-page">
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
            <button className="nav-link active">
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

      {/* Main Content */}
      {/* Main Content */}
      <main className="resources-main">
        <div className="resources-container">
          {/* Page Title */}
          <div className="page-header">
            <h1 className="page-title">Resources</h1>
            <p className="page-subtitle">
              Access past papers and notes for your courses. You can also upload your own notes to share with the community.
            </p>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "pastPapers" ? "active" : ""}`}
              onClick={() => setActiveTab("pastPapers")}
            >
              Past Papers
            </button>
            <button
              className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
            <button
              className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              Upload
            </button>
          </div>

          {/* Content Based on Active Tab */}
          <div className="tab-content">
            {activeTab === "pastPapers" && (
              <div className="past-papers-section">

                {loading ? (
                  <div className="loading-state">Loading past papers...</div>
                ) : error ? (
                  <div className="error-state">{error}</div>
                ) : pastPapers.length === 0 ? (
                  <div className="empty-state">
                    <p>No past papers available yet.</p>
                    <p>Be the first to upload!</p>
                  </div>
                ) : (
                  <div className="resources-grid">
                    {pastPapers.map((paper) => (
                      <div key={paper._id} className="resource-card">
                        <div className="card-header">
                          <div className="card-icon">📄</div>
                          <div className="card-title-group">
                            <h3 className="card-title">{paper.courseName}</h3>
                            <p className="card-meta">{paper.year} • {paper.semester}</p>
                          </div>
                        </div>
                        <div className="card-footer">
                          <button
                            className="download-btn-new"
                            onClick={() => handleDownload(paper)}
                          >
                            ⬇ Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="notes-section">

                {loading ? (
                  <div className="loading-state">Loading notes...</div>
                ) : error ? (
                  <div className="error-state">{error}</div>
                ) : notes.length === 0 ? (
                  <div className="empty-state">
                    <p>No notes available yet.</p>
                    <p>Be the first to upload!</p>
                  </div>
                ) : (
                  <div className="resources-grid">
                    {notes.map((note) => (
                      <div key={note._id} className="resource-card">
                        <div className="card-header">
                          <div className="card-icon">📝</div>
                          <div className="card-title-group">
                            <h3 className="card-title">{note.courseName}</h3>
                            <p className="card-meta">{note.year} • {note.semester} • By {note.authorName}</p>
                          </div>
                        </div>
                        <div className="card-footer">
                          <button
                            className="download-btn-new"
                            onClick={() => handleDownload(note)}
                          >
                            ⬇ Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "upload" && (
              <div className="upload-container-modern animate-fade-in">
                <div className="upload-header-modern">
                  <h2 className="upload-title-modern">Share Your Resources</h2>
                  <p className="upload-subtitle-modern">Help your peers by contributing past papers, notes, or tutorials. Knowledge grows when shared!</p>
                </div>

                <form className="upload-form-modern" onSubmit={handleUploadSubmit}>
                  <div className="upload-grid-modern">

                    {/* Left Column: Form Details */}
                    <div className="upload-details-modern">
                      <div className="form-group-modern">
                        <label className="form-label-modern">Resource Type</label>
                        <div className="custom-select-wrapper">
                          <select
                            className="form-input-modern"
                            name="resourceType"
                            value={uploadFormData.resourceType}
                            onChange={handleUploadChange}
                          >
                            <option value="pastPaper"> Past Paper</option>
                            <option value="notes"> Notes</option>
                          </select>
                          <div className="select-icon">▼</div>
                        </div>
                      </div>

                      <div className="form-group-modern">
                        <label className="form-label-modern">Course Name <span className="required-asterisk">*</span></label>
                        <input
                          type="text"
                          className="form-input-modern"
                          placeholder="e.g., Data Structures and Algorithms"
                          name="courseName"
                          value={uploadFormData.courseName}
                          onChange={handleUploadChange}
                          required
                        />
                      </div>

                      <div className="form-row-modern">
                        <div className="form-group-modern">
                          <label className="form-label-modern">Year <span className="required-asterisk">*</span></label>
                          <input
                            type="text"
                            className="form-input-modern"
                            placeholder="e.g., 2023"
                            name="year"
                            value={uploadFormData.year}
                            onChange={handleUploadChange}
                            required
                          />
                        </div>

                        <div className="form-group-modern">
                          <label className="form-label-modern">Semester <span className="required-asterisk">*</span></label>
                          <div className="custom-select-wrapper">
                            <select
                              className="form-input-modern"
                              name="semester"
                              value={uploadFormData.semester}
                              onChange={handleUploadChange}
                              required
                            >
                              <option value="">Select Semester</option>
                              <option value="Fall"> Fall</option>
                              <option value="Spring"> Spring</option>
                              <option value="Summer"> Summer</option>
                            </select>
                            <div className="select-icon">▼</div>
                          </div>
                        </div>
                      </div>

                      <div className="form-group-modern">
                        <label className="form-label-modern">Description</label>
                        <textarea
                          className="form-input-modern textarea-modern"
                          rows="3"
                          placeholder="What is this resource about? Any tips for studying it?"
                          name="description"
                          value={uploadFormData.description}
                          onChange={handleUploadChange}
                        ></textarea>
                      </div>
                    </div>

                    {/* Right Column: File Dropzone */}
                    <div className="upload-dropzone-wrapper">
                      <label className="form-label-modern">Upload File <span className="required-asterisk">*</span></label>
                      <div
                        className={`file-upload-area-modern ${isDragging ? "dragging" : ""} ${uploadFormData.file ? "has-file" : ""}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="file-upload-modern"
                          className="file-input-modern"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="file-upload-modern" className="file-upload-label-modern">
                          {uploadFormData.file ? (
                            <div className="file-success-state">
                              <div className="success-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-icon">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                              </div>
                              <span className="file-name-modern">{uploadFormData.file.name}</span>
                              <span className="file-size-modern">
                                {(uploadFormData.file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                              <button
                                type="button"
                                className="remove-file-btn-modern"
                                onClick={(e) => { e.preventDefault(); handleFileChange(null); }}
                              >
                                Remove & Reselect
                              </button>
                            </div>
                          ) : (
                            <div className="file-empty-state">
                              <div className="upload-cloud-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="17 8 12 3 7 8"></polyline>
                                  <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                              </div>
                              <h3 className="upload-text-primary">Drag & drop your file here</h3>
                              <p className="upload-text-secondary">or click to browse from your computer</p>

                              <div className="supported-formats">
                                <span className="format-badge">PDF</span>
                                <span className="format-badge">DOCX</span>
                                <span className="format-badge">PPTX</span>
                                <span className="format-badge">Images</span>
                              </div>
                              <p className="upload-limit-text">Maximum file size: 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions footer */}
                  <div className="form-actions-modern">
                    <button
                      type="button"
                      className="btn-cancel-modern"
                      onClick={handleCancelUpload}
                      disabled={uploadLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn-upload-modern ${uploadLoading ? 'loading' : ''}`}
                      disabled={uploadLoading || !uploadFormData.file}
                    >
                      {uploadLoading ? (
                        <>
                          <span className="spinner-mini"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                          </svg>
                          Publish
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;

