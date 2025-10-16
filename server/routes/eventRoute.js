import express from "express";
import { verifyToken } from "../controller/userController.js";
import {
  createEvent,
  getAllEvents,
  getEvent,
  getUserEvents,
  getUserRegisteredEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventStats
} from "../controller/eventController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllEvents); // Get all events with filtering
router.get("/stats", getEventStats); // Get event statistics
router.get("/:id", getEvent); // Get single event

// Protected routes (authentication required)
router.post("/", verifyToken, createEvent); // Create new event
router.get("/user/my-events", verifyToken, getUserEvents); // Get user's created events
router.get("/user/registered", verifyToken, getUserRegisteredEvents); // Get user's registered events
router.put("/:id", verifyToken, updateEvent); // Update event
router.delete("/:id", verifyToken, deleteEvent); // Delete event
router.post("/:id/register", verifyToken, registerForEvent); // Register for event
router.post("/:id/unregister", verifyToken, unregisterFromEvent); // Unregister from event

export default router;
