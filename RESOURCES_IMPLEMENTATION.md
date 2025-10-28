# Resources Database Integration - Implementation Guide

## Overview
The resources feature allows users to upload, view, and download study materials (past papers and notes) stored in your MongoDB database.

---

## Backend Implementation

### 1. Database Model (`server/model/resourceModel.js`)

The Resource model includes:
- **Basic Information**: title, resourceType, courseName, year, semester, description
- **File Information**: fileName, filePath, fileSize, fileType
- **Author Information**: uploadedBy (User ID), authorName
- **Engagement Metrics**: downloads count, views count
- **Status**: isApproved, isPublic
- **Tags**: for searching and categorization

### 2. API Endpoints (`server/routes/resourceRoute.js`)

All endpoints require authentication. Available routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resources/upload` | Upload a new resource |
| GET | `/api/resources/all` | Get all resources (with filters) |
| GET | `/api/resources/type/:type` | Get resources by type (pastPaper/notes) |
| GET | `/api/resources/my-resources` | Get user's uploaded resources |
| GET | `/api/resources/:id` | Get single resource by ID |
| GET | `/api/resources/download/:id` | Download a resource |
| PUT | `/api/resources/:id` | Update a resource |
| DELETE | `/api/resources/:id` | Delete a resource |
| GET | `/api/resources/filters` | Get filter options |

### 3. File Upload Configuration

- **Accepted File Types**: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG
- **Max File Size**: 10MB
- **Storage Location**: `server/uploads/resources/`
- **File Naming**: `resource-{timestamp}-{random}.{extension}`

### 4. Authentication Middleware (`server/middleware/auth.js`)

All resource endpoints are protected by JWT authentication. The middleware:
- Verifies the JWT token from the `Authorization` header
- Extracts the user ID and attaches it to the request
- Returns 401 if token is missing or invalid

---

## Frontend Implementation

### 1. API Service (`client/src/services/api.js`)

The `resourceAPI` object provides methods for:
- **uploadResource(formData)**: Upload a new resource
- **getAllResources(filters)**: Get all resources with optional filters
- **getResourcesByType(type)**: Get resources by type
- **getMyResources()**: Get user's uploaded resources
- **downloadResource(id, fileName)**: Download a resource
- **updateResource(id, data)**: Update a resource
- **deleteResource(id)**: Delete a resource
- **getFilters()**: Get available filter options

### 2. Resources Page (`client/src/Components/resources/resourcesPage.jsx`)

The Resources page has three tabs:

#### **Past Papers Tab**
- Displays all uploaded past papers
- Shows course name, year, semester
- Download button for each paper
- Auto-loads when tab is activated

#### **Notes Tab**
- Displays all uploaded notes
- Shows course name, year, semester, author
- Download button for each note
- Auto-loads when tab is activated

#### **Upload Tab**
- Form to upload new resources
- Fields:
  - Resource Type (Past Paper, Notes, Tutorial)
  - Course Name (required)
  - Year (required)
  - Semester (required)
  - Description (optional)
  - File (required)
- Drag & drop file upload support
- Form validation
- Loading state during upload
- Auto-refresh and tab switch after successful upload

### 3. Features

#### **File Upload with Drag & Drop**
- Users can click to browse or drag files into the upload area
- Visual feedback when dragging files
- File name preview after selection
- Remove file button

#### **Download Functionality**
- Clicking download creates a temporary blob URL
- Triggers automatic download in browser
- Increments download count in database

#### **State Management**
- Loading states (shows "Loading..." while fetching)
- Error states (shows error message if fetch fails)
- Empty states (shows "No resources available" if no data)

#### **Responsive Design**
- Mobile-friendly layout
- Tablet optimization
- Desktop full layout
- Responsive tables and forms

#### **Theme Support**
- Light mode
- Dark mode
- Uses CSS variables for theming

---

## Usage Instructions

### For Users

#### **To Upload a Resource:**
1. Navigate to Dashboard
2. Click "Resources" button (in sidebar or hamburger menu)
3. Click "Upload" tab
4. Fill in the form:
   - Select resource type (Past Paper or Notes)
   - Enter course name (e.g., "Data Structures and Algorithms")
   - Enter year (e.g., "2023")
   - Select semester (Fall, Spring, or Summer)
   - Add a description (optional)
   - Upload file (drag & drop or click to browse)
5. Click "Upload Resource"
6. Wait for success message
7. Resource will appear in the appropriate tab

#### **To Download a Resource:**
1. Go to "Past Papers" or "Notes" tab
2. Find the resource you want
3. Click "Download" button
4. File will download automatically

### For Developers

#### **Setting Up the Database:**
Make sure MongoDB is running and connected. The Resource collection will be created automatically when the first resource is uploaded.

#### **Testing the Upload:**
```bash
# 1. Start the server
cd server
npm start

# 2. Start the client (in another terminal)
cd client
npm start

# 3. Navigate to http://localhost:3000
# 4. Log in
# 5. Go to Resources page
# 6. Upload a test file
```

#### **Checking Uploaded Files:**
Uploaded files are stored in `server/uploads/resources/`

#### **Verifying Database Entries:**
```javascript
// In MongoDB shell or Compass
db.resources.find().pretty()
```

---

## API Request Examples

### Upload a Resource
```javascript
const formData = new FormData();
formData.append("title", "CS101 Final Exam 2023");
formData.append("resourceType", "pastPaper");
formData.append("courseName", "Introduction to Computer Science");
formData.append("year", "2023");
formData.append("semester", "Fall");
formData.append("description", "Final exam with solutions");
formData.append("file", fileObject);

const response = await resourceAPI.uploadResource(formData);
```

### Get Past Papers
```javascript
const response = await resourceAPI.getResourcesByType("pastPaper");
console.log(response.resources);
```

### Get Notes
```javascript
const response = await resourceAPI.getResourcesByType("notes");
console.log(response.resources);
```

### Download a Resource
```javascript
await resourceAPI.downloadResource(resourceId, "filename.pdf");
```

### Filter Resources
```javascript
const response = await resourceAPI.getAllResources({
  courseName: "Computer Science",
  year: "2023",
  semester: "Fall"
});
```

---

## Database Schema

```javascript
{
  _id: ObjectId,
  title: String,
  resourceType: "pastPaper" | "notes" | "tutorial",
  courseName: String,
  year: String,
  semester: "Fall" | "Spring" | "Summer",
  description: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  fileType: String,
  uploadedBy: ObjectId (ref: User),
  authorName: String,
  downloads: Number (default: 0),
  views: Number (default: 0),
  isApproved: Boolean (default: true),
  isPublic: Boolean (default: true),
  tags: [String],
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **File Type Validation**: Only specific file types are allowed
3. **File Size Limit**: Maximum 10MB per file
4. **User Ownership**: Users can only update/delete their own resources
5. **Auto-approval**: Resources are auto-approved (can be changed for moderation)

---

## Future Enhancements

Potential features to add:
- [ ] Search functionality
- [ ] Advanced filtering (by tags, course code, etc.)
- [ ] Resource rating system
- [ ] Comments on resources
- [ ] Admin moderation panel
- [ ] Bookmark/favorite resources
- [ ] Resource preview (PDF viewer)
- [ ] Multiple file upload
- [ ] Resource sharing via link
- [ ] Analytics dashboard

---

## Troubleshooting

### Upload Not Working
- Check if MongoDB is running
- Verify JWT token is valid
- Check file size (must be < 10MB)
- Verify file type is allowed
- Check server logs for errors
- Ensure `uploads/resources/` directory exists

### Download Not Working
- Verify the resource exists in database
- Check if file exists in `uploads/resources/`
- Ensure browser allows downloads
- Check network tab for errors

### Resources Not Displaying
- Check if there are any resources in the database
- Verify API endpoint is correct
- Check console for JavaScript errors
- Ensure user is authenticated

---

## File Structure

```
server/
├── model/
│   └── resourceModel.js          # Resource database schema
├── controller/
│   └── resourceController.js     # Business logic for resources
├── routes/
│   └── resourceRoute.js          # API route definitions
├── middleware/
│   └── auth.js                   # Authentication middleware
├── uploads/
│   └── resources/                # Uploaded files storage
└── index.js                      # Updated with resource routes

client/
├── src/
│   ├── services/
│   │   └── api.js                # Updated with resourceAPI
│   └── Components/
│       └── resources/
│           ├── resourcesPage.jsx  # Resources page component
│           └── resourcesPage.css  # Resources page styles
```

---

## Environment Variables

No additional environment variables needed. The implementation uses existing:
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token verification
- `PORT`: Server port (default: 7000)

---

## Notes

- All uploaded resources are publicly visible to authenticated users
- Resources can be filtered by type, course, year, and semester
- Download count increments each time a resource is downloaded
- View count increments when a resource detail is viewed
- Author name is automatically set from the logged-in user's profile

---

**Implementation Complete! ✅**

The resources feature is now fully integrated with your database. Users can upload notes and past papers, and they'll be stored in MongoDB and accessible to all authenticated users.

