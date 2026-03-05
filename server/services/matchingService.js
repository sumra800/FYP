import munkres from "munkres";
import User from "../model/userModel.js";

/**
 * Calculate compatibility score between two users using various factors
 * @param {Object} user1 - Current user
 * @param {Object} user2 - Potential partner
 * @returns {Object} - Compatibility details and overall score
 */
const calculateCompatibility = (user1, user2, options = {}) => {
  const { intention = null, subject = null } = options;
  const profile1 = user1.partnerProfile || {};
  const profile2 = user2.partnerProfile || {};

  // Learning Style Match (0-100)
  const learningStyleMatch =
    profile1.preferredLearningStyle === profile2.preferredLearningStyle
      ? 100
      : profile1.preferredLearningStyle === "any" ||
        profile2.preferredLearningStyle === "any"
      ? 50
      : 0;

  // Course Overlap (0-100)
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

  // Subject-specific match (used for Exam intention)
  const subjectMatch = (() => {
    if (!subject) return 0;
    const partnerCourses = (profile2.primaryCourses || []).map((c) =>
      c.toLowerCase()
    );
    return partnerCourses.includes(String(subject).toLowerCase()) ? 100 : 0;
  })();

  // Availability Match (0-100)
  const user1Times = profile1.preferredStudyTimes || [];
  const user2Times = profile2.preferredStudyTimes || [];
  const sharedTimes = user1Times.filter((time) => user2Times.includes(time));
  const availabilityMatch =
    user1Times.length > 0 && user2Times.length > 0
      ? (sharedTimes.length / Math.min(user1Times.length, user2Times.length)) *
        100
      : 30; // Default 30% if no study times specified

  // Study Persona Match (0-100) - top-level field on user
  const persona1 = (user1.studyPersona || "").toLowerCase();
  const persona2 = (user2.studyPersona || "").toLowerCase();
  const personaMatch = persona1 && persona2 && persona1 === persona2 ? 100 : 0;

  // Collaboration Style Match (0-100)
  const collaborationStyleMatch =
    profile1.collaborationStyle === profile2.collaborationStyle
      ? 100
      : profile1.collaborationStyle === "any" ||
        profile2.collaborationStyle === "any"
      ? 50
      : 0;

  // Overall score (weighted average)
  // If intention is 'Exam' and a subject is specified, prioritize subject, persona and availability
  let overallScore;
  if (String(intention).toLowerCase() === "exam" && subject) {
    overallScore =
      subjectMatch * 0.5 + // primary factor
      personaMatch * 0.2 +
      availabilityMatch * 0.2 +
      collaborationStyleMatch * 0.1;
  } else {
    overallScore =
      learningStyleMatch * 0.25 +
      courseOverlap * 0.35 +
      availabilityMatch * 0.2 +
      collaborationStyleMatch * 0.2;
  }

  return {
    overallScore: Math.round(overallScore),
    learningStyleMatch: Math.round(learningStyleMatch),
    courseOverlap: Math.round(courseOverlap),
    availabilityMatch: Math.round(availabilityMatch),
    collaborationStyleMatch: Math.round(collaborationStyleMatch),
    subjectMatch: Math.round(subjectMatch || 0),
    sharedCourses,
    sharedTimes,
  };
};

/**
 * Find best partner matches using Hungarian Algorithm
 * @param {ObjectId} userId - ID of the user looking for partners
 * @param {Object} options - Filter options
 * @returns {Array} - Top 3-5 partner matches sorted by compatibility
 */
export const findPartnerMatches = async (userId, options = {}) => {
  const {
    minScore = 40,
    limit = 5,
    excludeConnected = true,
    subject = null,
    intention = null,
    debug = false,
  } = options;

  try {
    // Get the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    console.log(`[MATCHING] User ${userId} searching for ${intention} partners${subject ? ` in ${subject}` : ""}`);
    console.log(`[MATCHING] Current user profile:`, currentUser.partnerProfile);

    // Get all users with visible partner profiles (excluding self)
    let potentialPartners = await User.find({
      _id: { $ne: userId },
      "partnerProfile.isVisible": true,
    }).select(
      "fullName nickname email universityName departmentName profilePicture partnerProfile score studyPersona _id"
    );

    console.log(`[MATCHING] Found ${potentialPartners.length} visible candidates (excluding self)`);

    // Prepare debug info
    const debugInfo = {
      initialCandidateCount: potentialPartners.length,
      afterSubjectFilterCount: null,
      subjectFilter: subject || null,
      intention: intention || null,
      consideredCandidates: [],
      allCandidates: potentialPartners.map(p => ({
        id: p._id,
        email: p.email,
        nickname: p.nickname,
        courses: p.partnerProfile?.primaryCourses || [],
        studyPersona: p.studyPersona,
      })),
    };

    // If intention is 'exam' and a subject is provided, filter partners to those listing the subject
    // Use substring matching for flexibility
    if (String(intention).toLowerCase() === "exam" && subject) {
      const s = String(subject).toLowerCase().trim();
      console.log(`[MATCHING] Filtering by subject: "${s}"`);
      
      potentialPartners = potentialPartners.filter((p) => {
        const courses = Array.isArray(p.partnerProfile?.primaryCourses)
          ? p.partnerProfile.primaryCourses
          : [];
        const hasSubject = courses.some((pc) => String(pc).toLowerCase().includes(s));
        if (!hasSubject) {
          console.log(`[MATCHING] Candidate ${p.nickname} (${p._id}) does NOT have subject. Courses: ${courses.join(", ")}`);
        }
        return hasSubject;
      });
      debugInfo.afterSubjectFilterCount = potentialPartners.length;
      console.log(`[MATCHING] After subject filter: ${potentialPartners.length} candidates remain`);
    }

    if (potentialPartners.length === 0) {
      console.log(`[MATCHING] No candidates after filtering. Returning empty matches.`);
      if (debug) {
        return { matches: [], debug: debugInfo };
      }
      return [];
    }

    // Calculate compatibility scores for all potential partners
    const compatibilityMatrix = potentialPartners.map((partner) => {
      const compatibility = calculateCompatibility(currentUser, partner, { intention, subject });

      // mark matchedSubject for information (already computed inside compatibility)
      const matchedSubject = (compatibility.subjectMatch || 0) > 0;

      console.log(`[MATCHING] Candidate ${partner.nickname} (${partner._id}):`, {
        overallScore: compatibility.overallScore,
        subjectMatch: compatibility.subjectMatch,
        courseOverlap: compatibility.courseOverlap,
        availabilityMatch: compatibility.availabilityMatch,
        personaMatch: compatibility.personaMatch || "N/A",
        matchedSubject,
      });

      return {
        partnerId: partner._id,
        fullName: partner.fullName,
        nickname: partner.nickname,
        email: partner.email,
        universityName: partner.universityName,
        departmentName: partner.departmentName,
        profilePicture: partner.profilePicture,
        partnerProfile: partner.partnerProfile,
        matchedSubject,
        overallScore: compatibility.overallScore,
        ...compatibility,
      };
    });

    // Collect consideredCandidates for debug
    compatibilityMatrix.forEach((c) => {
      debugInfo.consideredCandidates.push({
        id: c.partnerId,
        email: c.email,
        nickname: c.nickname,
        overallScore: c.overallScore,
        matchedSubject: !!c.matchedSubject,
      });
    });

    // Simple and predictable selection: sort by overallScore and return top results
    console.log(`[MATCHING] minScore filter: ${minScore}`);
    const matches = compatibilityMatrix
      .filter((m) => {
        const passes = m.overallScore >= minScore && m.overallScore > 0;
        if (!passes) {
          console.log(`[MATCHING] Candidate ${m.nickname} filtered out: score ${m.overallScore} < ${minScore}`);
        }
        return passes;
      })
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);

    console.log(`[MATCHING] Final matches after filtering and sorting: ${matches.length}`);

    if (debug) {
      return { matches, debug: debugInfo };
    }

    return matches;
  } catch (error) {
    console.error("Error finding partner matches:", error);
    throw error;
  }
};

/**
 * Find top matches for a specific hangout intention
 * @param {ObjectId} userId - ID of the user looking for partners
 * @param {String} intention - Hangout intention (Event, Exam, Coding Issue)
 * @returns {Array} - Filtered partner matches
 */
export const findMatchesByIntention = async (userId, intention, options = {}) => {
  // Ensure intention is passed through to the main matching function
  const matches = await findPartnerMatches(userId, { intention, limit: options.limit || 5, ...options });
  return matches;
};

export default { findPartnerMatches, findMatchesByIntention };
