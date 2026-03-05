
import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext";
import { assignmentAPI, reminderAPI, eventAPI, studySessionAPI } from "../../services/api";
import GoogleClassroomIntegration from "./GoogleClassroomIntegration";
import DashboardSidebar from "../common/DashboardSidebar";
import "./dashboardPage.css";

const DashboardPage = ({ onNavigateToMyProfile, onNavigateToProductivity, onNavigateToCodingSpace, onNavigateToSettings, onNavigateToResources, onNavigateToLanding, onNavigateToStudyPartners }) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Study session statistics state
  const [studyStats, setStudyStats] = useState({
    weekly: { hours: 0, sessionCount: 0, change: 0 },
    monthly: { hours: 0, sessionCount: 0, change: 0 }
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Fetch study statistics
  const fetchStudyStats = async () => {
    try {
      setStatsLoading(true);
      const response = await studySessionAPI.getWeeklyMonthlyStats();
      setStudyStats({
        weekly: response.weekly || { hours: 0, sessionCount: 0, change: 0 },
        monthly: response.monthly || { hours: 0, sessionCount: 0, change: 0 }
      });
    } catch (err) {
      console.error("Error fetching study statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch assignments and reminders on component mount
  useEffect(() => {
    fetchAssignments();
    fetchReminders();
    checkUpcomingReminders();
    fetchStudyStats();
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
                <div className="cloud-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                  </svg>
                </div>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <button className="nav-link active">
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

      <div className="dashboard-layout">
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          onNavigateToStudyPartners={onNavigateToStudyPartners}
          onNavigateToCodingSpace={onNavigateToCodingSpace}
          onNavigateToProductivity={onNavigateToProductivity}
          onNavigateToResources={onNavigateToResources}
          onNavigateToMyProfile={onNavigateToMyProfile}
          onNavigateToSettings={onNavigateToSettings}
          handleLogout={handleLogout}
        />

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
                    {user?.score !== undefined && (
                      <span className="user-score-badge-dashboard">
                        ⭐ {user.score} points
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="dashboard-content">
            {/* Google Classroom Integration */}
            <GoogleClassroomIntegration
              userId={user?._id}
              onSync={fetchAssignments}
            />

            {/* Performance Metrics */}
            <div className="metrics-section">
              <div className="weekly-performance">
                <h2 className="section-title">Weekly Performance</h2>
                <div className="metric-card">
                  <div className="metric-info">
                    <h3 className="metric-label">Weekly Study Hours</h3>
                    <div className="metric-value">
                      {statsLoading ? "..." : studyStats.weekly.hours}
                    </div>
                    <div className={`metric-change ${studyStats.weekly.change >= 0 ? 'positive' : 'negative'}`}>
                      {statsLoading ? "" : `${studyStats.weekly.change >= 0 ? '+' : ''}${studyStats.weekly.change}%`}
                    </div>
                    {!statsLoading && studyStats.weekly.sessionCount > 0 && (
                      <div className="session-count">{studyStats.weekly.sessionCount} sessions</div>
                    )}
                  </div>
                  <div className="chart-container">
                    <div className="line-chart">
                      <div className="chart-line"></div>
                      <div className="chart-points">
                        <div className="point" style={{ height: "60%" }}></div>
                        <div className="point" style={{ height: "80%" }}></div>
                        <div className="point" style={{ height: "100%" }}></div>
                        <div className="point" style={{ height: "40%" }}></div>
                        <div className="point" style={{ height: "90%" }}></div>
                        <div className="point" style={{ height: "70%" }}></div>
                        <div className="point" style={{ height: "95%" }}></div>
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
                    <div className="metric-value">
                      {statsLoading ? "..." : studyStats.monthly.hours}
                    </div>
                    <div className={`metric-change ${studyStats.monthly.change >= 0 ? 'positive' : 'negative'}`}>
                      {statsLoading ? "" : `${studyStats.monthly.change >= 0 ? '+' : ''}${studyStats.monthly.change}%`}
                    </div>
                    {!statsLoading && studyStats.monthly.sessionCount > 0 && (
                      <div className="session-count">{studyStats.monthly.sessionCount} sessions</div>
                    )}
                  </div>
                  <div className="chart-container">
                    <div className="bar-chart">
                      <div className="bar" style={{ height: "60%" }}>
                        <span className="bar-label">Week 1</span>
                      </div>
                      <div className="bar" style={{ height: "90%" }}>
                        <span className="bar-label">Week 2</span>
                      </div>
                      <div className="bar" style={{ height: "70%" }}>
                        <span className="bar-label">Week 3</span>
                      </div>
                      <div className="bar" style={{ height: "95%" }}>
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
                            <div className="assignment-title-row">
                              <div className="assignment-title">{assignment.title}</div>
                              {assignment.googleClassroom?.isFromClassroom && (
                                <span className="classroom-badge" title="From Google Classroom">
                                  <img
                                    src="https://ssl.gstatic.com/classroom/favicon.png"
                                    alt="Google Classroom"
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                </span>
                              )}
                            </div>
                            {assignment.description && (
                              <div className="assignment-description">{assignment.description}</div>
                            )}
                            {assignment.googleClassroom?.alternateLink && (
                              <a
                                href={assignment.googleClassroom.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="classroom-link"
                              >
                                View in Google Classroom →
                              </a>
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