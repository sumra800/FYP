
import React, { useState, useEffect } from "react";
import "./productivityPage.css";

const ProductivityPage = ({ onNavigateToDashboard }) => {
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
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    }
  };

  const endTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
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

  return (
    <div className="productivity-page">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <nav className="nav-links">
            <button className="nav-link" onClick={onNavigateToDashboard}>
              <span className="nav-icon">⊞</span>
              Dashboard
            </button>
            <button className="nav-link">
              <span className="nav-icon">👥</span>
              Study Partners
            </button>
            <button className="nav-link">
              <span className="nav-icon">&lt;/&gt;</span>
              Coding
            </button>
            <button className="nav-link active">
              <span className="nav-icon">🕐</span>
              Productivity
            </button>
            <button className="nav-link">
              <span className="nav-icon">❓</span>
              Ask-A-Senior
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Productivity</h1>

        {/* Progress Tracker Section */}
        <section className="progress-section">
          <h2 className="section-title">Progress Tracker</h2>
          <div className="progress-cards">
            <div className="progress-card">
              <div className="card-header">
                <h3 className="subject-title">Math</h3>
                <span className="progress-change positive">Last 30 Days +10%</span>
              </div>
              <div className="progress-value">80%</div>
              <div className="progress-chart">
                <div className="chart-line">
                  <div className="chart-point" style={{height: "60%"}}></div>
                  <div className="chart-point" style={{height: "80%"}}></div>
                  <div className="chart-point" style={{height: "90%"}}></div>
                  <div className="chart-point" style={{height: "100%"}}></div>
                </div>
                <div className="chart-labels">
                  <span>W1</span>
                  <span>W2</span>
                  <span>W3</span>
                  <span>W4</span>
                </div>
              </div>
            </div>

            <div className="progress-card">
              <div className="card-header">
                <h3 className="subject-title">Science</h3>
                <span className="progress-change positive">Last 30 Days +5%</span>
              </div>
              <div className="progress-value">70%</div>
              <div className="progress-chart">
                <div className="chart-line">
                  <div className="chart-point" style={{height: "50%"}}></div>
                  <div className="chart-point" style={{height: "65%"}}></div>
                  <div className="chart-point" style={{height: "75%"}}></div>
                  <div className="chart-point" style={{height: "100%"}}></div>
                </div>
                <div className="chart-labels">
                  <span>W1</span>
                  <span>W2</span>
                  <span>W3</span>
                  <span>W4</span>
                </div>
              </div>
            </div>
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
                  <span className="btn-icon">▶</span>
                  Start
                </button>
              ) : (
                <button className="pause-btn" onClick={pauseTimer}>
                  <span className="btn-icon">{isPaused ? "▶" : "⏸"}</span>
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}
              
              <button className="end-btn" onClick={endTimer} disabled={!isRunning}>
                <span className="btn-icon">⏹</span>
                End
              </button>
              
              <button className="reset-btn" onClick={resetTimer}>
                <span className="btn-icon">🔄</span>
                Reset
              </button>
            </div>
          </div>
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
              <span className="btn-icon">+</span>
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
