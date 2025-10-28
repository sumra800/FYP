import StudySession from "../model/studySessionModel.js";
import mongoose from "mongoose";

// Create a new study session
export const createStudySession = async (req, res) => {
  try {
    const { courseName, duration, startTime, endTime } = req.body;
    const userId = req.user.id;

    if (!courseName || !duration || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate total seconds
    const totalSeconds = (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;

    if (totalSeconds === 0) {
      return res.status(400).json({ message: "Study session must have a duration" });
    }

    const studySession = new StudySession({
      userId,
      courseName: courseName.trim(),
      duration,
      totalSeconds,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      date: new Date()
    });

    await studySession.save();

    res.status(201).json({
      message: "Study session saved successfully",
      session: studySession
    });
  } catch (error) {
    console.error("Error creating study session:", error);
    res.status(500).json({ message: "Failed to save study session", error: error.message });
  }
};

// Get all study sessions for the logged-in user
export const getAllStudySessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseName, startDate, endDate, limit } = req.query;

    let query = { userId };

    if (courseName) {
      query.courseName = new RegExp(courseName, 'i');
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sessions = await StudySession.find(query)
      .sort({ date: -1 })
      .limit(limit ? parseInt(limit) : 100);

    res.status(200).json({
      message: "Study sessions retrieved successfully",
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error("Error getting study sessions:", error);
    res.status(500).json({ message: "Failed to retrieve study sessions", error: error.message });
  }
};

// Get study progress by course (aggregated data)
export const getStudyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Calculate date range (last N days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate study time by course
    const progressData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$courseName",
          totalMinutes: { $sum: { $divide: ["$totalSeconds", 60] } },
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } },
          sessionCount: { $sum: 1 },
          lastStudied: { $max: "$date" }
        }
      },
      {
        $sort: { totalMinutes: -1 }
      },
      {
        $project: {
          courseName: "$_id",
          totalMinutes: { $round: ["$totalMinutes", 1] },
          totalHours: { $round: ["$totalHours", 2] },
          sessionCount: 1,
          lastStudied: 1,
          _id: 0
        }
      }
    ]);

    // Get weekly breakdown for each course
    const weeklyData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            courseName: "$courseName",
            week: { $week: "$date" }
          },
          totalMinutes: { $sum: { $divide: ["$totalSeconds", 60] } }
        }
      },
      {
        $sort: { "_id.week": 1 }
      }
    ]);

    res.status(200).json({
      message: "Study progress retrieved successfully",
      days: parseInt(days),
      courses: progressData,
      weeklyData
    });
  } catch (error) {
    console.error("Error getting study progress:", error);
    res.status(500).json({ message: "Failed to retrieve study progress", error: error.message });
  }
};

// Get study statistics for a specific course
export const getCourseStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseName } = req.params;

    if (!courseName) {
      return res.status(400).json({ message: "Course name is required" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const stats = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          courseName: courseName,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: { $divide: ["$totalSeconds", 60] } },
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } },
          sessionCount: { $sum: 1 },
          avgMinutesPerSession: { $avg: { $divide: ["$totalSeconds", 60] } },
          lastStudied: { $max: "$date" }
        }
      },
      {
        $project: {
          totalMinutes: { $round: ["$totalMinutes", 1] },
          totalHours: { $round: ["$totalHours", 2] },
          sessionCount: 1,
          avgMinutesPerSession: { $round: ["$avgMinutesPerSession", 1] },
          lastStudied: 1,
          _id: 0
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        message: "No study sessions found for this course",
        courseName,
        stats: {
          totalMinutes: 0,
          totalHours: 0,
          sessionCount: 0,
          avgMinutesPerSession: 0
        }
      });
    }

    res.status(200).json({
      message: "Course statistics retrieved successfully",
      courseName,
      stats: stats[0]
    });
  } catch (error) {
    console.error("Error getting course statistics:", error);
    res.status(500).json({ message: "Failed to retrieve course statistics", error: error.message });
  }
};

// Get weekly and monthly statistics
export const getWeeklyMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate dates
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get this week's data
    const thisWeekData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } },
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    // Get last week's data
    const lastWeekData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfLastWeek, $lt: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } }
        }
      }
    ]);

    // Get this month's data
    const thisMonthData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } },
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    // Get last month's data
    const lastMonthData = await StudySession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ["$totalSeconds", 3600] } }
        }
      }
    ]);

    // Calculate percentage changes
    const weeklyHours = thisWeekData[0]?.totalHours || 0;
    const lastWeekHours = lastWeekData[0]?.totalHours || 0;
    const weeklyChange = lastWeekHours > 0 
      ? ((weeklyHours - lastWeekHours) / lastWeekHours) * 100 
      : 0;

    const monthlyHours = thisMonthData[0]?.totalHours || 0;
    const lastMonthHours = lastMonthData[0]?.totalHours || 0;
    const monthlyChange = lastMonthHours > 0 
      ? ((monthlyHours - lastMonthHours) / lastMonthHours) * 100 
      : 0;

    res.status(200).json({
      message: "Weekly and monthly statistics retrieved successfully",
      weekly: {
        hours: Math.round(weeklyHours * 10) / 10,
        sessionCount: thisWeekData[0]?.sessionCount || 0,
        change: Math.round(weeklyChange * 10) / 10
      },
      monthly: {
        hours: Math.round(monthlyHours * 10) / 10,
        sessionCount: thisMonthData[0]?.sessionCount || 0,
        change: Math.round(monthlyChange * 10) / 10
      }
    });
  } catch (error) {
    console.error("Error getting weekly/monthly stats:", error);
    res.status(500).json({ message: "Failed to retrieve statistics", error: error.message });
  }
};

// Delete a study session
export const deleteStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await StudySession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    await StudySession.findByIdAndDelete(id);

    res.status(200).json({ message: "Study session deleted successfully" });
  } catch (error) {
    console.error("Error deleting study session:", error);
    res.status(500).json({ message: "Failed to delete study session", error: error.message });
  }
};

export default {
  createStudySession,
  getAllStudySessions,
  getStudyProgress,
  getCourseStatistics,
  getWeeklyMonthlyStats,
  deleteStudySession
};

