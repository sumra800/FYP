import express from "express";
import { 
  createReminder, 
  getReminders, 
  getReminder, 
  updateReminder, 
  deleteReminder, 
  getUpcomingReminders,
  markReminderCompleted
} from "../controller/reminderController.js";
import { verifyToken } from "../controller/userController.js";

const router = express.Router();

// All reminder routes require authentication
router.use(verifyToken);

// Reminder CRUD operations
router.post("/", createReminder);
router.get("/", getReminders);
router.get("/upcoming", getUpcomingReminders);
router.get("/:id", getReminder);
router.put("/:id", updateReminder);
router.put("/:id/complete", markReminderCompleted);
router.delete("/:id", deleteReminder);

export default router;
