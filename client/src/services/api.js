// API Base URL - Update this to match your server
const API_BASE_URL = 'http://localhost:7000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  // Sign up a new user
  signup: async (userData) => {
    const response = await apiRequest('/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store the token if signup is successful
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store the token if login is successful
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest('/users/profile', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const url = `${API_BASE_URL}/users/profile`;
    const token = getAuthToken();
    
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add text fields
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        if (key === 'profilePicture' && profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (key !== 'profilePicture') {
          formData.append(key, profileData[key]);
        }
      }
    });

    const config = {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Logout user (remove token)
  logout: () => {
    removeAuthToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get stored token
  getToken: () => {
    return getAuthToken();
  }
};

// Assignment API functions
export const assignmentAPI = {
  // Create a new assignment
  createAssignment: async (assignmentData) => {
    return await apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  // Get all assignments for the user
  getAssignments: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const endpoint = queryParams.toString() ? `/assignments?${queryParams}` : '/assignments';
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  // Get a single assignment
  getAssignment: async (id) => {
    return await apiRequest(`/assignments/${id}`, {
      method: 'GET',
    });
  },

  // Update an assignment
  updateAssignment: async (id, assignmentData) => {
    return await apiRequest(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  // Delete an assignment
  deleteAssignment: async (id) => {
    return await apiRequest(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  // Get assignment statistics
  getAssignmentStats: async () => {
    return await apiRequest('/assignments/stats', {
      method: 'GET',
    });
  }
};

// Reminder API functions
export const reminderAPI = {
  // Create a new reminder
  createReminder: async (reminderData) => {
    return await apiRequest('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  },

  // Get all reminders for the user
  getReminders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const endpoint = queryParams.toString() ? `/reminders?${queryParams}` : '/reminders';
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  // Get upcoming reminders
  getUpcomingReminders: async (hours = 24) => {
    return await apiRequest(`/reminders/upcoming?hours=${hours}`, {
      method: 'GET',
    });
  },

  // Get a single reminder
  getReminder: async (id) => {
    return await apiRequest(`/reminders/${id}`, {
      method: 'GET',
    });
  },

  // Update a reminder
  updateReminder: async (id, reminderData) => {
    return await apiRequest(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  },

  // Mark reminder as completed
  markReminderCompleted: async (id) => {
    return await apiRequest(`/reminders/${id}/complete`, {
      method: 'PUT',
    });
  },

  // Delete a reminder
  deleteReminder: async (id) => {
    return await apiRequest(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }
};

// Code API functions
export const codeAPI = {
  // Create a new code snippet
  createCode: async (codeData) => {
    return await apiRequest('/codes', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  },

  // Get all public code snippets
  getAllCodes: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/codes${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  },

  // Get a single code snippet with full details
  getCode: async (id) => {
    return await apiRequest(`/codes/${id}`, {
      method: 'GET',
    });
  },

  // Get user's own code snippets
  getUserCodes: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/codes/user/my-codes${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  },

  // Update a code snippet
  updateCode: async (id, codeData) => {
    return await apiRequest(`/codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(codeData),
    });
  },

  // Delete a code snippet
  deleteCode: async (id) => {
    return await apiRequest(`/codes/${id}`, {
      method: 'DELETE',
    });
  },

  // Add a comment to a code snippet
  addComment: async (id, comment) => {
    return await apiRequest(`/codes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // Like/Unlike a code snippet
  toggleLike: async (id) => {
    return await apiRequest(`/codes/${id}/like`, {
      method: 'POST',
    });
  },

  // Get code statistics
  getCodeStats: async () => {
    return await apiRequest('/codes/stats', {
      method: 'GET',
    });
  },

  // Approve a comment and award points
  approveComment: async (codeId, commentId, points = 10) => {
    return await apiRequest(`/codes/${codeId}/comments/${commentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ points }),
    });
  },

  // Get leaderboard (top scorers)
  getLeaderboard: async (limit = 10) => {
    return await apiRequest(`/codes/leaderboard?limit=${limit}`, {
      method: 'GET',
    });
  }
};

// Event API functions
export const eventAPI = {
  // Create a new event
  createEvent: async (eventData) => {
    return await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Get all events with filtering
  getAllEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/events${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  },

  // Get a single event by ID
  getEvent: async (id) => {
    return await apiRequest(`/events/${id}`, {
      method: 'GET',
    });
  },

  // Get user's created events
  getUserEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/events/user/my-events${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  },

  // Get user's registered events
  getUserRegisteredEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/events/user/registered${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  },

  // Update an event
  updateEvent: async (id, eventData) => {
    return await apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Delete an event
  deleteEvent: async (id) => {
    return await apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Register for an event
  registerForEvent: async (id) => {
    return await apiRequest(`/events/${id}/register`, {
      method: 'POST',
    });
  },

  // Unregister from an event
  unregisterFromEvent: async (id) => {
    return await apiRequest(`/events/${id}/unregister`, {
      method: 'POST',
    });
  },

  // Get event statistics
  getEventStats: async () => {
    return await apiRequest('/events/stats', {
      method: 'GET',
    });
  }
};

// Google Classroom API functions
export const googleClassroomAPI = {
  // Get Google OAuth URL
  getAuthUrl: async (userId) => {
    return await apiRequest(`/google-classroom/auth-url?userId=${userId}`, {
      method: 'GET',
    });
  },

  // Get connection status
  getConnectionStatus: async () => {
    return await apiRequest('/google-classroom/status', {
      method: 'GET',
    });
  },

  // Manual sync
  manualSync: async () => {
    return await apiRequest('/google-classroom/sync', {
      method: 'POST',
    });
  },

  // Disconnect Google Classroom
  disconnect: async () => {
    return await apiRequest('/google-classroom/disconnect', {
      method: 'POST',
    });
  },
};

// Resource API functions
export const resourceAPI = {
  // Upload a new resource
  uploadResource: async (formData) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/resources/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload resource');
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Get all resources with optional filters
  getAllResources: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/resources/all?${queryParams}` : '/resources/all';
    return await apiRequest(endpoint);
  },

  // Get resources by type (pastPaper, notes, tutorial)
  getResourcesByType: async (type) => {
    return await apiRequest(`/resources/type/${type}`);
  },

  // Get user's uploaded resources
  getMyResources: async () => {
    return await apiRequest('/resources/my-resources');
  },

  // Get single resource by ID
  getResourceById: async (id) => {
    return await apiRequest(`/resources/${id}`);
  },

  // Download a resource
  downloadResource: async (id, fileName) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/resources/download/${id}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download resource');
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'resource';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      return { message: 'Download started' };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Update a resource
  updateResource: async (id, data) => {
    return await apiRequest(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a resource
  deleteResource: async (id) => {
    return await apiRequest(`/resources/${id}`, {
      method: 'DELETE',
    });
  },

  // Get filter options
  getFilters: async () => {
    return await apiRequest('/resources/filters');
  },
};

// Study Session API functions
export const studySessionAPI = {
  // Create a new study session
  createSession: async (sessionData) => {
    return await apiRequest('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  // Get all study sessions
  getAllSessions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/study-sessions?${queryParams}` : '/study-sessions';
    return await apiRequest(endpoint);
  },

  // Get study progress (aggregated by course)
  getProgress: async (days = 30) => {
    return await apiRequest(`/study-sessions/progress?days=${days}`);
  },

  // Get weekly and monthly statistics
  getWeeklyMonthlyStats: async () => {
    return await apiRequest('/study-sessions/weekly-monthly');
  },

  // Get statistics for a specific course
  getCourseStats: async (courseName) => {
    return await apiRequest(`/study-sessions/course/${encodeURIComponent(courseName)}`);
  },

  // Delete a study session
  deleteSession: async (id) => {
    return await apiRequest(`/study-sessions/${id}`, {
      method: 'DELETE',
    });
  },
};

export default userAPI;
