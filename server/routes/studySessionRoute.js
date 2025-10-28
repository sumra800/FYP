import express from "express";
import studySessionController from "../controller/studySessionController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", auth, studySessionController.createStudySession);
router.get("/", auth, studySessionController.getAllStudySessions);
router.get("/progress", auth, studySessionController.getStudyProgress);
router.get("/weekly-monthly", auth, studySessionController.getWeeklyMonthlyStats);
router.get("/course/:courseName", auth, studySessionController.getCourseStatistics);
router.delete("/:id", auth, studySessionController.deleteStudySession);

export default router;

