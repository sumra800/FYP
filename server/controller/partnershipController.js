import Partnership from "../model/partnershipModel.js";
import User from "../model/userModel.js";
import MatchSet from "../model/matchsetModel.js";
import { findPartnerMatches, findMatchesByIntention } from "../services/matchingService.js";

/**
 * Get partner matches for current user
 */
export const getPartnerMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const { intention, minScore = 40, limit = 5, subject } = req.query;
    const wantDebug = String(req.query.debug || "false").toLowerCase() === "true";

    let matchesResult;
    if (intention) {
      matchesResult = await findMatchesByIntention(userId, intention, { subject, debug: wantDebug });
    } else {
      matchesResult = await findPartnerMatches(userId, { minScore: parseInt(minScore), limit: parseInt(limit), subject, debug: wantDebug });
    }

    // matchesResult may be an array (old behavior) or an object {matches, debug}
    const matches = Array.isArray(matchesResult) ? matchesResult : matchesResult.matches || [];
    const debug = matchesResult && !Array.isArray(matchesResult) ? matchesResult.debug : undefined;

    // Get existing partnership statuses for these matches
    const partnerships = await Partnership.find({
      $or: [
        { user1Id: userId, user2Id: { $in: matches.map((m) => m.partnerId) } },
        { user2Id: userId, user1Id: { $in: matches.map((m) => m.partnerId) } },
      ],
    });

    // Enrich matches with partnership status
    const enrichedMatches = matches.map((match) => {
      const partnership = partnerships.find(
        (p) =>
          (p.user1Id.toString() === userId.toString() &&
            p.user2Id.toString() === match.partnerId.toString()) ||
          (p.user2Id.toString() === userId.toString() &&
            p.user1Id.toString() === match.partnerId.toString())
      );

      return {
        ...match,
        partnershipStatus: partnership
          ? (partnership.status === "approved" ? "connected" : partnership.status)
          : null,
        partnershipId: partnership ? partnership._id : null,
      };
    });

    // Persist the generated match set for auditing / user history
    try {
      // Map intention to requestType (backward compatibility)
      const intentionMap = {
        "exam": "Exam",
        "coding issue": "Coding",
        "event": "Event",
        "any": "Any"
      };
      const requestType = intentionMap[String(intention || "").toLowerCase()] || "Any";
      
      // Build matchedUsers array with compatibility scores
      const matchedUsers = matches.map((m) => ({
        userId: m.partnerId,
        compatibilityScore: m.overallScore || m.matchScore || 0, // Use overallScore from matching service
      }));

      const matchDoc = new MatchSet({
        requesterUserId: userId,
        requestType,
        subject: requestType === "Exam" ? subject : null,
        matchedUsers,
      });
      await matchDoc.save();
    } catch (err) {
      console.warn("Failed to persist match set:", err.message);
      // don't fail the request if saving match-set fails
    }

    const responsePayload = {
      success: true,
      message: "Partner matches retrieved successfully",
      matches: enrichedMatches,
      count: enrichedMatches.length,
    };

    if (debug) {
      responsePayload.debug = debug;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error getting partner matches:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving partner matches",
      error: error.message,
    });
  }
};

/**
 * Send a partnership request
 */
export const sendPartnershipRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId, hangoutIntention } = req.body;

    // Validate input
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required",
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    // Check if partnership already exists
    const existingPartnership = await Partnership.findOne({
      $or: [
        { user1Id: userId, user2Id: recipientId },
        { user1Id: recipientId, user2Id: userId },
      ],
    });

    if (existingPartnership) {
      return res.status(400).json({
        success: false,
        message: `Partnership already exists with status: ${existingPartnership.status}`,
        existingStatus: existingPartnership.status,
      });
    }

    // Create new partnership request
    const partnership = new Partnership({
      user1Id: recipientId, // recipient is user1Id (the one who will approve/reject)
      user2Id: userId,      // requester is user2Id (the one who sent the request)
      status: "pending",
      requestType: hangoutIntention || "Any",
    });

    // Calculate and store compatibility details
    const currentUser = await User.findById(userId).select(
      "partnerProfile primaryCourses preferredLearningStyle preferredStudyTimes collaborationStyle"
    );
    
    // Calculate match score (reuse from matching service logic)
    const profile1 = currentUser.partnerProfile || {};
    const profile2 = recipient.partnerProfile || {};

    const learningStyleMatch =
      profile1.preferredLearningStyle === profile2.preferredLearningStyle
        ? 100
        : profile1.preferredLearningStyle === "any" ||
          profile2.preferredLearningStyle === "any"
        ? 50
        : 0;

    const user1Courses = profile1.primaryCourses || [];
    const user2Courses = profile2.primaryCourses || [];
    const sharedCourses = user1Courses.filter((course) =>
      user2Courses.map((c) => c.toLowerCase()).includes(course.toLowerCase())
    );
    const courseOverlap =
      user1Courses.length > 0 && user2Courses.length > 0
        ? (sharedCourses.length /
            Math.min(user1Courses.length, user2Courses.length)) *
          100
        : 0;

    const user1Times = profile1.preferredStudyTimes || [];
    const user2Times = profile2.preferredStudyTimes || [];
    const sharedTimes = user1Times.filter((time) => user2Times.includes(time));
    const availabilityMatch =
      user1Times.length > 0 && user2Times.length > 0
        ? (sharedTimes.length / Math.min(user1Times.length, user2Times.length)) *
          100
        : 30;

    const collaborationStyleMatch =
      profile1.collaborationStyle === profile2.collaborationStyle
        ? 100
        : profile1.collaborationStyle === "any" ||
          profile2.collaborationStyle === "any"
        ? 50
        : 0;

    const matchScore = Math.round(
      learningStyleMatch * 0.25 +
        courseOverlap * 0.35 +
        availabilityMatch * 0.2 +
        collaborationStyleMatch * 0.2
    );

    partnership.matchScore = matchScore;
    partnership.sharedCourses = sharedCourses;
    partnership.sharedTimes = sharedTimes;
    partnership.compatibilityDetails = {
      learningStyleMatch: Math.round(learningStyleMatch),
      courseOverlap: Math.round(courseOverlap),
      availabilityMatch: Math.round(availabilityMatch),
      collaborationStyleMatch: Math.round(collaborationStyleMatch),
    };

    await partnership.save();

    res.status(201).json({
      success: true,
      message: "Partnership request sent successfully",
      partnership: partnership,
    });
  } catch (error) {
    console.error("Error sending partnership request:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Partnership request already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error sending partnership request",
      error: error.message,
    });
  }
};

/**
 * Update partnership status
 */
export const updatePartnershipStatus = async (req, res) => {
  try {
    const { partnershipId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    // Validate status
    const validStatuses = ["pending", "connected", "rejected", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, connected, rejected, blocked",
      });
    }

    // Find partnership
    const partnership = await Partnership.findById(partnershipId);
    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    // Check authorization (only user1Id or user2Id can update)
    if (
      partnership.user1Id.toString() !== userId.toString() &&
      partnership.user2Id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this partnership",
      });
    }

    partnership.status = status;
    await partnership.save();

    res.status(200).json({
      success: true,
      message: `Partnership status updated to ${status}`,
      partnership: partnership,
    });
  } catch (error) {
    console.error("Error updating partnership status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating partnership status",
      error: error.message,
    });
  }
};

/**
 * Get user's partnerships
 */
export const getUserPartnerships = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = {
      $or: [{ user1Id: userId }, { user2Id: userId }],
    };

    if (status) {
      query.status = status;
    }

    const partnerships = await Partnership.find(query)
      .populate("user1Id", "fullName nickname email profilePicture currentSemester")
      .populate("user2Id", "fullName nickname email profilePicture currentSemester")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Partnerships retrieved successfully",
      partnerships: partnerships,
      count: partnerships.length,
    });
  } catch (error) {
    console.error("Error getting user partnerships:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving partnerships",
      error: error.message,
    });
  }
};

/**
 * Get partnership details
 */
export const getPartnershipDetails = async (req, res) => {
  try {
    const { partnershipId } = req.params;

    const partnership = await Partnership.findById(partnershipId)
      .populate("user1Id", "fullName nickname email profilePicture partnerProfile")
      .populate("user2Id", "fullName nickname email profilePicture partnerProfile");

    if (!partnership) {
      return res.status(404).json({
        success: false,
        message: "Partnership not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Partnership details retrieved successfully",
      partnership: partnership,
    });
  } catch (error) {
    console.error("Error getting partnership details:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving partnership details",
      error: error.message,
    });
  }
};

export default {
  getPartnerMatches,
  sendPartnershipRequest,
  updatePartnershipStatus,
  getUserPartnerships,
  getPartnershipDetails,
};
