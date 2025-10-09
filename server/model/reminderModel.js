import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"]
  },
  title: {
    type: String,
    required: [true, "Reminder title is required"],
    trim: true,
    maxLength: [200, "Reminder title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, "Description cannot exceed 500 characters"]
  },
  reminderDate: {
    type: Date,
    required: [true, "Reminder date is required"]
  },
  reminderTime: {
    type: String,
    required: [true, "Reminder time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time format (HH:MM)"]
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    maxLength: [50, "Category cannot exceed 50 characters"]
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [30, "Tag cannot exceed 30 characters"]
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
reminderSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
reminderSchema.index({ userId: 1, reminderDate: 1 });
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ reminderDate: 1, isActive: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
