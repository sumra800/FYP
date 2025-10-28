import { google } from 'googleapis';
import User from '../model/userModel.js';
import Assignment from '../model/assignmentModel.js';

// Google OAuth2 Configuration
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly'
];

// Initialize OAuth2 Client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:7000/api/google-classroom/oauth2callback'
  );
};

// Generate Auth URL
export const getAuthUrl = async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId, // Pass userId in state to retrieve after callback
      prompt: 'consent' // Force consent screen to get refresh token
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
};

// OAuth2 Callback Handler
export const handleOAuth2Callback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const oauth2Client = getOAuth2Client();
    
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));

    // Update user with tokens
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'googleAuth.accessToken': tokens.access_token,
          'googleAuth.refreshToken': tokens.refresh_token,
          'googleAuth.tokenExpiry': tokenExpiry,
          'googleAuth.isConnected': true,
          'googleAuth.lastSync': new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initial sync after connecting
    await syncGoogleClassroomData(userId);

    // Redirect to frontend with success
    res.redirect(`http://localhost:3000/dashboard?classroomConnected=true`);
  } catch (error) {
    console.error('OAuth2 callback error:', error);
    res.redirect(`http://localhost:3000/dashboard?classroomError=true`);
  }
};

// Refresh Access Token
const refreshAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAuth.refreshToken) {
      throw new Error('No refresh token available');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: user.googleAuth.refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    const tokenExpiry = new Date(Date.now() + (credentials.expiry_date || 3600 * 1000));

    // Update user with new tokens
    await User.findByIdAndUpdate(userId, {
      $set: {
        'googleAuth.accessToken': credentials.access_token,
        'googleAuth.tokenExpiry': tokenExpiry
      }
    });

    return credentials.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Get authenticated OAuth2 client for user
const getAuthenticatedClient = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user || !user.googleAuth.isConnected) {
    throw new Error('User not connected to Google Classroom');
  }

  const oauth2Client = getOAuth2Client();
  
  // Check if token is expired
  const now = new Date();
  if (user.googleAuth.tokenExpiry && now >= user.googleAuth.tokenExpiry) {
    // Refresh the token
    const newToken = await refreshAccessToken(userId);
    oauth2Client.setCredentials({
      access_token: newToken,
      refresh_token: user.googleAuth.refreshToken
    });
  } else {
    oauth2Client.setCredentials({
      access_token: user.googleAuth.accessToken,
      refresh_token: user.googleAuth.refreshToken
    });
  }

  return oauth2Client;
};

// Sync Google Classroom Data
export const syncGoogleClassroomData = async (userId) => {
  try {
    const oauth2Client = await getAuthenticatedClient(userId);
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    // Get all courses
    const coursesResponse = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE']
    });

    const courses = coursesResponse.data.courses || [];
    const syncedAssignments = [];

    // For each course, get coursework
    for (const course of courses) {
      try {
        const courseWorkResponse = await classroom.courses.courseWork.list({
          courseId: course.id
        });

        const courseWorks = courseWorkResponse.data.courseWork || [];

        for (const work of courseWorks) {
          // Check if assignment already exists
          const existingAssignment = await Assignment.findOne({
            userId: userId,
            'googleClassroom.courseWorkId': work.id
          });

          const assignmentData = {
            userId: userId,
            title: work.title,
            description: work.description || '',
            subject: course.name,
            dueDate: work.dueDate ? 
              new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day) : 
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days
            priority: 'medium',
            status: 'not-started',
            googleClassroom: {
              isFromClassroom: true,
              courseId: course.id,
              courseName: course.name,
              courseWorkId: work.id,
              alternateLink: work.alternateLink,
              maxPoints: work.maxPoints,
              workType: work.workType,
              lastSyncedAt: new Date()
            }
          };

          if (existingAssignment) {
            // Update existing assignment
            await Assignment.findByIdAndUpdate(
              existingAssignment._id,
              { $set: assignmentData },
              { new: true }
            );
          } else {
            // Create new assignment
            const newAssignment = await Assignment.create(assignmentData);
            syncedAssignments.push(newAssignment);
          }
        }
      } catch (courseError) {
        console.error(`Error syncing course ${course.name}:`, courseError);
        // Continue with next course
      }
    }

    // Update last sync time
    await User.findByIdAndUpdate(userId, {
      $set: { 'googleAuth.lastSync': new Date() }
    });

    return {
      success: true,
      coursesCount: courses.length,
      assignmentsCount: syncedAssignments.length
    };
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
};

// Manual Sync Endpoint
export const manualSync = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await syncGoogleClassroomData(userId);
    
    res.json({
      message: 'Sync completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ error: 'Failed to sync Google Classroom data' });
  }
};

// Disconnect Google Classroom
export const disconnectClassroom = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $set: {
        'googleAuth.accessToken': null,
        'googleAuth.refreshToken': null,
        'googleAuth.tokenExpiry': null,
        'googleAuth.isConnected': false
      }
    });

    res.json({ message: 'Google Classroom disconnected successfully' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Classroom' });
  }
};

// Get Connection Status
export const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isConnected: user.googleAuth?.isConnected || false,
      lastSync: user.googleAuth?.lastSync || null
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
};

