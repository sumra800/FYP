import express from "express";
import { verifyToken } from "../controller/userController.js";
import { getPartnerMatches, upsertPartnerProfile } from "../controller/partnerController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/matches", getPartnerMatches);
router.put("/profile", upsertPartnerProfile);

export default router;

