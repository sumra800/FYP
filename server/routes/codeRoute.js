import express from "express";
import { verifyToken } from "../controller/userController.js";
import {
  createCode,
  getAllCodes,
  getCode,
  getUserCodes,
  updateCode,
  deleteCode,
  addComment,
  toggleLike,
  getCodeStats,
  approveComment,
  getLeaderboard
} from "../controller/codeController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllCodes); // Get all public codes
router.get("/stats", getCodeStats); // Get code statistics
router.get("/leaderboard", getLeaderboard); // Get user leaderboard
router.get("/:id", getCode); // Get single code with details

// Protected routes (authentication required)
router.post("/", verifyToken, createCode); // Create new code
router.get("/user/my-codes", verifyToken, getUserCodes); // Get user's own codes
router.put("/:id", verifyToken, updateCode); // Update code
router.delete("/:id", verifyToken, deleteCode); // Delete code
router.post("/:id/comments", verifyToken, addComment); // Add comment
router.post("/:id/like", verifyToken, toggleLike); // Like/Unlike code
router.post("/:codeId/comments/:commentId/approve", verifyToken, approveComment); // Approve comment

export default router;
