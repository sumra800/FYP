# 🚀 Google Classroom Integration - Quick Start Checklist

Follow these steps in order to get your Google Classroom integration working!

---

## ☑️ Pre-Setup (Already Done!)

- [x] ✅ Packages installed (`googleapis`, `node-cron`)
- [x] ✅ Backend code implemented
- [x] ✅ Frontend components created
- [x] ✅ Database models updated
- [x] ✅ API endpoints configured

---

## 📝 What YOU Need to Do (15 minutes)

### Step 1: Google Cloud Setup (5 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing)
- [ ] Enable **Google Classroom API**
  - Navigation: "APIs & Services" → "Library"
  - Search: "Google Classroom API"
  - Click: "Enable"

### Step 2: OAuth Credentials (5 minutes)

- [ ] Go to "APIs & Services" → "Credentials"
- [ ] Click "Create Credentials" → "OAuth client ID"
- [ ] Configure OAuth consent screen (if prompted):
  - [ ] User Type: **External**
  - [ ] App name: **Study Buddy**
  - [ ] Your email as support & developer contact
  - [ ] Save and continue
- [ ] Create OAuth Client ID:
  - [ ] Application type: **Web application**
  - [ ] Name: **Study Buddy OAuth**
  - [ ] Authorized redirect URIs:
    ```
    http://localhost:7000/api/google-classroom/oauth2callback
    ```
  - [ ] Click **Create**
- [ ] **COPY** the Client ID and Client Secret (you'll need these!)

### Step 3: Environment Configuration (2 minutes)

- [ ] Open or create `server/.env` file
- [ ] Add these lines (replace with YOUR credentials):
  ```env
  GOOGLE_CLIENT_ID=your_client_id_from_step_2
  GOOGLE_CLIENT_SECRET=your_client_secret_from_step_2
  GOOGLE_REDIRECT_URI=http://localhost:7000/api/google-classroom/oauth2callback
  ```
- [ ] Save the file

### Step 4: Start Your Server (1 minute)

- [ ] Stop your server if it's running (Ctrl+C)
- [ ] Restart the server:
  ```bash
  cd server
  npm run dev
  ```
- [ ] Verify you see:
  ```
  Google Classroom auto-sync scheduled:
  - Every 30 minutes
  - Daily at midnight
  Google Classroom integration enabled
  ```

### Step 5: Test the Integration (2 minutes)

- [ ] Make sure your client is running:
  ```bash
  cd client
  npm start
  ```
- [ ] Login to Study Buddy
- [ ] Navigate to Dashboard
- [ ] You should see **Google Classroom Integration** card
- [ ] Click **"Connect Google Classroom"**
- [ ] Authorize with your Google account (that has classroom courses)
- [ ] Wait for redirect back to dashboard
- [ ] Click **"Sync Now"** to manually sync
- [ ] Check if your assignments appear! 🎉

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] Google Classroom card shows "Connected" status
- [ ] Last sync time is displayed
- [ ] Your Google Classroom assignments appear in the assignments table
- [ ] Assignments have a Google Classroom icon badge
- [ ] Clicking the assignment shows "View in Google Classroom →" link
- [ ] Clicking "Sync Now" fetches new assignments
- [ ] No errors in server console
- [ ] No errors in browser console

---

## 🐛 Troubleshooting Quick Fixes

### "Failed to connect"
- [ ] Check `.env` file has correct credentials
- [ ] Verify redirect URI matches exactly in Google Cloud Console
- [ ] Make sure Google Classroom API is enabled

### "No assignments syncing"
- [ ] Verify you have active courses in Google Classroom
- [ ] Check you're logged in with same Google account
- [ ] Look at server logs for errors
- [ ] Try "Sync Now" button

### "Server won't start"
- [ ] Check MongoDB is running
- [ ] Verify `.env` file syntax (no extra spaces)
- [ ] Make sure packages are installed: `npm install`

---

## 📚 Reference Documents

- **Full Setup Guide**: `GOOGLE_CLASSROOM_SETUP.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **This Checklist**: `QUICK_START_CHECKLIST.md`

---

## 🎯 Expected Behavior

Once connected:

1. **Automatic Sync**: Every 30 minutes
2. **Manual Sync**: Click "Sync Now" button anytime
3. **Visual Indicators**: Google Classroom badge on assignments
4. **Direct Links**: Click to open assignments in Google Classroom
5. **Full Integration**: Use all Study Buddy features with synced assignments

---

## ⏱️ Time Estimate

- Google Cloud Setup: **5 minutes**
- OAuth Configuration: **5 minutes**
- Environment Setup: **2 minutes**
- Testing: **3 minutes**
- **Total: ~15 minutes**

---

## 🆘 Still Need Help?

1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure MongoDB is running
4. Review `GOOGLE_CLASSROOM_SETUP.md` for detailed instructions

---

## ✨ You're Almost There!

Just complete the checklist above and you'll be syncing Google Classroom assignments in no time!

**Remember**: The hard part (coding) is already done. You just need to set up Google Cloud credentials! 🚀

Good luck! 🎓📚

