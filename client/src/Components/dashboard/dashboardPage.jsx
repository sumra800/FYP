
import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext";
import { assignmentAPI, reminderAPI, eventAPI } from "../../services/api";
import "./dashboardPage.css";

const DashboardPage = ({ onNavigateToProfile, onNavigateToProductivity, onNavigateToCodingSpace, onNavigateToLanding }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignments, setAssignments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderError, setReminderError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "medium",
    estimatedHours: 0
  });
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    reminderDate: "",
    reminderTime: "",
    priority: "medium",
    category: ""
  });
  const [alerts, setAlerts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alarmSound, setAlarmSound] = useState(null);
  
  // Event-related state
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "seminar",
    organizer: "",
    location: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    maxAttendees: "",
    tags: "",
    registrationRequired: false,
    registrationDeadline: "",
    contactEmail: "",
    contactPhone: "",
    isFeatured: false
  });

  // Initialize alarm sound
  useEffect(() => {
    // Create a simple alarm sound using Web Audio API
    const createAlarmSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    // Create a simple audio element for alarm
    const audio = new Audio();
    audio.preload = 'auto';
    
    // Set up the alarm sound function
    audio.addEventListener('play', createAlarmSound);
    
    setAlarmSound(audio);
  }, []);

  // Fetch assignments and reminders on component mount
  useEffect(() => {
    fetchAssignments();
    fetchReminders();
    checkUpcomingReminders();
  }, []);

  // Check for upcoming reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkUpcomingReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAssignments();
      setAssignments(response.assignments || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      setReminderLoading(true);
      const response = await reminderAPI.getReminders();
      setReminders(response.reminders || []);
      setReminderError(null);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setReminderError("Failed to load reminders");
    } finally {
      setReminderLoading(false);
    }
  };

  const checkUpcomingReminders = async () => {
    try {
      const response = await reminderAPI.getUpcomingReminders(24); // Check next 24 hours
      const upcomingReminders = response.reminders || [];
      
      console.log("Upcoming reminders:", upcomingReminders);
      
      // Filter reminders that are due today (entire day)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      console.log("Current time:", now);
      console.log("Today range:", today, "to", tomorrow);
      
      const dueReminders = upcomingReminders.filter(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        
        console.log("Checking reminder:", reminder.title, "Date:", reminderDate, "DateTime:", reminderDateTime);
        
        // Check if reminder is due today (any time during the day)
        const isToday = reminderDate >= today && reminderDate < tomorrow;
        
        // For testing: show all reminders that are today, regardless of time
        // In production, you might want: const isDueNow = reminderDateTime <= now;
        const isDueNow = true; // Show all reminders for today
        
        console.log("Is today:", isToday, "Is due now:", isDueNow);
        
        return isToday && isDueNow;
      });

      console.log("Due reminders:", dueReminders);

      // Show alerts for due reminders
      if (dueReminders.length > 0) {
        setAlerts(prev => {
          const newAlerts = dueReminders.map(reminder => ({
            id: reminder._id,
            title: reminder.title,
            time: `${reminder.reminderDate} ${reminder.reminderTime}`,
            priority: reminder.priority,
            description: reminder.description,
            category: reminder.category
          }));
          
          // Remove duplicates and add new alerts
          const existingIds = prev.map(alert => alert.id);
          const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
          
          console.log("New alerts to show:", uniqueNewAlerts);
          
          // Play alarm sound for new alerts
          if (uniqueNewAlerts.length > 0) {
            console.log("Playing alarm sound");
            playAlarmSound();
          }
          
          return [...prev, ...uniqueNewAlerts];
        });
      }
    } catch (err) {
      console.error("Error checking upcoming reminders:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "status-completed";
      case "in-progress": return "status-progress";
      case "not-started": return "status-not-started";
      default: return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "in-progress": return "In Progress";
      case "not-started": return "Not Started";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReminderInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.createAssignment(newAssignment);
      setNewAssignment({
        title: "",
        description: "",
        subject: "",
        dueDate: "",
        priority: "medium",
        estimatedHours: 0
      });
      setShowAddForm(false);
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("Failed to create assignment");
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await assignmentAPI.deleteAssignment(id);
        fetchAssignments(); // Refresh the list
      } catch (err) {
        console.error("Error deleting assignment:", err);
        setError("Failed to delete assignment");
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await assignmentAPI.updateAssignment(id, { status: newStatus });
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error("Error updating assignment:", err);
      setError("Failed to update assignment");
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      await reminderAPI.createReminder(newReminder);
      setNewReminder({
        title: "",
        description: "",
        reminderDate: "",
        reminderTime: "",
        priority: "medium",
        category: ""
      });
      setShowAddReminderForm(false);
      fetchReminders(); // Refresh the list
    } catch (err) {
      console.error("Error creating reminder:", err);
      setReminderError("Failed to create reminder");
    }
  };

  const handleDeleteReminder = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        await reminderAPI.deleteReminder(id);
        fetchReminders(); // Refresh the list
      } catch (err) {
        console.error("Error deleting reminder:", err);
        setReminderError("Failed to delete reminder");
      }
    }
  };

  const handleMarkReminderCompleted = async (id) => {
    try {
      await reminderAPI.markReminderCompleted(id);
      fetchReminders(); // Refresh the list
    } catch (err) {
      console.error("Error marking reminder as completed:", err);
      setReminderError("Failed to update reminder");
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const playAlarmSound = () => {
    if (soundEnabled) {
      try {
        console.log("Attempting to play alarm sound...");
        
        // Try Web Audio API first
        if (window.AudioContext || window.webkitAudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Create a simple beep pattern
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
          console.log("Web Audio API alarm sound played successfully");
        } else {
          // Fallback: Use browser's built-in beep (if available)
          console.log("Web Audio API not available, trying fallback");
          // This is a simple fallback - most browsers don't support this
          if (typeof window !== 'undefined' && window.alert) {
            // Visual alert as fallback
            console.log("🔔 ALARM: Reminder notification!");
          }
        }
      } catch (err) {
        console.log("Could not play alarm sound:", err);
        // Fallback: Show visual notification
        console.log("🔔 ALARM: Reminder notification!");
      }
    } else {
      console.log("Sound is disabled");
    }
  };

  // Test function to manually trigger alerts
  const testAlert = () => {
    const testAlert = {
      id: 'test-' + Date.now(),
      title: 'Test Reminder',
      time: new Date().toLocaleString(),
      priority: 'high',
      description: 'This is a test reminder to check if the cloud notification works.',
      category: 'Test'
    };
    
    setAlerts(prev => [...prev, testAlert]);
    playAlarmSound();
  };

  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleHamburgerMenu = () => {
    setHamburgerMenuOpen(!hamburgerMenuOpen);
  };

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hamburgerMenuOpen && !event.target.closest('.hamburger-menu')) {
        setHamburgerMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hamburgerMenuOpen]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Helper function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:7000${imagePath}`;
  };

  // Event-related functions
  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await eventAPI.getAllEvents({ 
        isUpcoming: 'true', 
        sortBy: 'eventDate', 
        sortOrder: 'asc',
        limit: 20
      });
      setEvents(response.events);
      setEventError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEventError("Failed to load events.");
    } finally {
      setEventLoading(false);
    }
  };

  const handleEventInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const eventData = {
        ...newEvent,
        tags: tagsArray,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null,
        registrationDeadline: newEvent.registrationDeadline || null
      };
      
      await eventAPI.createEvent(eventData);
      setNewEvent({
        title: "",
        description: "",
        eventType: "seminar",
        organizer: "",
        location: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        maxAttendees: "",
        tags: "",
        registrationRequired: false,
        registrationDeadline: "",
        contactEmail: "",
        contactPhone: "",
        isFeatured: false
      });
      setShowAddEventForm(false);
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      setEventError("Failed to create event.");
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    try {
      await eventAPI.registerForEvent(eventId);
      fetchEvents(); // Refresh events to update registration status
    } catch (err) {
      console.error("Error registering for event:", err);
      setEventError("Failed to register for event.");
    }
  };

  const handleUnregisterFromEvent = async (eventId) => {
    try {
      await eventAPI.unregisterFromEvent(eventId);
      fetchEvents(); // Refresh events to update registration status
    } catch (err) {
      console.error("Error unregistering from event:", err);
      setEventError("Failed to unregister from event.");
    }
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatEventTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUserRegistered = (event) => {
    return event.attendees && event.attendees.some(attendee => 
      attendee._id === user._id || attendee === user._id
    );
  };

  return (
    <div className="dashboard-page">

      {/* Alert Notifications - Floating Clouds */}
      {alerts.length > 0 && (
        <div className="cloud-container">
          {alerts.map((alert, index) => (
            <div 
              key={alert.id} 
              className={`floating-cloud ${alert.priority}`}
              style={{
                animationDelay: `${index * 0.5}s`,
                left: `${20 + (index * 15)}%`,
                top: `${10 + (index * 20)}%`
              }}
            >
              <div className="cloud-content">
                <div className="cloud-icon">☁️</div>
                <div className="cloud-text">
                  <div className="cloud-title">{alert.title}</div>
                  {alert.description && (
                    <div className="cloud-description">{alert.description}</div>
                  )}
                  <div className="cloud-time">{alert.time}</div>
                  {alert.category && (
                    <div className="cloud-category">{alert.category}</div>
                  )}
                </div>
                <button 
                  className="cloud-dismiss" 
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss reminder"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          {/* Hamburger Menu */}
          <div className="hamburger-menu">
            <button className="hamburger-btn" onClick={toggleHamburgerMenu}>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            
            {/* Dropdown Menu */}
            {hamburgerMenuOpen && (
              <div className="hamburger-dropdown">
                <button className="dropdown-item" onClick={() => { setActiveTab("dashboard"); setHamburgerMenuOpen(false); }}>
                  <span className="dropdown-icon">🏠</span>
                  Dashboard
                </button>
                <button className="dropdown-item" onClick={() => { setHamburgerMenuOpen(false); }}>
                  <span className="dropdown-icon">👥</span>
                  Study Partners
                </button>
                <button className="dropdown-item" onClick={() => { onNavigateToCodingSpace(); setHamburgerMenuOpen(false); }}>
                  <span className="dropdown-icon">&lt;/&gt;</span>
                  Coding Environment
                </button>
                <button className="dropdown-item" onClick={() => { onNavigateToProductivity(); setHamburgerMenuOpen(false); }}>
                  <span className="dropdown-icon">📋</span>
                  Productivity Tools
                </button>
                <button className="dropdown-item" onClick={() => { setHamburgerMenuOpen(false); }}>
                  <span className="dropdown-icon">❓</span>
                  Ask-A-Senior Assistant
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={toggleSidebar}>
                  <span className="dropdown-icon">{sidebarOpen ? "◀" : "▶"}</span>
                  {sidebarOpen ? "Hide" : "Show"} Sidebar
                </button>
                <button className="dropdown-item" onClick={onNavigateToProfile}>
                  <span className="dropdown-icon">👤</span>
                  Edit Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <div className="header-actions">
            <button 
              className={`sound-toggle-btn ${soundEnabled ? 'enabled' : 'disabled'}`} 
              onClick={toggleSound}
              title={soundEnabled ? "Disable alarm sound" : "Enable alarm sound"}
            >
              <span className="btn-icon">{soundEnabled ? "🔊" : "🔇"}</span>
              {soundEnabled ? "Sound On" : "Sound Off"}
            </button>
            <button 
              className="test-alert-btn" 
              onClick={testAlert}
              title="Test alert notification"
            >
              <span className="btn-icon">🧪</span>
              Test Alert
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
              onClick={() => {
                setActiveTab("coding");
                if (onNavigateToCodingSpace) {
                  onNavigateToCodingSpace();
                }
              }}
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
        <main className={`main-content ${sidebarOpen ? 'main-content-expanded' : 'main-content-full'}`}>
          {/* Content Header */}
          <div className="content-header">
            <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
              <div className="welcome-section">
                <div className="user-info">
                  {user?.profilePicture ? (
                    <img 
                      src={getImageUrl(user.profilePicture)} 
                      alt="Profile" 
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <span className="avatar-initial">
                        {(user?.nickname || user?.fullName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="welcome-text">
                    <span className="welcome-greeting">Welcome back</span>
                    <span className="user-name">
                      {user?.nickname || user?.fullName || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="assignments-header">
              <h2 className="section-title">Assignments</h2>
                <button 
                  className="add-assignment-btn" 
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  + Add Assignment
                </button>
              </div>

              {/* Add Assignment Form */}
              {showAddForm && (
                <div className="add-assignment-form">
                  <form onSubmit={handleAddAssignment}>
                    <div className="form-row">
                      <input
                        type="text"
                        name="title"
                        placeholder="Assignment Title"
                        value={newAssignment.title}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={newAssignment.subject}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="date"
                        name="dueDate"
                        value={newAssignment.dueDate}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                      <select
                        name="priority"
                        value={newAssignment.priority}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Description (optional)"
                      value={newAssignment.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="2"
                    />
                    <div className="form-actions">
                      <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        Add Assignment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="assignments-card">
                {loading ? (
                  <div className="loading-state">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="empty-state">
                    <p>No assignments yet. Add your first assignment above!</p>
                  </div>
                ) : (
                <table className="assignments-table">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                        <th>Subject</th>
                      <th>Due Date</th>
                      <th>Status</th>
                        <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment._id}>
                          <td className="assignment-name">
                            <div className="assignment-title">{assignment.title}</div>
                            {assignment.description && (
                              <div className="assignment-description">{assignment.description}</div>
                            )}
                          </td>
                          <td className="assignment-subject">{assignment.subject}</td>
                          <td className="due-date">{formatDate(assignment.dueDate)}</td>
                          <td>
                            <select
                              value={assignment.status}
                              onChange={(e) => handleUpdateStatus(assignment._id, e.target.value)}
                              className={`status-select ${getStatusColor(assignment.status)}`}
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="assignment-actions">
                            <button
                              onClick={() => handleDeleteAssignment(assignment._id)}
                              className="delete-btn"
                              title="Delete assignment"
                            >
                              🗑️
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
              {/* Reminders */}
              <div className="reminders-section">
                <div className="reminders-header">
                <h2 className="section-title">Reminders</h2>
                  <button 
                    className="add-reminder-btn" 
                    onClick={() => setShowAddReminderForm(!showAddReminderForm)}
                  >
                    + Add Reminder
                  </button>
                </div>

                {/* Add Reminder Form */}
                {showAddReminderForm && (
                  <div className="add-reminder-form">
                    <form onSubmit={handleAddReminder}>
                      <div className="form-row">
                        <input
                          type="text"
                          name="title"
                          placeholder="Reminder Title"
                          value={newReminder.title}
                          onChange={handleReminderInputChange}
                          required
                          className="form-input"
                        />
                        <input
                          type="text"
                          name="category"
                          placeholder="Category (optional)"
                          value={newReminder.category}
                          onChange={handleReminderInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="date"
                          name="reminderDate"
                          value={newReminder.reminderDate}
                          onChange={handleReminderInputChange}
                          required
                          className="form-input"
                        />
                        <input
                          type="time"
                          name="reminderTime"
                          value={newReminder.reminderTime}
                          onChange={handleReminderInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <select
                          name="priority"
                          value={newReminder.priority}
                          onChange={handleReminderInputChange}
                          className="form-select"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                      <textarea
                        name="description"
                        placeholder="Description (optional)"
                        value={newReminder.description}
                        onChange={handleReminderInputChange}
                        className="form-textarea"
                        rows="2"
                      />
                      <div className="form-actions">
                        <button type="button" onClick={() => setShowAddReminderForm(false)} className="cancel-btn">
                          Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                          Add Reminder
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Error Message */}
                {reminderError && (
                  <div className="error-message">
                    {reminderError}
                  </div>
                )}

                <div className="reminders-card">
                  {reminderLoading ? (
                    <div className="loading-state">Loading reminders...</div>
                  ) : reminders.length === 0 ? (
                    <div className="empty-state">
                      <p>No reminders yet. Add your first reminder above!</p>
                    </div>
                  ) : (
                    <div className="reminders-list">
                      {reminders.map((reminder) => (
                        <div key={reminder._id} className="reminder-item">
                          <div className="reminder-content">
                      <div className="reminder-title">{reminder.title}</div>
                            {reminder.description && (
                              <div className="reminder-description">{reminder.description}</div>
                            )}
                            <div className="reminder-time">
                              {formatDate(reminder.reminderDate)} at {reminder.reminderTime}
                            </div>
                            {reminder.category && (
                              <div className="reminder-category">{reminder.category}</div>
                            )}
                          </div>
                          <div className="reminder-actions">
                            <button
                              onClick={() => handleMarkReminderCompleted(reminder._id)}
                              className="complete-btn"
                              title="Mark as completed"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder._id)}
                              className="delete-btn"
                              title="Delete reminder"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Explore Section - University Events & Seminars */}
              <div className="explore-section">
                <div className="section-header">
                  <h2 className="section-title">Explore University Events</h2>
                  <button 
                    className="add-event-btn" 
                    onClick={() => setShowAddEventForm(!showAddEventForm)}
                  >
                    {showAddEventForm ? 'Cancel' : '+ Add Event'}
                  </button>
                </div>

                {showAddEventForm && (
                  <div className="add-event-form">
                    <form onSubmit={handleAddEvent}>
                      <div className="form-row">
                        <input
                          type="text"
                          name="title"
                          placeholder="Event Title"
                          value={newEvent.title}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                        <select
                          name="eventType"
                          value={newEvent.eventType}
                          onChange={handleEventInputChange}
                          className="form-input"
                        >
                          <option value="seminar">Seminar</option>
                          <option value="workshop">Workshop</option>
                          <option value="conference">Conference</option>
                          <option value="meeting">Meeting</option>
                          <option value="social">Social</option>
                          <option value="academic">Academic</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <textarea
                        name="description"
                        placeholder="Event Description"
                        value={newEvent.description}
                        onChange={handleEventInputChange}
                        required
                        className="form-input"
                        rows="3"
                      />
                      <div className="form-row">
                        <input
                          type="text"
                          name="organizer"
                          placeholder="Organizer"
                          value={newEvent.organizer}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                        <input
                          type="text"
                          name="location"
                          placeholder="Location"
                          value={newEvent.location}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="date"
                          name="eventDate"
                          value={newEvent.eventDate}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                        <input
                          type="time"
                          name="startTime"
                          value={newEvent.startTime}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                        <input
                          type="time"
                          name="endTime"
                          value={newEvent.endTime}
                          onChange={handleEventInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="number"
                          name="maxAttendees"
                          placeholder="Max Attendees (optional)"
                          value={newEvent.maxAttendees}
                          onChange={handleEventInputChange}
                          className="form-input"
                          min="1"
                        />
                        <input
                          type="text"
                          name="tags"
                          placeholder="Tags (comma-separated)"
                          value={newEvent.tags}
                          onChange={handleEventInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="email"
                          name="contactEmail"
                          placeholder="Contact Email (optional)"
                          value={newEvent.contactEmail}
                          onChange={handleEventInputChange}
                          className="form-input"
                        />
                        <input
                          type="tel"
                          name="contactPhone"
                          placeholder="Contact Phone (optional)"
                          value={newEvent.contactPhone}
                          onChange={handleEventInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="registrationRequired"
                            checked={newEvent.registrationRequired}
                            onChange={handleEventInputChange}
                          />
                          Registration Required
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={newEvent.isFeatured}
                            onChange={handleEventInputChange}
                          />
                          Featured Event
                        </label>
                      </div>
                      {newEvent.registrationRequired && (
                        <input
                          type="datetime-local"
                          name="registrationDeadline"
                          value={newEvent.registrationDeadline}
                          onChange={handleEventInputChange}
                          className="form-input"
                        />
                      )}
                      <button type="submit" className="submit-btn">Create Event</button>
                    </form>
                  </div>
                )}

                {eventError && (
                  <div className="error-message">{eventError}</div>
                )}

                {eventLoading ? (
                  <div className="loading-state">Loading events...</div>
                ) : (
                  <div className="events-grid">
                    {events.length === 0 ? (
                      <div className="empty-state">
                        <p>No upcoming events found. Be the first to add an event!</p>
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event._id} className={`event-card ${event.isFeatured ? 'featured' : ''}`}>
                          <div className="event-header">
                            <div className="event-type-badge">{event.eventType}</div>
                            {event.isFeatured && <div className="featured-badge">⭐ Featured</div>}
                          </div>
                          <h3 className="event-title">{event.title}</h3>
                          <p className="event-description">{event.description}</p>
                          <div className="event-details">
                            <div className="event-detail">
                              <span className="detail-icon">👤</span>
                              <span>{event.organizer}</span>
                            </div>
                            <div className="event-detail">
                              <span className="detail-icon">📍</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="event-detail">
                              <span className="detail-icon">📅</span>
                              <span>{formatEventDate(event.eventDate)}</span>
                            </div>
                            <div className="event-detail">
                              <span className="detail-icon">🕐</span>
                              <span>{formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</span>
                            </div>
                            {event.maxAttendees && (
                              <div className="event-detail">
                                <span className="detail-icon">👥</span>
                                <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
                              </div>
                            )}
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="event-tags">
                              {event.tags.map((tag, index) => (
                                <span key={index} className="event-tag">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="event-actions">
                            {isUserRegistered(event) ? (
                              <button 
                                className="unregister-btn"
                                onClick={() => handleUnregisterFromEvent(event._id)}
                              >
                                Unregister
                              </button>
                            ) : (
                              <button 
                                className="register-btn"
                                onClick={() => handleRegisterForEvent(event._id)}
                                disabled={event.isFull || !event.isRegistrationOpen}
                              >
                                {event.isFull ? 'Full' : 'Register'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;