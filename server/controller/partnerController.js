import munkres from "munkres-js";
import User from "../model/userModel.js";

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const calculateSetOverlap = (setA = [], setB = []) => {
  if (!setA.length || !setB.length) {
    return {
      shared: [],
      ratio: 0
    };
  }

  const shared = setA.filter((item) =>
    setB.map((b) => b.toLowerCase()).includes(item.toLowerCase())
  );

  const ratio = shared.length / Math.max(setA.length, setB.length);
  return { shared, ratio };
};

const calculateCompatibilityScore = (currentUser, candidate) => {
  const currentProfile = currentUser.partnerProfile || {};
  const candidateProfile = candidate.partnerProfile || {};

  const currentCourses = normalizeArray(currentProfile.primaryCourses);
  const candidateCourses = normalizeArray(candidateProfile.primaryCourses);

  const currentFocus = normalizeArray(currentProfile.focusAreas);
  const candidateFocus = normalizeArray(candidateProfile.focusAreas);

  const currentTimes = normalizeArray(currentProfile.preferredStudyTimes);
  const candidateTimes = normalizeArray(candidateProfile.preferredStudyTimes);

  const { shared: sharedCourses, ratio: courseRatio } = calculateSetOverlap(
    currentCourses,
    candidateCourses
  );
  const { shared: sharedFocus, ratio: focusRatio } = calculateSetOverlap(currentFocus, candidateFocus);
  const { shared: sharedTimes, ratio: timeRatio } = calculateSetOverlap(currentTimes, candidateTimes);

  const learningStyleMatch =
    !currentProfile.preferredLearningStyle ||
    currentProfile.preferredLearningStyle === "any" ||
    currentProfile.preferredLearningStyle === candidateProfile.preferredLearningStyle
      ? 1
      : 0;

  const collaborationMatch =
    !currentProfile.collaborationStyle ||
    currentProfile.collaborationStyle === "any" ||
    currentProfile.collaborationStyle === candidateProfile.collaborationStyle
      ? 1
      : 0.5;

  const sameUniversity = currentUser.universityName === candidate.universityName ? 1 : 0.4;

  const weights = {
    course: 0.4,
    focus: 0.15,
    availability: 0.15,
    learningStyle: 0.15,
    collaboration: 0.05,
    university: 0.1
  };

  const score =
    courseRatio * weights.course +
    focusRatio * weights.focus +
    timeRatio * weights.availability +
    learningStyleMatch * weights.learningStyle +
    collaborationMatch * weights.collaboration +
    sameUniversity * weights.university;

  return {
    score: Number((score * 100).toFixed(2)),
    sharedCourses,
    sharedFocus,
    sharedTimes
  };
};

const runHungarianAssignment = (scoreMatrix) => {
  if (!scoreMatrix.length || !scoreMatrix[0].length) {
    return [];
  }

  const rowCount = scoreMatrix.length;
  const colCount = scoreMatrix[0].length;
  const size = Math.max(rowCount, colCount);
  const flatScores = scoreMatrix.flat();
  const maxScore = flatScores.length ? Math.max(...flatScores) : 0;

  const costMatrix = Array.from({ length: size }, (_, rowIdx) =>
    Array.from({ length: size }, (_, colIdx) => {
      if (rowIdx < rowCount && colIdx < colCount) {
        return maxScore - scoreMatrix[rowIdx][colIdx];
      }
      return maxScore + 1;
    })
  );

  const assignments = munkres(costMatrix);

  return assignments.filter(
    ([rowIdx, colIdx]) => rowIdx < rowCount && colIdx < colCount && colIdx < colCount
  );
};

export const getPartnerMatches = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const minScore = Number(req.query.minScore) || 0;
    const intention = (req.query.intention || "").toLowerCase();
    const subject = req.query.subject || null;
    const userId = req.userId;

    const currentUser = await User.findById(userId)
      .select("fullName nickname universityName departmentName partnerProfile score studyPersona")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.partnerProfile?.isVisible) {
      return res.status(400).json({
        message: "Please complete your partner profile to get matches.",
        matches: []
      });
    }

    let candidates = await User.find({
      _id: { $ne: currentUser._id },
      "partnerProfile.isVisible": true
    })
      .select(
        "fullName nickname universityName departmentName partnerProfile score profilePicture studyPersona"
      )
      .lean();

    if (!candidates.length) {
      return res.json({ matches: [] });
    }

    // Diagnostic object to help debug when no matches are found
    const debugInfo = {
      initialCandidateCount: candidates.length,
      afterSubjectFilterCount: null,
      subjectFilter: subject || null,
      intention: intention || null,
      consideredCandidates: [],
    };

    // If intention is exam and a subject is provided, narrow candidates to those who list the subject
    if (intention === "exam" && subject) {
      const s = String(subject).toLowerCase().trim();
      // Use more permissive matching: substring match (case-insensitive)
      candidates = candidates.filter((c) => {
        const courses = Array.isArray(c.partnerProfile?.primaryCourses)
          ? c.partnerProfile.primaryCourses
          : [];
        return courses.some((pc) => String(pc).toLowerCase().includes(s));
      });
      debugInfo.afterSubjectFilterCount = candidates.length;
    }

    if (!candidates.length) {
      return res.json({ matches: [] });
    }

    // Compute compatibility scores and include persona/availability info
    const scored = candidates.map((candidate) => {
      const meta = calculateCompatibilityScore(currentUser, candidate);
      // persona match bonus for exam intention
      const personaMatch = ((currentUser.studyPersona || "").toLowerCase() === (candidate.studyPersona || "").toLowerCase()) ? 1 : 0;
      // availability overlap
      const currentTimes = Array.isArray(currentUser.partnerProfile?.preferredStudyTimes) ? currentUser.partnerProfile.preferredStudyTimes : [];
      const candidateTimes = Array.isArray(candidate.partnerProfile?.preferredStudyTimes) ? candidate.partnerProfile.preferredStudyTimes : [];
      const sharedTimes = currentTimes.filter((t) => candidateTimes.includes(t));
      const availabilityMatch = (currentTimes.length && candidateTimes.length) ? (sharedTimes.length / Math.min(currentTimes.length, candidateTimes.length)) : 0;

      let adjustedScore = meta.score;
      if (intention === "exam") {
        // Boost subject/persona/availability importance
        adjustedScore = Math.round(
          adjustedScore * 0.6 + // base
          personaMatch * 20 +
          availabilityMatch * 20
        );
      }

      const entry = {
        candidate,
        meta,
        adjustedScore
      };
      // collect brief candidate info for debugging
      debugInfo.consideredCandidates.push({
        id: candidate._id,
        email: candidate.email,
        nickname: candidate.nickname,
        adjustedScore,
      });
      return entry;
    });

    let matches = [];

    if (intention === "coding issue") {
      // For coding issues, pick users with highest score (trust top scorers)
      matches = scored
        .filter((s) => s.adjustedScore >= minScore)
        .sort((a, b) => b.adjustedScore - a.adjustedScore)
        .slice(0, limit)
        .map((s) => {
          const c = s.candidate;
          const partnerProfile = c.partnerProfile || {};
          return {
            partnerId: c._id,
            fullName: c.fullName,
            nickname: c.nickname,
            universityName: c.universityName,
            departmentName: c.departmentName,
            profilePicture: c.profilePicture,
            matchScore: s.adjustedScore,
            sharedCourses: s.meta.sharedCourses,
            sharedFocus: s.meta.sharedFocus,
            sharedTimes: s.meta.sharedTimes,
            primaryCourses: normalizeArray(partnerProfile.primaryCourses),
            focusAreas: normalizeArray(partnerProfile.focusAreas),
            preferredLearningStyle: partnerProfile.preferredLearningStyle,
            preferredStudyTimes: normalizeArray(partnerProfile.preferredStudyTimes)
          };
        });
    } else {
      // Default flow: use Hungarian assignment for fairness, but fall back to sorting by score
      const scoreMatrix = [scored.map((s) => s.adjustedScore)];
      const assignments = runHungarianAssignment([scoreMatrix[0]]);

      // If Hungarian fails to provide useful assignments, fallback to simple sort
      let selectedIndexes = [];
      if (assignments && assignments.length > 0) {
        selectedIndexes = assignments
          .filter(([rowIndex]) => rowIndex === 0)
          .map(([, colIndex]) => colIndex)
          .filter((idx) => idx >= 0 && idx < scored.length);
      }

      if (!selectedIndexes.length) {
        selectedIndexes = scored
          .map((s, idx) => ({ idx, score: s.adjustedScore }))
          .filter((x) => x.score >= minScore)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((x) => x.idx);
      }

      matches = selectedIndexes
        .slice(0, limit)
        .map((i) => {
          const s = scored[i];
          const c = s.candidate;
          const partnerProfile = c.partnerProfile || {};
          return {
            partnerId: c._id,
            fullName: c.fullName,
            nickname: c.nickname,
            universityName: c.universityName,
            departmentName: c.departmentName,
            profilePicture: c.profilePicture,
            matchScore: s.adjustedScore,
            sharedCourses: s.meta.sharedCourses,
            sharedFocus: s.meta.sharedFocus,
            sharedTimes: s.meta.sharedTimes,
            primaryCourses: normalizeArray(partnerProfile.primaryCourses),
            focusAreas: normalizeArray(partnerProfile.focusAreas),
            preferredLearningStyle: partnerProfile.preferredLearningStyle,
            preferredStudyTimes: normalizeArray(partnerProfile.preferredStudyTimes)
          };
        });
    }

    // If debug requested or no matches found, include debug info to help tracing
    const wantDebug = String(req.query.debug || "false").toLowerCase() === "true";
    if (matches.length === 0 || wantDebug) {
      return res.json({ matches, debug: debugInfo });
    }

    res.json({ matches });
  } catch (error) {
    console.error("Error fetching partner matches:", error);
    res.status(500).json({ message: "Failed to fetch partner matches" });
  }
};

export const upsertPartnerProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const incomingProfile = {
      isVisible:
        typeof req.body.isVisible === "boolean" ? req.body.isVisible : user.partnerProfile?.isVisible,
      bio: req.body.bio ?? user.partnerProfile?.bio,
      primaryCourses: normalizeArray(req.body.primaryCourses),
      focusAreas: normalizeArray(req.body.focusAreas),
      preferredLearningStyle:
        req.body.preferredLearningStyle || user.partnerProfile?.preferredLearningStyle || "any",
      preferredStudyTimes: normalizeArray(req.body.preferredStudyTimes),
      collaborationStyle:
        req.body.collaborationStyle || user.partnerProfile?.collaborationStyle || "any",
      timezone: req.body.timezone ?? user.partnerProfile?.timezone,
      communicationTools: normalizeArray(req.body.communicationTools),
      experienceLevel: req.body.experienceLevel || user.partnerProfile?.experienceLevel || "other"
    };

    Object.keys(incomingProfile).forEach((key) => {
      if (incomingProfile[key] === undefined) {
        delete incomingProfile[key];
      }
    });

    const existingProfile =
      typeof user.partnerProfile?.toObject === "function"
        ? user.partnerProfile.toObject()
        : user.partnerProfile || {};

    user.partnerProfile = {
      ...existingProfile,
      ...incomingProfile,
      isVisible: incomingProfile.isVisible ?? true
    };

    await user.save();

    res.json({ partnerProfile: user.partnerProfile });
  } catch (error) {
    console.error("Error updating partner profile:", error);
    res.status(500).json({ message: "Failed to update partner profile" });
  }
};

