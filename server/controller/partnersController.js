import Partnership from "../model/partnersModel.js";
import MatchSet from "../model/matchsetModel.js";
import User from "../model/userModel.js";

/**
 * Map UI hangout intention to requestType enum (Coding, Exam, Event, Any)
 */
function normalizeRequestType(value) {
  if (!value) return "Any";
  const v = String(value).toLowerCase();
  if (v === "coding issue") return "Coding";
  if (v === "exam") return "Exam";
  if (v === "event") return "Event";
  return "Any";
}

/**
 * Compute compatibility score between two users (0-100)
 */
async function computeCompatibilityScore(currentUser, partner) {
  const profile1 = currentUser.partnerProfile || {};
  const profile2 = partner.partnerProfile || {};
  const learningStyleMatch =
    profile1.preferredLearningStyle === profile2.preferredLearningStyle ? 100
      : profile1.preferredLearningStyle === "any" || profile2.preferredLearningStyle === "any" ? 50 : 0;
  const user1Courses = profile1.primaryCourses || [];
  const user2Courses = profile2.primaryCourses || [];
  const sharedCourses = user1Courses.filter((c) =>
    user2Courses.map((x) => x.toLowerCase()).includes(c.toLowerCase())
  );
  const courseOverlap =
    user1Courses.length > 0 && user2Courses.length > 0
      ? (sharedCourses.length / Math.min(user1Courses.length, user2Courses.length)) * 100
      : 0;
  const user1Times = profile1.preferredStudyTimes || [];
  const user2Times = profile2.preferredStudyTimes || [];
  const sharedTimes = user1Times.filter((t) => user2Times.includes(t));
  const availabilityMatch =
    user1Times.length > 0 && user2Times.length > 0
      ? (sharedTimes.length / Math.min(user1Times.length, user2Times.length)) * 100
      : 30;
  const collaborationStyleMatch =
    profile1.collaborationStyle === profile2.collaborationStyle ? 100
      : profile1.collaborationStyle === "any" || profile2.collaborationStyle === "any" ? 50 : 0;
  return Math.round(
    learningStyleMatch * 0.25 +
    courseOverlap * 0.35 +
    availabilityMatch * 0.2 +
    collaborationStyleMatch * 0.2
  );
}

/**
 * Send a partnership request
 * Updates MatchSet status to 'pending' and creates a Partnership document
 * Accepts either (partnerId, requestType, subject, compatibilityScore) or (recipientId, hangoutIntention) from matching flow
 */
export const sendPartnershipRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      partnerId: bodyPartnerId,
      recipientId,
      requestType: bodyRequestType,
      hangoutIntention,
      subject,
      compatibilityScore: bodyScore,
    } = req.body;

    const partnerId = bodyPartnerId || recipientId;
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: "Partner ID or recipient ID is required",
      });
    }

    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    if (userId.toString() === partnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send partnership request to yourself",
      });
    }

    const existingPartnership = await Partnership.findOne({
      $or: [
        { user1Id: userId, user2Id: partnerId },
        { user1Id: partnerId, user2Id: userId },
      ],
      status: { $in: ["pending", "approved"] },
    });

    if (existingPartnership) {
      return res.status(400).json({
        success: false,
        message: `Partnership already exists with status: ${existingPartnership.status}`,
        existingStatus: existingPartnership.status,
      });
    }

    const requestType = normalizeRequestType(bodyRequestType || hangoutIntention);
    let compatibilityScore = bodyScore;
    if (compatibilityScore == null || compatibilityScore === "") {
      const currentUser = await User.findById(userId).select(
        "partnerProfile primaryCourses preferredLearningStyle preferredStudyTimes collaborationStyle"
      );
      compatibilityScore = await computeCompatibilityScore(currentUser, partner);
    }
    compatibilityScore = Number(compatibilityScore) || 0;

    const partnership = new Partnership({
      user1Id: userId,
      user2Id: partnerId,
      status: "pending",
      requestType,
      subject: requestType === "Exam" ? subject : null,
      compatibilityScore,
      initiatedBy: userId,
    });

    await partnership.save();

    // Update MatchSet status to 'pending'
    try {
      await MatchSet.updateOne(
        { requesterUserId: userId, "matchedUsers.userId": partnerId },
        { $set: { "matchedUsers.$.status": "pending" } }
      );
    } catch (err) {
      console.warn("Failed to update MatchSet status:", err.message);
      // Don't fail the request if updating MatchSet fails
    }

    res.status(201).json({
      success: true,
      message: "Partnership request sent successfully",
      partnership,
    });
  } catch (error) {
    console.error("Error sending partnership request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending partnership request",
      error: error.message,
    });
  }
};

/**
 * Approve a partnership request
 * Updates Partnership status to 'approved' and MatchSet status to 'approved'
 */
export const approvePartnershipRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { partnershipId } = req.params;

    console.log(`[PARTNERS] Approving partnership ${partnershipId} by user ${userId}`);

    const partnership = await Partnership.findById(partnershipId);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    console.log(`[PARTNERS] Partnership found: user1Id=${partnership.user1Id}, user2Id=${partnership.user2Id}, status=${partnership.status}`);

    // Only the recipient can approve (user2Id is the one who received the request)
    if (partnership.user2Id.toString() !== userId.toString()) {
      console.log(`[PARTNERS] Authorization failed: user ${userId} is not user2Id ${partnership.user2Id}`);
      return res.status(403).json({
        success: false,
        message: "Only the recipient can approve this request",
      });
    }

    partnership.status = "approved";
    await partnership.save();

    console.log(`[PARTNERS] Partnership ${partnershipId} status updated to: ${partnership.status}`);

    // Update MatchSet status to 'approved'
    try {
      const otherUserId = partnership.user1Id;
      await MatchSet.updateOne(
        { requesterUserId: otherUserId, "matchedUsers.userId": userId },
        { $set: { "matchedUsers.$.status": "approved" } }
      );
    } catch (err) {
      console.warn("Failed to update MatchSet status:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Partnership request approved",
      partnership,
    });
  } catch (error) {
    console.error("Error approving partnership:", error);
    res.status(500).json({
      success: false,
      message: "Error approving partnership",
      error: error.message,
    });
  }
};

/**
 * Reject a partnership request
 */
export const rejectPartnershipRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { partnershipId } = req.params;

    const partnership = await Partnership.findById(partnershipId);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Only the recipient can reject
    if (partnership.user2Id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can reject this request",
      });
    }

    partnership.status = "rejected";
    await partnership.save();

    res.status(200).json({
      success: true,
      message: "Partnership request rejected",
      partnership,
    });
  } catch (error) {
    console.error("Error rejecting partnership:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting partnership",
      error: error.message,
    });
  }
};

/**
 * Withdraw a partnership request (only the initiator/sender can withdraw)
 */
export const withdrawPartnershipRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { partnershipId } = req.params;

    const partnership = await Partnership.findById(partnershipId);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    if (partnership.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be withdrawn",
      });
    }

    // Only the initiator (user1Id) can withdraw
    if (partnership.user1Id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can withdraw this request",
      });
    }

    partnership.status = "rejected";
    await partnership.save();

    // Reset MatchSet status to 'not_connected' so the user can send a request again
    try {
      // partnership.user2Id is the recipient. The sender (user1Id) is the current user.
      await MatchSet.updateOne(
        { requesterUserId: userId, "matchedUsers.userId": partnership.user2Id },
        { $set: { "matchedUsers.$.status": "not_connected" } }
      );
    } catch (err) {
      console.warn("Failed to reset MatchSet status on withdraw:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Partnership request withdrawn",
      partnership,
    });
  } catch (error) {
    console.error("Error withdrawing partnership:", error);
    res.status(500).json({
      success: false,
      message: "Error withdrawing partnership",
      error: error.message,
    });
  }
};

/**
 * Get all partnerships for current user (pending requests + approved partners)
 */
export const getMyPartnerships = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query; // Optional: filter by status

    let query = {
      $or: [{ user1Id: userId }, { user2Id: userId }],
    };

    if (status) {
      query.status = status;
    }

    const partnerships = await Partnership.find(query)
      .populate("user1Id", "fullName nickname email profilePicture partnerProfile")
      .populate("user2Id", "fullName nickname email profilePicture partnerProfile")
      .populate("initiatedBy", "fullName nickname")
      .sort({ createdAt: -1 });

    // Enhance response with requester/recipient info
    const enriched = partnerships.map((p) => {
      const isInitiator = p.initiatedBy.toString() === userId.toString();
      const isRecipient = p.user2Id._id.toString() === userId.toString();
      const otherUser = p.user1Id._id.toString() === userId.toString() ? p.user2Id : p.user1Id;

      return {
        ...p.toObject(),
        isInitiator,
        otherUser,
        isRecipient,
        role: isRecipient ? "recipient" : "requester",
      };
    });

    res.status(200).json({
      success: true,
      message: "Partnerships retrieved successfully",
      partnerships: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error("Error getting partnerships:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving partnerships",
      error: error.message,
    });
  }
};

/**
 * Get only approved partners
 */
export const getApprovedPartners = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`[PARTNERS] Fetching approved partners for user ${userId}`);

    const partnerships = await Partnership.find(
      {
        $or: [{ user1Id: userId }, { user2Id: userId }],
        status: "approved",
      },
      "-notes"
    )
      .populate("user1Id", "fullName nickname email profilePicture partnerProfile")
      .populate("user2Id", "fullName nickname email profilePicture partnerProfile")
      .sort({ createdAt: -1 });

    console.log(`[PARTNERS] Found ${partnerships.length} approved partnerships for user ${userId}`);

    const partners = partnerships.map((p) => {
      const otherUser = p.user1Id._id.toString() === userId.toString() ? p.user2Id : p.user1Id;
      return {
        _id: p._id,
        partner: otherUser,
        requestType: p.requestType,
        subject: p.subject,
        compatibilityScore: p.compatibilityScore,
        connectedAt: p.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Approved partners retrieved successfully",
      partners,
      count: partners.length,
    });
  } catch (error) {
    console.error("Error getting approved partners:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving approved partners",
      error: error.message,
    });
  }
};

/**
 * Get pending partnership requests (for current user)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const pendingRequests = await Partnership.find(
      {
        user2Id: userId, // Requests sent TO the current user
        status: "pending",
      }
    )
      .populate("user1Id", "fullName nickname email profilePicture partnerProfile")
      .populate("initiatedBy", "fullName nickname")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Pending requests retrieved successfully",
      requests: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error("Error getting pending requests:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving pending requests",
      error: error.message,
    });
  }
};

/**
 * Block a partner
 */
export const blockPartner = async (req, res) => {
  try {
    const userId = req.userId;
    const { partnershipId } = req.params;

    const partnership = await Partnership.findById(partnershipId);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Either user can block
    if (
      partnership.user1Id.toString() !== userId.toString() &&
      partnership.user2Id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this partnership",
      });
    }

    partnership.status = "blocked";
    await partnership.save();

    res.status(200).json({
      success: true,
      message: "Partner blocked successfully",
      partnership,
    });
  } catch (error) {
    console.error("Error blocking partner:", error);
    res.status(500).json({
      success: false,
      message: "Error blocking partner",
      error: error.message,
    });
  }
};

export default {
  sendPartnershipRequest,
  approvePartnershipRequest,
  rejectPartnershipRequest,
  withdrawPartnershipRequest,
  getMyPartnerships,
  getApprovedPartners,
  getPendingRequests,
  blockPartner,
};
