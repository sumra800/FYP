import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { resourceAPI } from "../../services/api";
import "./resourcesPage.css";

const ResourcesPage = ({ onNavigateToDashboard, onNavigateToCodingSpace, onNavigateToProductivity, onNavigateToLanding }) => {
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
      alert("Resource uploaded successfully!");

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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
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
            <button className="nav-link active">
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
                <h2 className="section-title">Past Papers</h2>

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
                  <div className="resources-table-container">
                    <table className="resources-table">
                      <thead>
                        <tr>
                          <th>COURSE</th>
                          <th>YEAR</th>
                          <th>SEMESTER</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastPapers.map((paper) => (
                          <tr key={paper._id}>
                            <td className="course-name">{paper.courseName}</td>
                            <td>{paper.year}</td>
                            <td>{paper.semester}</td>
                            <td>
                              <button
                                className="download-btn"
                                onClick={() => handleDownload(paper)}
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="notes-section">
                <h2 className="section-title">Shared Notes</h2>

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
                  <div className="resources-table-container">
                    <table className="resources-table">
                      <thead>
                        <tr>
                          <th>COURSE</th>
                          <th>YEAR</th>
                          <th>SEMESTER</th>
                          <th>AUTHOR</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {notes.map((note) => (
                          <tr key={note._id}>
                            <td className="course-name">{note.courseName}</td>
                            <td>{note.year}</td>
                            <td>{note.semester}</td>
                            <td>{note.authorName}</td>
                            <td>
                              <button
                                className="download-btn"
                                onClick={() => handleDownload(note)}
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "upload" && (
              <div className="upload-section">
                <h2 className="section-title">Upload Resources</h2>

                <div className="upload-card">
                  <form className="upload-form" onSubmit={handleUploadSubmit}>
                    <div className="form-group">
                      <label className="form-label">Resource Type</label>
                      <select
                        className="form-select"
                        name="resourceType"
                        value={uploadFormData.resourceType}
                        onChange={handleUploadChange}
                      >
                        <option value="pastPaper">Past Paper</option>
                        <option value="notes">Notes</option>
                        <option value="tutorial">Tutorial</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Course Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Data Structures and Algorithms"
                        name="courseName"
                        value={uploadFormData.courseName}
                        onChange={handleUploadChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Year *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., 2023"
                          name="year"
                          value={uploadFormData.year}
                          onChange={handleUploadChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Semester *</label>
                        <select
                          className="form-select"
                          name="semester"
                          value={uploadFormData.semester}
                          onChange={handleUploadChange}
                          required
                        >
                          <option value="">Select Semester</option>
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                          <option value="Summer">Summer</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Add a brief description of the resource..."
                        name="description"
                        value={uploadFormData.description}
                        onChange={handleUploadChange}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Upload File *</label>
                      <div
                        className={`file-upload-area ${isDragging ? "dragging" : ""}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="file-input"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="file-upload" className="file-upload-label">
                          <span className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </span>
                          {uploadFormData.file ? (
                            <span className="upload-text">{uploadFormData.file.name}</span>
                          ) : (
                            <>
                              <span className="upload-text">Choose a file or drag it here</span>
                              <span className="upload-subtext">PDF, DOC, DOCX, PPT, PPTX, TXT, Images (Max 10MB)</span>
                            </>
                          )}
                        </label>
                        {uploadFormData.file && (
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => handleFileChange(null)}
                          >
                            Remove File
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancelUpload}
                        disabled={uploadLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-upload"
                        disabled={uploadLoading}
                      >
                        {uploadLoading ? "Uploading..." : "Upload Resource"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;

