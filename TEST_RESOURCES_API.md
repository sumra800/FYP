# Resources API Testing Guide

## Quick Diagnostic Test

Open your browser console (F12 → Console tab) and paste this code:

```javascript
// Test 1: Check if you have an auth token
const token = localStorage.getItem('authToken');
console.log('Token exists:', !!token);
console.log('Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

// Test 2: Try to fetch resources
fetch('http://localhost:7000/api/resources/all', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('OK:', response.ok);
  return response.text();
})
.then(text => {
  console.log('Response:', text);
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  } catch (e) {
    console.log('NOT JSON - Got HTML:', text.substring(0, 100));
  }
})
.catch(error => {
  console.error('Fetch error:', error);
});
```

## Expected Results:

### ✅ If Everything is Working:
```
Token exists: true
Token: eyJhbGciOiJIUzI1NiIsI...
Status: 200
OK: true
Response: {"message":"Resources retrieved successfully","count":0,"resources":[]}
Parsed JSON: {message: "Resources retrieved successfully", ...}
```

### ❌ If Token is Invalid (Auth Fix Not Applied):
```
Token exists: true
Token: eyJhbGciOiJIUzI1NiIsI...
Status: 401
OK: false
Response: {"message":"Token is not valid"}
Parsed JSON: {message: "Token is not valid"}
```

### ❌ If No Token (Need to Login):
```
Token exists: false
Token: NO TOKEN
Status: 401
OK: false
Response: {"message":"No authentication token, access denied"}
```

### ❌ If Server Not Running:
```
Fetch error: Failed to fetch
```

### ❌ If Getting HTML (Wrong endpoint):
```
Status: 404
NOT JSON - Got HTML: <!DOCTYPE html><html>...
```

## Solutions Based on Results:

### Problem: "Token is not valid"
**Solution:**
1. Stop your server (Ctrl+C)
2. Restart: `npm start`
3. Log out from website
4. Log back in
5. Try uploading again

### Problem: "NO TOKEN" 
**Solution:**
1. Log out
2. Log back in

### Problem: "Failed to fetch"
**Solution:**
1. Make sure server is running: `cd server && npm start`

### Problem: Getting HTML instead of JSON
**Solution:**
1. Check if the URL is correct: `http://localhost:7000/api/resources/all`
2. Check server console for errors

## Manual Test Upload (After Above Tests Pass)

```javascript
// Create a test file upload
const formData = new FormData();
formData.append("title", "Test Resource");
formData.append("resourceType", "notes");
formData.append("courseName", "Test Course");
formData.append("year", "2024");
formData.append("semester", "Fall");
formData.append("description", "This is a test");

// You need to manually create a file
// Just create a small text file and add it like this in the upload form
// Then run this after selecting a file:

const token = localStorage.getItem('authToken');
fetch('http://localhost:7000/api/resources/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload result:', data))
.catch(error => console.error('Upload error:', error));
```

---

## Most Common Issue Checklist:

- [ ] MongoDB is running
- [ ] Server is running (`npm start` in server folder)
- [ ] Client is running (`npm start` in client folder)
- [ ] You restarted the server AFTER the auth fix
- [ ] You logged out and logged back in AFTER restarting server
- [ ] Browser cache is cleared (Ctrl+Shift+Delete)
- [ ] No other app is using port 7000

---

Run the diagnostic test above and let me know what you see!

