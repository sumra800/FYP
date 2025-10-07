import React, { useState, useEffect } from "react";
import "./productivityPage.css";

const ProductivityPage = () => {
  const [timer, setTimer] = useState({ hours: 0, minutes: 25, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [todos, setTodos] = useState([
    { id: 1, text: "Complete Math Assignment", due: "Due: Today", completed: false },
    { id: 2, text: "Review Science Notes", due: "Due: Tomorrow", completed: false },
    { id: 3, text: "Prepare for History Exam", due: "Due: Next Week", completed: false }
  ]);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isRunning) {
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
            return { hours: 0, minutes: 25, seconds: 0 };
          }
          
          return { hours, minutes, seconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer({ hours: 0, minutes: 25, seconds: 0 });
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
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
            <div className="logo-icon"></div>
            <span className="logo-text">Study Buddy</span>
          </div>
          
          <nav className="nav-links">
            <button className="nav-link">
              <span className="nav-icon"></span>
              Dashboard
            </button>
            <button className="nav-link">
              <span className="nav-icon"></span>
              Study Partners
            </button>
            <button className="nav-link">
              <span className="nav-icon">&lt;/&gt;</span>
              Coding
            </button>
            <button className="nav-link active">
              <span className="nav-icon"></span>
              Productivity
            </button>
            <button className="nav-link">
              <span className="nav-icon"></span>
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
            <div className="timer-controls">
              {!isRunning ? (
                <button className="start-btn" onClick={startTimer}>
                  <span className="btn-icon"></span>
                  Start
                </button>
              ) : (
                <button className="stop-btn" onClick={stopTimer}>
                  <span className="btn-icon"></span>
                  Stop
                </button>
              )}
              <button className="reset-btn" onClick={resetTimer}>
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* To-Do List Section */}
        <section className="todo-section">
          <h2 className="section-title">Prioritized To-Do List</h2>
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className="todo-item">
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
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductivityPage;
