
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studySessionAPI } from "../../services/api";
import "./productivityPage.css";

const ProductivityPage = ({ onNavigateToDashboard, onNavigateToCodingSpace, onNavigateToResources, onNavigateToLanding }) => {
  const { logout } = useAuth();
  const [timer, setTimer] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [editableTime, setEditableTime] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [todos, setTodos] = useState([
    { id: 1, text: "Complete Math Assignment", due: "Due: Today", completed: false },
    { id: 2, text: "Review Science Notes", due: "Due: Tomorrow", completed: false },
    { id: 3, text: "Prepare for History Exam", due: "Due: Next Week", completed: false }
  ]);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // Study session tracking
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [initialTimerValue, setInitialTimerValue] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [progressData, setProgressData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [studyHistory, setStudyHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          let { hours, minutes, seconds } = prevTimer;

          if (seconds > 0) {
            seconds--;
          } else if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else if (hours > 0) {
            hours--;
            minutes = 59;
            seconds = 59;
          } else {
            setIsRunning(false);
            setIsPaused(false);
            return { hours: 0, minutes: 0, seconds: 0 };
          }

          return { hours, minutes, seconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setSessionStartTime(new Date());
      setInitialTimerValue({ ...timer });
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    }
  };

  const endTimer = async () => {
    if (isRunning && sessionStartTime) {
      const endTime = new Date();

      // Calculate time studied (initial time - remaining time)
      const initialSeconds = (initialTimerValue.hours * 3600) + (initialTimerValue.minutes * 60) + initialTimerValue.seconds;
      const remainingSeconds = (timer.hours * 3600) + (timer.minutes * 60) + timer.seconds;
      const studiedSeconds = initialSeconds - remainingSeconds;

      if (studiedSeconds > 0 && subjectName.trim()) {
        const duration = {
          hours: Math.floor(studiedSeconds / 3600),
          minutes: Math.floor((studiedSeconds % 3600) / 60),
          seconds: studiedSeconds % 60
        };

        try {
          await studySessionAPI.createSession({
            courseName: subjectName.trim(),
            duration,
            startTime: sessionStartTime,
            endTime,
            totalSeconds: studiedSeconds
          });

          console.log("Study session saved successfully!");

          // Refresh progress data and history
          fetchProgressData();
          fetchStudyHistory();
        } catch (error) {
          console.error("Failed to save study session:", error);
          alert("Failed to save study session. Please try again.");
        }
      }
    }

    setIsRunning(false);
    setIsPaused(false);
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
    setSessionStartTime(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimer({ ...editableTime });
  };

  const handleTimeChange = (unit, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;

    if (unit === "hours" && numValue > 23) return;
    if (unit === "minutes" && numValue > 59) return;
    if (unit === "seconds" && numValue > 59) return;

    setEditableTime(prev => ({
      ...prev,
      [unit]: numValue
    }));
  };

  const applyTimeChanges = () => {
    setTimer({ ...editableTime });
    setIsEditing(false);
  };

  const cancelTimeChanges = () => {
    setEditableTime({ ...timer });
    setIsEditing(false);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTask = () => {
    if (newTask.trim() === "") return;

    const newId = Math.max(...todos.map(todo => todo.id), 0) + 1;
    const dueText = newDueDate ? `Due: ${newDueDate}` : "No due date";

    const newTodo = {
      id: newId,
      text: newTask.trim(),
      due: dueText,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setNewTask("");
    setNewDueDate("");
  };

  const deleteTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const formatTime = (value) => {
    return value.toString().padStart(2, "0");
  };

  // Fetch progress data
  const fetchProgressData = async () => {
    try {
      setLoadingProgress(true);
      const response = await studySessionAPI.getProgress(30);
      setProgressData(response.courses || []);
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Fetch study history (all sessions)
  const fetchStudyHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await studySessionAPI.getAllSessions({ limit: 50 });
      setStudyHistory(response.sessions || []);
    } catch (error) {
      console.error("Failed to fetch study history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load progress data on component mount
  useEffect(() => {
    fetchProgressData();
    fetchStudyHistory();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Format duration for display
  const formatDuration = (duration) => {
    const parts = [];
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);
    if (duration.seconds > 0) parts.push(`${duration.seconds}s`);
    return parts.join(' ') || '0s';
  };

  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  return (
    <div className="productivity-page">
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
            <button className="nav-link active">
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
      <main className="main-content">
        <h1 className="page-title">Productivity</h1>

        {/* Progress Tracker Section */}
        <section className="progress-section">
          <h2 className="section-title">Progress Tracker (Last 30 Days)</h2>
          <div className="progress-cards">
            {loadingProgress ? (
              <div className="loading-state">Loading progress...</div>
            ) : progressData.length === 0 ? (
              <div className="empty-progress-state">
                <p>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'bottom' }}>
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  No study sessions recorded yet
                </p>
                <p className="empty-hint">Start a timer to track your study progress!</p>
              </div>
            ) : (
              progressData.map((course, index) => (
                <div className="progress-card" key={index}>
                  <div className="card-header">
                    <h3 className="subject-title">{course.courseName}</h3>
                    <span className="progress-change positive">
                      {course.sessionCount} session{course.sessionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="progress-stats">
                    <div className="stat-item">
                      <div className="stat-value">{course.totalHours}h</div>
                      <div className="stat-label">Total Time</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{Math.round(course.totalHours / course.sessionCount * 10) / 10}h</div>
                      <div className="stat-label">Avg/Session</div>
                    </div>
                  </div>
                  <div className="course-time-detail">
                    {course.totalMinutes} minutes total
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Focus Timer Section */}
        <section className="timer-section">
          <h2 className="section-title">Focus Timer</h2>
          <div className="timer-container">
            {/* Subject Name Input */}
            <div className="subject-input-container">
              <input
                type="text"
                placeholder="What are you studying? (e.g., Mathematics, Science, History...)"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="subject-input"
                disabled={isRunning}
              />
            </div>

            {/* Timer Display */}
            <div className="timer-display">
              <div className="time-unit">
                <div className="time-value">{formatTime(timer.hours)}</div>
                <div className="time-label">Hours</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timer.minutes)}</div>
                <div className="time-label">Minutes</div>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <div className="time-value">{formatTime(timer.seconds)}</div>
                <div className="time-label">Seconds</div>
              </div>
            </div>

            {/* Time Editor */}
            {!isRunning && (
              <div className="time-editor">
                <button
                  className="edit-time-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Edit" : "Edit Time"}
                </button>

                {isEditing && (
                  <div className="time-inputs">
                    <div className="time-input-group">
                      <label>Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={editableTime.hours}
                        onChange={(e) => handleTimeChange("hours", e.target.value)}
                        className="time-input"
                      />
                    </div>
                    <div className="time-input-group">
                      <label>Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editableTime.minutes}
                        onChange={(e) => handleTimeChange("minutes", e.target.value)}
                        className="time-input"
                      />
                    </div>
                    <div className="time-input-group">
                      <label>Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editableTime.seconds}
                        onChange={(e) => handleTimeChange("seconds", e.target.value)}
                        className="time-input"
                      />
                    </div>
                    <div className="time-edit-controls">
                      <button className="apply-btn" onClick={applyTimeChanges}>
                        Apply
                      </button>
                      <button className="cancel-btn" onClick={cancelTimeChanges}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current Subject Display */}
            {subjectName && (
              <div className="current-subject">
                <span className="subject-label">Currently studying:</span>
                <span className="subject-name">{subjectName}</span>
              </div>
            )}

            {/* Timer Controls */}
            <div className="timer-controls">
              {!isRunning ? (
                <button className="start-btn" onClick={startTimer}>
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </span>
                  Start
                </button>
              ) : (
                <button className="pause-btn" onClick={pauseTimer}>
                  <span className="btn-icon">
                    {isPaused ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    )}
                  </span>
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}

              <button className="end-btn" onClick={endTimer} disabled={!isRunning}>
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </span>
                End
              </button>

              <button className="reset-btn" onClick={resetTimer}>
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </span>
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Study History Section */}
        <section className="history-section">
          <div className="history-header">
            <h2 className="section-title">Study History</h2>
            <button
              className="toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? (
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  Hide History
                </span>
              ) : (
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  Show History
                </span>
              )}
            </button>
          </div>

          {showHistory && (
            <div className="history-content">
              {loadingHistory ? (
                <div className="loading-state">Loading study history...</div>
              ) : studyHistory.length === 0 ? (
                <div className="empty-history-state">
                  <p>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'bottom' }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    No study sessions yet
                  </p>
                  <p className="empty-hint">Complete a study session to see it here!</p>
                </div>
              ) : (
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Duration</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studyHistory.map((session) => (
                        <tr key={session._id}>
                          <td className="course-cell">
                            <span className="course-badge">{session.courseName}</span>
                          </td>
                          <td className="duration-cell">
                            {formatDuration(session.duration)}
                          </td>
                          <td className="date-cell">
                            {formatDate(session.date)}
                          </td>
                          <td className="time-cell">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        {/* To-Do List Section */}
        <section className="todo-section">
          <h2 className="section-title">Prioritized To-Do List</h2>

          {/* Add Task Form */}
          <div className="add-task-form">
            <div className="form-inputs">
              <input
                type="text"
                placeholder="Enter new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="task-input"
                onKeyPress={(e) => e.key === "Enter" && addTask()}
              />
              <input
                type="text"
                placeholder="Due date (optional)"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="due-input"
                onKeyPress={(e) => e.key === "Enter" && addTask()}
              />
            </div>
            <button className="add-task-btn" onClick={addTask}>
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              Add Task
            </button>
          </div>

          {/* Task List */}
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                  <input
                    type="checkbox"
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <label htmlFor={`todo-${todo.id}`} className="todo-content">
                    <div className="todo-text">{todo.text}</div>
                    <div className="todo-due">{todo.due}</div>
                  </label>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(todo.id)}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductivityPage;
