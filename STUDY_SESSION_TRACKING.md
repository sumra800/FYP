# Study Session Tracking System

## Overview
The Study Session Tracking system automatically saves study time to the database when users complete a focus timer session. The Progress Tracker displays real-time data showing how much time has been spent on each course.

---

## Features

### ✅ Implemented Features

1. **Automatic Session Saving**
   - When user clicks "End" on timer, session is saved to database
   - Tracks course name, duration, start time, and end time

2. **Dynamic Progress Tracker**
   - Replaces static "Math" and "Science" with real user data
   - Shows ALL courses the user has studied
   - Displays total hours per course
   - Shows number of study sessions
   - Calculates average time per session
   - Last 30 days of data

3. **Comprehensive Statistics**
   - Total study time in hours and minutes
   - Session count per course
   - Average session duration
   - Last studied date

---

## Backend Implementation

### 1. Database Model (`server/model/studySessionModel.js`)

```javascript
{
  userId: ObjectId (ref: User),
  courseName: String,
  duration: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  totalSeconds: Number,
  startTime: Date,
  endTime: Date,
  date: Date
}
```

**Indexes:**
- `{ userId, courseName }`
- `{ userId, date }`
- `{ userId, courseName, date }`

### 2. API Endpoints (`server/routes/studySessionRoute.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study-sessions` | Create a new study session |
| GET | `/api/study-sessions` | Get all sessions (with filters) |
| GET | `/api/study-sessions/progress` | Get aggregated progress by course |
| GET | `/api/study-sessions/course/:courseName` | Get stats for specific course |
| DELETE | `/api/study-sessions/:id` | Delete a session |

### 3. Controller Functions (`server/controller/studySessionController.js`)

- **createStudySession**: Saves study session with validation
- **getAllStudySessions**: Retrieves sessions with optional filters
- **getStudyProgress**: Aggregates data by course for last N days
- **getCourseStatistics**: Detailed stats for a specific course
- **deleteStudySession**: Removes a session (user can only delete their own)

---

## Frontend Implementation

### 1. API Service (`client/src/services/api.js`)

```javascript
export const studySessionAPI = {
  createSession: async (sessionData) => {...},
  getAllSessions: async (filters = {}) => {...},
  getProgress: async (days = 30) => {...},
  getCourseStats: async (courseName) => {...},
  deleteSession: async (id) => {...}
};
```

### 2. Productivity Page Updates (`client/src/Components/productivity/productivityPage.jsx`)

**New State Variables:**
- `sessionStartTime`: Records when timer starts
- `initialTimerValue`: Stores starting time value
- `progressData`: Array of course progress data
- `loadingProgress`: Loading state for progress data

**Modified Functions:**

```javascript
// startTimer - Records start time
const startTimer = () => {
  setSessionStartTime(new Date());
  setInitialTimerValue({ ...timer });
  // ... rest of logic
};

// endTimer - Saves session to database
const endTimer = async () => {
  // Calculate time studied
  const studiedSeconds = initialSeconds - remainingSeconds;
  
  if (studiedSeconds > 0 && subjectName.trim()) {
    await studySessionAPI.createSession({
      courseName: subjectName.trim(),
      duration: {...},
      startTime: sessionStartTime,
      endTime: new Date()
    });
    
    fetchProgressData(); // Refresh display
  }
};
```

**New Functions:**

```javascript
// fetchProgressData - Gets aggregated data from API
const fetchProgressData = async () => {
  const response = await studySessionAPI.getProgress(30);
  setProgressData(response.courses || []);
};
```

### 3. Progress Tracker UI

**Before (Static):**
```jsx
<div className="progress-card">
  <h3>Math</h3>
  <div>80%</div>
</div>
```

**After (Dynamic):**
```jsx
{progressData.map((course) => (
  <div className="progress-card">
    <h3>{course.courseName}</h3>
    <div className="stat-value">{course.totalHours}h</div>
    <div>{course.sessionCount} sessions</div>
    <div>{course.totalMinutes} minutes total</div>
  </div>
))}
```

---

## User Flow

### How to Use:

1. **Navigate to Productivity Page**
   - Click "Productivity Tools" from dashboard or header

2. **Enter Course Name**
   - Type the course you're studying (e.g., "Mathematics", "Computer Science")

3. **Set Timer**
   - Default: 25 minutes (Pomodoro technique)
   - Can edit time using "Edit Time" button
   - Set custom hours, minutes, seconds

4. **Start Studying**
   - Click "Start" button
   - Timer counts down
   - Can pause/resume as needed

5. **End Session**
   - Click "End" button when done studying
   - Session is automatically saved to database
   - Progress Tracker updates immediately

6. **View Progress**
   - Scroll to "Progress Tracker" section
   - See all courses you've studied
   - View total hours and session counts

### Example:

```
📝 User Actions:
1. Enter "Data Structures" in subject field
2. Click Start (25:00 timer begins)
3. Study for 25 minutes
4. Click End

💾 What Happens:
- Session saved to database:
  - Course: "Data Structures"
  - Duration: 25 minutes
  - Start: 2:00 PM
  - End: 2:25 PM

📊 Progress Tracker Shows:
┌─────────────────────────────┐
│ Data Structures             │
│ 0.42h                       │
│ 1 session                   │
│ 25 minutes total            │
└─────────────────────────────┘
```

---

## API Request Examples

### Create a Study Session
```javascript
POST /api/study-sessions
Headers: { Authorization: "Bearer <token>" }
Body: {
  "courseName": "Computer Science",
  "duration": {
    "hours": 1,
    "minutes": 30,
    "seconds": 0
  },
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T15:30:00.000Z",
  "totalSeconds": 5400
}

Response: {
  "message": "Study session saved successfully",
  "session": { ... }
}
```

### Get Progress Data
```javascript
GET /api/study-sessions/progress?days=30
Headers: { Authorization: "Bearer <token>" }

Response: {
  "message": "Study progress retrieved successfully",
  "days": 30,
  "courses": [
    {
      "courseName": "Computer Science",
      "totalMinutes": 150,
      "totalHours": 2.5,
      "sessionCount": 3,
      "lastStudied": "2024-01-15T15:30:00.000Z"
    },
    {
      "courseName": "Mathematics",
      "totalMinutes": 90,
      "totalHours": 1.5,
      "sessionCount": 2,
      "lastStudied": "2024-01-14T12:00:00.000Z"
    }
  ]
}
```

### Get Course Statistics
```javascript
GET /api/study-sessions/course/Computer%20Science
Headers: { Authorization: "Bearer <token>" }

Response: {
  "message": "Course statistics retrieved successfully",
  "courseName": "Computer Science",
  "stats": {
    "totalMinutes": 150,
    "totalHours": 2.5,
    "sessionCount": 3,
    "avgMinutesPerSession": 50,
    "lastStudied": "2024-01-15T15:30:00.000Z"
  }
}
```

---

## Database Queries

### Get All Sessions for a User
```javascript
db.studysessions.find({ userId: ObjectId("...") })
  .sort({ date: -1 });
```

### Get Progress by Course (Aggregation)
```javascript
db.studysessions.aggregate([
  {
    $match: {
      userId: ObjectId("..."),
      date: { $gte: new Date("2024-01-01") }
    }
  },
  {
    $group: {
      _id: "$courseName",
      totalMinutes: { $sum: { $divide: ["$totalSeconds", 60] } },
      sessionCount: { $sum: 1 }
    }
  },
  {
    $sort: { totalMinutes: -1 }
  }
]);
```

---

## Testing

### Manual Testing Steps:

1. **Start Server**
   ```bash
   cd server
   npm start
   ```

2. **Start Client**
   ```bash
   cd client
   npm start
   ```

3. **Test Session Creation**
   - Go to Productivity page
   - Enter "Test Course" as subject
   - Set timer to 1 minute
   - Click Start
   - Wait for 30 seconds
   - Click End
   - Check if session was saved (look at server logs)

4. **Test Progress Display**
   - Verify "Test Course" appears in Progress Tracker
   - Check if time shows as ~0.01h (0.5 minutes)
   - Session count should be 1

5. **Test Multiple Courses**
   - Repeat with "Another Course"
   - Both should appear in Progress Tracker

6. **Test Multiple Sessions Same Course**
   - Create another session for "Test Course"
   - Session count should increment
   - Total time should increase

### Expected Results:

```
Progress Tracker:
┌─────────────────────────────┐
│ Test Course                 │
│ 0.02h            2 sessions │
│ 1 minute total              │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Another Course              │
│ 0.01h            1 session  │
│ 0.5 minutes total           │
└─────────────────────────────┘
```

---

## Troubleshooting

### Session Not Saving

**Problem**: Clicked "End" but nothing appears in Progress Tracker

**Solutions**:
1. Check if you entered a course name
2. Make sure timer actually ran (not still at initial time)
3. Check browser console for errors
4. Check server logs for API errors
5. Verify you're logged in (check auth token)

### Progress Not Loading

**Problem**: Progress Tracker shows "Loading..." forever

**Solutions**:
1. Check server is running
2. Check MongoDB is connected
3. Open browser console, look for network errors
4. Verify auth token is valid
5. Check API endpoint `/api/study-sessions/progress`

### Wrong Time Displayed

**Problem**: Shows incorrect study time

**Solutions**:
1. Make sure you clicked "End", not "Reset"
2. Check if timer completed vs. manually ended
3. Verify timezone settings
4. Check database entries directly

---

## Future Enhancements

Potential improvements:

- [ ] Weekly/monthly/yearly views
- [ ] Charts and graphs for visual progress
- [ ] Study streak tracking
- [ ] Goals and targets (e.g., "Study 10 hours this week")
- [ ] Export data to PDF/CSV
- [ ] Compare progress between courses
- [ ] Study reminders based on last session
- [ ] Integration with calendar for scheduled study times
- [ ] Leaderboard (compare with friends)
- [ ] Achievements and badges

---

## File Structure

```
server/
├── model/
│   └── studySessionModel.js      # Database schema
├── controller/
│   └── studySessionController.js # Business logic
├── routes/
│   └── studySessionRoute.js      # API routes
└── index.js                       # Route registration

client/
├── src/
│   ├── services/
│   │   └── api.js                # studySessionAPI added
│   └── Components/
│       └── productivity/
│           ├── productivityPage.jsx  # Updated with tracking
│           └── productivityPage.css  # New progress styles
```

---

## Summary

✅ Users can track study time per course  
✅ Data persists in MongoDB  
✅ Progress Tracker shows real-time statistics  
✅ Responsive design with dark/light mode support  
✅ Secure (requires authentication)  
✅ Easy to use (automatic saving)  

The Study Session Tracking system is now fully functional and integrated into your application!

