import Assignment from "../model/assignmentModel.js";
import mongoose from "mongoose";

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      dueDate,
      priority,
      estimatedHours,
      tags
    } = req.body;

    // Validation
    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, and due date are required"
      });
    }

    // Validate due date
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format"
      });
    }

    // Check if due date is in the past
    if (dueDateObj < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be in the past"
      });
    }

    const newAssignment = new Assignment({
      userId: req.userId,
      title: title.trim(),
      description: description?.trim() || "",
      subject: subject.trim(),
      dueDate: dueDateObj,
      priority: priority || "medium",
      estimatedHours: estimatedHours || 0,
      tags: tags || []
    });

    await newAssignment.save();

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: newAssignment
    });

  } catch (error) {
    console.error("Create assignment error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during assignment creation"
    });
  }
};

// Get all assignments for a user
export const getAssignments = async (req, res) => {
  try {
    const { status, subject, sortBy = "dueDate", sortOrder = "asc" } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    if (status) query.status = status;
    if (subject) query.subject = { $regex: subject, $options: "i" };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const assignments = await Assignment.find(query)
      .sort(sort)
      .select("-userId");

    res.status(200).json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get a single assignment
export const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOne({
      _id: id,
      userId: req.userId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.status(200).json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update an assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate due date if provided
    if (updateData.dueDate) {
      const dueDateObj = new Date(updateData.dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format"
        });
      }
      updateData.dueDate = dueDateObj;
    }

    // Remove userId from update data to prevent unauthorized updates
    delete updateData.userId;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment
    });

  } catch (error) {
    console.error("Update assignment error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during assignment update"
    });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully"
    });

  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during assignment deletion"
    });
  }
};

// Get assignment statistics
export const getAssignmentStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get total assignments
    const totalAssignments = await Assignment.countDocuments({ userId });

    // Get assignments by status
    const statusCounts = await Assignment.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get assignments due this week
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const dueThisWeek = await Assignment.countDocuments({
      userId,
      dueDate: { $gte: now, $lte: weekFromNow },
      status: { $ne: "completed" }
    });

    // Get overdue assignments
    const overdue = await Assignment.countDocuments({
      userId,
      dueDate: { $lt: now },
      status: { $ne: "completed" }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalAssignments,
        statusCounts,
        dueThisWeek,
        overdue
      }
    });

  } catch (error) {
    console.error("Get assignment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
