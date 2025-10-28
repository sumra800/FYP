# Dashboard Study Statistics - Real-Time Data Integration

## Overview
The Dashboard now displays **real study session data** from the database for Weekly and Monthly Study Hours. Previously static values (25 and 100) are now dynamically fetched from MongoDB.

---

## What Was Changed

### ✅ Backend Changes

#### 1. New API Endpoint
**File**: `server/controller/studySessionController.js`

Added `getWeeklyMonthlyStats()` function:
- Calculates study hours for current week vs last week
- Calculates study hours for current month vs last month
- Returns percentage change for both
- Returns session counts

**Endpoint**: `GET /api/study-sessions/weekly-monthly`

**Response Example**:
```json
{
  "message": "Weekly and monthly statistics retrieved successfully",
  "weekly": {
    "hours": 12.5,
    "sessionCount": 8,
    "change": 25.0
  },
  "monthly": {
    "hours": 45.3,
    "sessionCount": 28,
    "change": 15.2
  }
}
```

#### 2. Route Registration
**File**: `server/routes/studySessionRoute.js`

Added route:
```javascript
router.get("/weekly-monthly", auth, studySessionController.getWeeklyMonthlyStats);
```

### ✅ Frontend Changes

#### 1. API Service Update
**File**: `client/src/services/api.js`

Added method:
```javascript
getWeeklyMonthlyStats: async () => {
  return await apiRequest('/study-sessions/weekly-monthly');
}
```

#### 2. Dashboard Component Update
**File**: `client/src/Components/dashboard/dashboardPage.jsx`

**Changes**:
- Imported `studySessionAPI`
- Added state for study statistics
- Created `fetchStudyStats()` function
- Updated UI to display real data
- Shows loading state while fetching
- Displays percentage change (positive/negative)
- Shows session count

**Before (Static)**:
```jsx
<div className="metric-value">25</div>
<div className="metric-change positive">+10%</div>
```

**After (Dynamic)**:
```jsx
<div className="metric-value">
  {statsLoading ? "..." : studyStats.weekly.hours}
</div>
<div className={`metric-change ${studyStats.weekly.change >= 0 ? 'positive' : 'negative'}`}>
  {statsLoading ? "" : `${studyStats.weekly.change >= 0 ? '+' : ''}${studyStats.weekly.change}%`}
</div>
{!statsLoading && studyStats.weekly.sessionCount > 0 && (
  <div className="session-count">{studyStats.weekly.sessionCount} sessions</div>
)}
```

#### 3. CSS Update
**File**: `client/src/Components/dashboard/dashboardPage.css`

Added `.session-count` styling for displaying session counts.

---

## How It Works

### Data Flow

```
1. User studies on Productivity Page
   ↓
2. Timer ends, session saved to MongoDB
   ↓
3. Dashboard loads/refreshes
   ↓
4. Fetches study statistics via API
   ↓
5. Backend aggregates data:
   - Current week (Sunday to today)
   - Last week (for comparison)
   - Current month (1st to today)
   - Last month (for comparison)
   ↓
6. Calculates percentage changes
   ↓
7. Returns data to frontend
   ↓
8. Dashboard displays real numbers
```

### Week Calculation
- **Current Week**: From last Sunday (00:00) to now
- **Last Week**: 7 days before last Sunday to last Sunday

### Month Calculation
- **Current Month**: From 1st of month (00:00) to now
- **Last Month**: From 1st of last month to last day of last month

### Percentage Change Formula
```javascript
change = ((currentHours - lastHours) / lastHours) * 100
```

If last period had 0 hours, change is 0%.

---

## Display Examples

### Scenario 1: Active Student
```
┌────────────────────────────┐
│ Weekly Study Hours         │
│       12.5h                │
│       +25%                 │ (Green)
│    8 sessions              │
└────────────────────────────┘

┌────────────────────────────┐
│ Monthly Study Hours        │
│       45.3h                │
│       +15%                 │ (Green)
│    28 sessions             │
└────────────────────────────┘
```

### Scenario 2: Decreased Activity
```
┌────────────────────────────┐
│ Weekly Study Hours         │
│       3.5h                 │
│       -30%                 │ (Red)
│    2 sessions              │
└────────────────────────────┘
```

### Scenario 3: New User (No Data Yet)
```
┌────────────────────────────┐
│ Weekly Study Hours         │
│       0h                   │
│       0%                   │
└────────────────────────────┘
```

---

## Testing

### Manual Test Steps

1. **Start with Fresh Data**
   ```bash
   # Clear study sessions (optional, for testing)
   # In MongoDB: db.studysessions.deleteMany({})
   ```

2. **Create Study Sessions**
   - Go to Productivity page
   - Enter course name: "Test Course"
   - Set timer to 2 minutes
   - Click Start
   - Let it run for 1 minute
   - Click End
   - Repeat 2-3 times

3. **Check Dashboard**
   - Go to Dashboard
   - Look at "Weekly Performance" section
   - Should show: hours (e.g., "0.1h"), session count
   - Since there's no last week data, change will be 0%

4. **Test Percentage Change**
   - Wait until next week
   - Create more sessions
   - Dashboard should show positive % change

### Expected Results

After 3 sessions of 1 minute each:
- **Weekly Hours**: 0.05h (3 minutes = 0.05 hours)
- **Session Count**: 3
- **Change**: 0% (no previous week data)

---

## API Testing

### Using curl:
```bash
curl -X GET http://localhost:7000/api/study-sessions/weekly-monthly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Browser Console:
```javascript
// Get token
const token = localStorage.getItem('authToken');

// Fetch stats
fetch('http://localhost:7000/api/study-sessions/weekly-monthly', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Database Queries

### Get all sessions this week:
```javascript
// In MongoDB shell
const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
startOfWeek.setHours(0, 0, 0, 0);

db.studysessions.find({
  date: { $gte: startOfWeek }
});
```

### Aggregate hours by week:
```javascript
db.studysessions.aggregate([
  {
    $group: {
      _id: { $week: "$date" },
      totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } },
      count: { $sum: 1 }
    }
  }
]);
```

---

## Troubleshooting

### Problem: Shows 0 hours even after studying
**Solution**:
1. Check if sessions are being saved (MongoDB)
2. Verify date field is set correctly
3. Check if userId matches logged-in user
4. Look at browser console for errors

### Problem: Percentage shows NaN or Infinity
**Solution**: This happens when last period had 0 hours. The code handles this by returning 0%, but check the controller logic.

### Problem: Loading forever
**Solution**:
1. Check if server is running
2. Check if MongoDB is connected
3. Verify auth token is valid
4. Check network tab for API errors

### Problem: Shows wrong week/month
**Solution**: Check timezone settings. The backend uses server timezone for date calculations.

---

## Future Enhancements

Potential improvements:
- [ ] Add daily statistics
- [ ] Show chart with actual data points
- [ ] Add comparison with average student
- [ ] Yearly statistics
- [ ] Export statistics to PDF
- [ ] Set goals and track progress
- [ ] Email weekly/monthly summary
- [ ] Compare multiple time periods

---

## Files Modified

```
Backend:
✓ server/controller/studySessionController.js (added getWeeklyMonthlyStats)
✓ server/routes/studySessionRoute.js (added route)

Frontend:
✓ client/src/services/api.js (added getWeeklyMonthlyStats)
✓ client/src/Components/dashboard/dashboardPage.jsx (fetch & display)
✓ client/src/Components/dashboard/dashboardPage.css (session count style)
```

---

## Summary

✅ **Weekly Study Hours** now shows real data from database  
✅ **Monthly Study Hours** now shows real data from database  
✅ **Percentage changes** calculated automatically  
✅ **Session counts** displayed  
✅ **Loading states** handled  
✅ **Color coding** for positive (green) / negative (red) changes  

The dashboard is now fully integrated with the study session tracking system!

