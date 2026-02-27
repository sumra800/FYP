# Study Buddy API Documentation

This document provides a comprehensive overview of the API architecture, communication flow, and endpoint reference for the Study Buddy application.

## 1. Architecture Overview

- **Frontend**: React application using `src/services/api.js` as the centralized API layer.
- **Backend**: Node.js/Express server (running on port 7000).
- **Database**: MongoDB.
- **Base URL**: `http://localhost:7000/api`
- **Protocol**: HTTP/REST JSON.

## 2. Communication Flow

The communication between the frontend and backend follows a standard RESTful pattern:

1.  **Request Initiation**: The frontend calls functions from specific API objects (e.g., `userAPI.login()`) defined in `src/services/api.js`.
2.  **Request Construction**:
    - The `apiRequest` helper function constructs the `fetch` call.
    - **Headers**:
        - `Content-Type`: `application/json` (automatically set for JSON requests).
        - `Authorization`: `Bearer <token>` (automatically added if a token exists in `localStorage`).
3.  **Authentication**:
    - JWT (JSON Web Token) is used for persistence.
    - Upon successful `login` or `signup`, the backend returns a `token` which is stored in the browser's `localStorage` as `authToken`.
    - Protected routes in the backend use the `verifyToken` middleware to validate this token.
4.  **Response Handling**:
    - The backend returns standardized JSON responses: `{ success: boolean, message: string, data: ... }`.
    - The frontend extracts `data` or throws an error if `response.ok` is false.

## 3. API Endpoints Reference

### 3.1 User & Authentication
**Base Path**: `/api/users`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register a new user | No | `{ fullName, email, password, confirmPassword, universityName, departmentName }` | `{ success: true, token, user }` |
| `POST` | `/login` | Authenticate user | No | `{ email, password }` | `{ success: true, token, user }` |
| `GET` | `/profile` | Get current user details | **Yes** | - | `{ success: true, user }` |
| `PUT` | `/profile` | Update profile (supports file upload) | **Yes** | `FormData` (nickname, skills, profilePicture, etc.) | `{ success: true, user }` |

### 3.2 Assignments
**Base Path**: `/api/assignments`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create assignment | **Yes** | `{ subject, topic, dueDate, priority, status }` | Assignment Object |
| `GET` | `/` | Get all assignments (supports filtering) | **Yes** | Query Params: `?subject=...&status=...` | List of Assignments |
| `GET` | `/stats` | Get assignment completion stats | **Yes** | - | Statistics Object |
| `GET` | `/:id` | Get single assignment | **Yes** | - | Assignment Object |
| `PUT` | `/:id` | Update assignment | **Yes** | `{ ...fieldsToUpdate }` | Updated Assignment |
| `DELETE` | `/:id` | Delete assignment | **Yes** | - | `{ message: "Deleted..." }` |

### 3.3 Reminders
**Base Path**: `/api/reminders`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create reminder | **Yes** | `{ title, date, time, type }` | Reminder Object |
| `GET` | `/` | Get all reminders | **Yes** | - | List of Reminders |
| `GET` | `/upcoming` | Get upcoming reminders | **Yes** | Query Params: `?hours=24` | List of Reminders |
| `PUT` | `/:id` | Update reminder | **Yes** | `{ ...fieldsToUpdate }` | Updated Reminder |
| `PUT` | `/:id/complete` | Mark as completed | **Yes** | - | Updated Reminder |
| `DELETE` | `/:id` | Delete reminder | **Yes** | - | Message |

### 3.4 Code Snippets & Leaderboard
**Base Path**: `/api/codes`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all public codes | No | - | List of Codes |
| `POST` | `/` | Create code snippet | **Yes** | `{ title, language, code, description, tags }` | Code Object |
| `GET` | `/user/my-codes` | Get current user's codes | **Yes** | - | List of Codes |
| `POST` | `/:id/comments` | Add comment | **Yes** | `{ comment }` | Updated Code |
| `POST` | `/:id/like` | Toggle like | **Yes** | - | Updated Code |
| `GET` | `/leaderboard` | Get top scorers | No | - | List of Users |

### 3.5 Events
**Base Path**: `/api/events`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all events | No | - | List of Events |
| `POST` | `/` | Create event | **Yes** | `{ title, date, location, description, ... }` | Event Object |
| `POST` | `/:id/register` | Register for event | **Yes** | - | Registration Status |
| `POST` | `/:id/unregister` | Leave event | **Yes** | - | Unregistration Status |

### 3.6 Resources
**Base Path**: `/api/resources`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Upload resource | **Yes** | `FormData` (file, title, resourceType, etc.) | Resource Object |
| `GET` | `/all` | Get all resources | **Yes** | Query Params (type, course, year) | List of Resources |
| `GET` | `/download/:id` | Download resource file | **Yes** | - | Binary File Stream |
| `GET` | `/type/:type` | Get by type (notes/pastPaper) | **Yes** | - | List of Resources |
| `GET` | `/filters` | Get available filter options | **Yes** | - | `{ years, courses, semesters }` |

### 3.7 Study Sessions
**Base Path**: `/api/study-sessions`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Log study session | **Yes** | `{ courseName, durationMinutes, topics, date }` | Session Object |
| `GET` | `/progress` | Get study progress | **Yes** | - | Progress Stats |
| `GET` | `/weekly-monthly`| Get period stats | **Yes** | - | Period Stats |

### 3.8 Google Classroom Integration
**Base Path**: `/api/google-classroom`

| Method | Endpoint | Description | Auth Required | Payload | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/auth-url` | Get OAuth consent URL | No | Query: `?userId=...` | `{ url }` |
| `GET` | `/status` | Get connection status | **Yes** | - | `{ isConnected: boolean }` |
| `POST` | `/sync` | Trigger manual sync | **Yes** | - | Sync Result |
| `POST` | `/disconnect` | Remove integration | **Yes** | - | Disconnect Status |
