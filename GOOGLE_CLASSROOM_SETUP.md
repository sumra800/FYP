# Google Classroom Integration Setup Guide

## 🎉 Overview
Your Study Buddy app now has **full Google Classroom integration**! Assignments from all your Google Classroom courses will automatically sync to your dashboard every 30 minutes.

## 📋 What's Been Implemented

### Backend Features
✅ **OAuth 2.0 Authentication** - Secure Google login
✅ **Automatic Syncing** - Every 30 minutes + daily at midnight
✅ **Google Classroom API Integration** - Fetch courses and assignments
✅ **Database Schema Updates** - Store Google tokens and classroom data
✅ **RESTful API Endpoints** - Connect, sync, disconnect functionality

### Frontend Features
✅ **Google Classroom Integration Component** - Beautiful UI card
✅ **Connect/Disconnect Buttons** - Easy management
✅ **Manual Sync Button** - Sync on demand
✅ **Visual Indicators** - Google Classroom badge on assignments
✅ **Direct Links** - Click to view assignments in Google Classroom

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Navigate to the server directory and install the new packages:

```bash
cd server
npm install
```

This will install:
- `googleapis` - Google Classroom API client
- `node-cron` - Automatic scheduling for syncing

### Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Classroom API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Classroom API"
   - Click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Study Buddy
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through all steps

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Study Buddy OAuth
   - Authorized redirect URIs:
     ```
     http://localhost:7000/api/google-classroom/oauth2callback
     ```
   - For production, add:
     ```
     https://yourdomain.com/api/google-classroom/oauth2callback
     ```

5. **Save the Client ID and Client Secret**

### Step 4: Configure Environment Variables

Create or update your `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/studybuddy

# Server Port
PORT=7000

# JWT Secret (keep your existing one)
JWT_SECRET=your_existing_jwt_secret

# Google Classroom API Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:7000/api/google-classroom/oauth2callback
```

**Important:** Replace `your_google_client_id_here` and `your_google_client_secret_here` with the credentials from Step 3!

### Step 5: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
Connected to MongoDB successfully
Google Classroom auto-sync scheduled:
- Every 30 minutes
- Daily at midnight
Server is running on port: 7000
Google Classroom integration enabled
```

### Step 6: Start the Client

In a new terminal:

```bash
cd client
npm start
```

---

## 💡 How to Use

### Connecting Google Classroom

1. **Login to your Study Buddy account**
2. **Navigate to the Dashboard**
3. You'll see the **Google Classroom Integration** card at the top
4. Click **"Connect Google Classroom"**
5. **Authorize** Study Buddy to access your Google Classroom data
6. **Wait for redirect** - Your assignments will start syncing automatically!

### Syncing Assignments

**Automatic Syncing:**
- Every **30 minutes** automatically
- Every day at **midnight**
- Immediately after connecting

**Manual Sync:**
- Click the **"Sync Now"** button anytime
- Useful when you know new assignments were just posted

### Viewing Synced Assignments

Assignments from Google Classroom will appear in your dashboard with:
- 📗 **Google Classroom icon badge**
- **"View in Google Classroom →"** link
- All regular Study Buddy features (status updates, etc.)

### Disconnecting

1. Click **"Disconnect"** button in the Google Classroom card
2. Confirm the action
3. Your synced assignments will remain, but no new ones will be added

---

## 🔧 API Endpoints

Your backend now has these new endpoints:

### Get OAuth URL
```
GET /api/google-classroom/auth-url?userId={userId}
```

### OAuth Callback (Automatic)
```
GET /api/google-classroom/oauth2callback
```

### Get Connection Status
```
GET /api/google-classroom/status
Headers: Authorization: Bearer {token}
```

### Manual Sync
```
POST /api/google-classroom/sync
Headers: Authorization: Bearer {token}
```

### Disconnect
```
POST /api/google-classroom/disconnect
Headers: Authorization: Bearer {token}
```

---

## 📊 Database Schema Updates

### User Model
Added `googleAuth` field:
```javascript
googleAuth: {
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  isConnected: Boolean,
  lastSync: Date
}
```

### Assignment Model
Added `googleClassroom` field:
```javascript
googleClassroom: {
  isFromClassroom: Boolean,
  courseId: String,
  courseName: String,
  courseWorkId: String,
  alternateLink: String,
  maxPoints: Number,
  workType: String,
  lastSyncedAt: Date
}
```

---

## 🔒 Security & Privacy

### What We Access
- Course list (read-only)
- Course work/assignments (read-only)
- Assignment announcements (read-only)

### What We DON'T Access
- Grades or submissions
- Private messages
- Student data (if you're a teacher)
- Ability to post or modify anything

### Data Storage
- Only **OAuth tokens** are stored (encrypted in database)
- Assignment data is **synced** to your dashboard
- You can **disconnect anytime** and delete all data

---

## 🐛 Troubleshooting

### "Failed to connect to Google Classroom"
- Check that Google Classroom API is enabled in Google Cloud Console
- Verify your Client ID and Client Secret are correct in `.env`
- Make sure redirect URI matches exactly (including http/https)

### "No assignments are syncing"
- Check that you have active courses in Google Classroom
- Verify you're logged in with the same Google account
- Try clicking "Sync Now" manually
- Check server logs for errors

### "Token expired" errors
- The app automatically refreshes tokens
- If issues persist, disconnect and reconnect

### MongoDB connection issues
- Ensure MongoDB is running: `mongod`
- Check MONGO_URL in `.env` file

---

## 🎨 Customization

### Change Sync Frequency

Edit `server/services/classroomSyncService.js`:

```javascript
// Change from 30 minutes to your preference
cron.schedule('*/15 * * * *', () => {  // Every 15 minutes
  syncAllUsers();
});
```

### Modify UI Colors

Edit `client/src/Components/dashboard/GoogleClassroomIntegration.css` to match your brand colors.

---

## 📝 Testing Checklist

- [ ] Google Cloud project created
- [ ] Google Classroom API enabled
- [ ] OAuth credentials configured
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] Can connect to Google Classroom
- [ ] Assignments sync correctly
- [ ] Assignments show Google Classroom badge
- [ ] Can click through to Google Classroom
- [ ] Manual sync works
- [ ] Can disconnect successfully

---

## 🚀 Going to Production

When deploying to production:

1. **Update redirect URI** in Google Cloud Console
2. **Update `.env`** with production URLs:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-classroom/oauth2callback
   ```
3. **Update frontend redirect** in `googleClassroomController.js`:
   ```javascript
   res.redirect(`https://yourdomain.com/dashboard?classroomConnected=true`);
   ```

4. **OAuth Consent Screen**:
   - Go through Google's verification process
   - Required for more than 100 users

---

## 📚 Additional Resources

- [Google Classroom API Documentation](https://developers.google.com/classroom)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)

---

## 🎉 Enjoy Your Integration!

Your assignments will now automatically sync from Google Classroom. You'll never miss a deadline again! 🎓

If you have any questions or issues, check the troubleshooting section or review the server logs.

Happy studying! 📚✨

