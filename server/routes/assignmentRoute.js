import express from "express";
import { 
  createAssignment, 
  getAssignments, 
  getAssignment, 
  updateAssignment, 
  deleteAssignment, 
  getAssignmentStats 
} from "../controller/assignmentController.js";
import { verifyToken } from "../controller/userController.js";

const router = express.Router();

// All assignment routes require authentication
router.use(verifyToken);

// Assignment CRUD operations
router.post("/", createAssignment);
router.get("/", getAssignments);
router.get("/stats", getAssignmentStats);
router.get("/:id", getAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;
