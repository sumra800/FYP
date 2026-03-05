import express from "express";
import auth from "../middleware/auth.js";
import {
  sendPartnershipRequest,
  approvePartnershipRequest,
  rejectPartnershipRequest,
  withdrawPartnershipRequest,
  getMyPartnerships,
  getApprovedPartners,
  getPendingRequests,
  blockPartner,
} from "../controller/partnersController.js";

const router = express.Router();

// Get all partnerships (pending + approved) for current user
router.get("/my-partnerships", auth, getMyPartnerships);

// Get only approved partners
router.get("/approved", auth, getApprovedPartners);

// Get pending requests for current user
router.get("/pending-requests", auth, getPendingRequests);

// Send a partnership request
router.post("/request", auth, sendPartnershipRequest);

// Approve a partnership request
router.put("/:partnershipId/approve", auth, approvePartnershipRequest);

// Reject a partnership request
router.put("/:partnershipId/reject", auth, rejectPartnershipRequest);

// Withdraw a sent request (initiator only)
router.put("/:partnershipId/withdraw", auth, withdrawPartnershipRequest);

// Block a partner
router.put("/:partnershipId/block", auth, blockPartner);

export default router;
