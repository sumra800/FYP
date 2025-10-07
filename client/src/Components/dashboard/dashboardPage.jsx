
import React, { useState } from "react"
import "./dashboardPage.css";

const DashboardPage = ({ onNavigateToProfile, onNavigateToProductivity }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const assignments = [
    { name: "Math Homework", dueDate: "2024-04-15", status: "In Progress" },
    { name: "Science Project", dueDate: "2024-04-20", status: "Not Started" },
    { name: "History Essay", dueDate: "2024-04-25", status: "Completed" }
  ];

  const reminders = [
    { title: "Study Session for Math", time: "2024-04-12 10:00 AM" },
    { title: "Work on Science Project", time: "2024-04-13 02:00 PM" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "status-completed";
      case "In Progress": return "status-progress";
      case "Not Started": return "status-not-started";
      default: return "";
    }
  };

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <div className="header-actions">
            <button className="edit-profile-btn" onClick={onNavigateToProfile}>
              <span className="btn-icon">👤</span>
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "partners" ? "active" : ""}`}
              onClick={() => setActiveTab("partners")}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Study Partners</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "coding" ? "active" : ""}`}
              onClick={() => setActiveTab("coding")}
            >
              <span className="nav-icon">&lt;/&gt;</span>
              <span className="nav-text">Coding Environment</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "tools" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("tools");
                if (onNavigateToProductivity) {
                  onNavigateToProductivity();
                }
              }}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Productivity Tools</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "assistant" ? "active" : ""}`}
              onClick={() => setActiveTab("assistant")}
            >
              <span className="nav-icon">❓</span>
              <span className="nav-text">Ask-A-Senior Assistant</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </button>
            
            <button className="nav-item">
              <span className="nav-icon">❓</span>
              <span className="nav-text">Help and Feedback</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Content Header */}
          <div className="content-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="welcome-text">Welcome back, Sarah</p>
          </div>

          {/* Dashboard Content */}
          <div className="dashboard-content">
            {/* Performance Metrics */}
            <div className="metrics-section">
              <div className="weekly-performance">
                <h2 className="section-title">Weekly Performance</h2>
                <div className="metric-card">
                  <div className="metric-info">
                    <h3 className="metric-label">Weekly Study Hours</h3>
                    <div className="metric-value">25</div>
                    <div className="metric-change positive">+10%</div>
                  </div>
                  <div className="chart-container">
                    <div className="line-chart">
                      <div className="chart-line"></div>
                      <div className="chart-points">
                        <div className="point" style={{height: "60%"}}></div>
                        <div className="point" style={{height: "80%"}}></div>
                        <div className="point" style={{height: "100%"}}></div>
                        <div className="point" style={{height: "40%"}}></div>
                        <div className="point" style={{height: "90%"}}></div>
                        <div className="point" style={{height: "70%"}}></div>
                        <div className="point" style={{height: "95%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="monthly-performance">
                <h2 className="section-title">Monthly Performance</h2>
                <div className="metric-card">
                  <div className="metric-info">
                    <h3 className="metric-label">Monthly Study Hours</h3>
                    <div className="metric-value">100</div>
                    <div className="metric-change positive">+5%</div>
                  </div>
                  <div className="chart-container">
                    <div className="bar-chart">
                      <div className="bar" style={{height: "60%"}}>
                        <span className="bar-label">Week 1</span>
                      </div>
                      <div className="bar" style={{height: "90%"}}>
                        <span className="bar-label">Week 2</span>
                      </div>
                      <div className="bar" style={{height: "70%"}}>
                        <span className="bar-label">Week 3</span>
                      </div>
                      <div className="bar" style={{height: "95%"}}>
                        <span className="bar-label">Week 4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="assignments-section">
              <h2 className="section-title">Assignments</h2>
              <div className="assignments-card">
                <table className="assignments-table">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, index) => (
                      <tr key={index}>
                        <td className="assignment-name">{assignment.name}</td>
                        <td className="due-date">{assignment.dueDate}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
              {/* Reminders */}
              <div className="reminders-section">
                <h2 className="section-title">Reminders</h2>
                <div className="reminders-card">
                  {reminders.map((reminder, index) => (
                    <div key={index} className="reminder-item">
                      <div className="reminder-title">{reminder.title}</div>
                      <div className="reminder-time">{reminder.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Habits Insights */}
              <div className="insights-section">
                <h2 className="section-title">Study Habits Insights</h2>
                <div className="insights-card">
                  <p className="insights-text">
                    You've been most productive on Tuesdays and Wednesdays. 
                    Consider scheduling more study sessions during these days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;