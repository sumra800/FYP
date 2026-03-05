import express from "express";
import auth from "../middleware/auth.js";
import {
  getPartnerMatches,
  sendPartnershipRequest,
  updatePartnershipStatus,
  getUserPartnerships,
  getPartnershipDetails,
} from "../controller/partnershipController.js";

const router = express.Router();

// Get partner matches (with optional filters)
router.get("/matches", auth, getPartnerMatches);

// Get user's partnerships (with optional status filter)
router.get("/my-partnerships", auth, getUserPartnerships);

// Send partnership request
router.post("/request", auth, sendPartnershipRequest);

// Get partnership details
router.get("/:partnershipId", auth, getPartnershipDetails);

// Update partnership status
router.put("/:partnershipId/status", auth, updatePartnershipStatus);

export default router;
