import Reminder from "../model/reminderModel.js";
import mongoose from "mongoose";

// Create a new reminder
export const createReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      reminderDate,
      reminderTime,
      priority,
      category,
      tags
    } = req.body;

    // Validation
    if (!title || !reminderDate || !reminderTime) {
      return res.status(400).json({
        success: false,
        message: "Title, reminder date, and reminder time are required"
      });
    }

    // Validate reminder date
    const reminderDateObj = new Date(reminderDate);
    if (isNaN(reminderDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid reminder date format"
      });
    }

    // Check if reminder date is in the past
    const now = new Date();
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    if (reminderDateTime < now) {
      return res.status(400).json({
        success: false,
        message: "Reminder date and time cannot be in the past"
      });
    }

    const newReminder = new Reminder({
      userId: req.userId,
      title: title.trim(),
      description: description?.trim() || "",
      reminderDate: reminderDateObj,
      reminderTime: reminderTime.trim(),
      priority: priority || "medium",
      category: category?.trim() || "",
      tags: tags || []
    });

    await newReminder.save();

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder: newReminder
    });

  } catch (error) {
    console.error("Create reminder error:", error);
    
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
      message: "Internal server error during reminder creation"
    });
  }
};

// Get all reminders for a user
export const getReminders = async (req, res) => {
  try {
    const { category, priority, isActive, sortBy = "reminderDate", sortOrder = "asc" } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    if (category) query.category = { $regex: category, $options: "i" };
    if (priority) query.priority = priority;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reminders = await Reminder.find(query)
      .sort(sort)
      .select("-userId");

    res.status(200).json({
      success: true,
      reminders
    });

  } catch (error) {
    console.error("Get reminders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get a single reminder
export const getReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
      _id: id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      success: true,
      reminder
    });

  } catch (error) {
    console.error("Get reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update a reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate reminder date if provided
    if (updateData.reminderDate) {
      const reminderDateObj = new Date(updateData.reminderDate);
      if (isNaN(reminderDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder date format"
        });
      }
      updateData.reminderDate = reminderDateObj;
    }

    // Remove userId from update data to prevent unauthorized updates
    delete updateData.userId;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder
    });

  } catch (error) {
    console.error("Update reminder error:", error);
    
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
      message: "Internal server error during reminder update"
    });
  }
};

// Delete a reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully"
    });

  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during reminder deletion"
    });
  }
};

// Get upcoming reminders (for notifications)
export const getUpcomingReminders = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const now = new Date();
    const futureTime = new Date(now.getTime() + (parseInt(hours) * 60 * 60 * 1000));

    // Get all active reminders for the user
    const allReminders = await Reminder.find({
      userId: req.userId,
      isActive: true
    }).sort({ reminderDate: 1 });

    // Filter reminders that are due within the specified time range
    const upcomingReminders = allReminders.filter(reminder => {
      const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      return reminderDateTime >= now && reminderDateTime <= futureTime;
    });

    res.status(200).json({
      success: true,
      reminders: upcomingReminders
    });

  } catch (error) {
    console.error("Get upcoming reminders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Mark reminder as completed
export const markReminderCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isCompleted: true, isActive: false },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder marked as completed",
      reminder
    });

  } catch (error) {
    console.error("Mark reminder completed error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
