import express from "express";
import { signup, login, getProfile, updateProfile, verifyToken, upload } from "../controller/userController.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single('profilePicture'), updateProfile);

export default router;
