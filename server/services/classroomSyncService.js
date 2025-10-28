import cron from 'node-cron';
import User from '../model/userModel.js';
import { syncGoogleClassroomData } from '../controller/googleClassroomController.js';

// Sync all connected users
const syncAllUsers = async () => {
  try {
    console.log('Starting automatic Google Classroom sync...');
    
    // Find all users with Google Classroom connected
    const connectedUsers = await User.find({
      'googleAuth.isConnected': true
    });

    console.log(`Found ${connectedUsers.length} connected users`);

    for (const user of connectedUsers) {
      try {
        await syncGoogleClassroomData(user._id.toString());
        console.log(`Successfully synced data for user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to sync for user ${user.email}:`, error.message);
        // Continue with next user even if one fails
      }
    }

    console.log('Automatic sync completed');
  } catch (error) {
    console.error('Error in automatic sync:', error);
  }
};

// Schedule automatic sync every 30 minutes
export const startAutoSync = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    syncAllUsers();
  });

  // Also run every day at midnight
  cron.schedule('0 0 * * *', () => {
    syncAllUsers();
  });

  console.log('Google Classroom auto-sync scheduled:');
  console.log('- Every 30 minutes');
  console.log('- Daily at midnight');
};

// Manual sync trigger (can be called from anywhere)
export const triggerManualSync = async (userId) => {
  try {
    await syncGoogleClassroomData(userId);
    return { success: true, message: 'Manual sync completed' };
  } catch (error) {
    console.error('Manual sync error:', error);
    return { success: false, message: error.message };
  }
};

