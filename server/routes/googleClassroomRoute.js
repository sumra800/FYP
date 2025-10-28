import express from 'express';
import {
  getAuthUrl,
  handleOAuth2Callback,
  manualSync,
  disconnectClassroom,
  getConnectionStatus
} from '../controller/googleClassroomController.js';
import { verifyToken } from '../controller/userController.js';

const router = express.Router();

// OAuth Routes (public - no auth required for callback)
router.get('/auth-url', getAuthUrl);
router.get('/oauth2callback', handleOAuth2Callback);

// Protected Routes (require authentication)
router.get('/status', verifyToken, getConnectionStatus);
router.post('/sync', verifyToken, manualSync);
router.post('/disconnect', verifyToken, disconnectClassroom);

export default router;

