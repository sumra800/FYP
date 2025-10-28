import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"]
  },
  title: {
    type: String,
    required: [true, "Assignment title is required"],
    trim: true,
    maxLength: [200, "Assignment title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, "Description cannot exceed 1000 characters"]
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
    maxLength: [100, "Subject cannot exceed 100 characters"]
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"]
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started"
  },
  estimatedHours: {
    type: Number,
    min: [0, "Estimated hours cannot be negative"],
    max: [1000, "Estimated hours cannot exceed 1000"]
  },
  actualHours: {
    type: Number,
    min: [0, "Actual hours cannot be negative"],
    max: [1000, "Actual hours cannot exceed 1000"],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [50, "Tag cannot exceed 50 characters"]
  }],
  // Google Classroom Integration
  googleClassroom: {
    isFromClassroom: {
      type: Boolean,
      default: false
    },
    courseId: {
      type: String,
      default: null
    },
    courseName: {
      type: String,
      default: null
    },
    courseWorkId: {
      type: String,
      default: null
    },
    alternateLink: {
      type: String,
      default: null
    },
    maxPoints: {
      type: Number,
      default: null
    },
    workType: {
      type: String,
      enum: ['ASSIGNMENT', 'SHORT_ANSWER_QUESTION', 'MULTIPLE_CHOICE_QUESTION', null],
      default: null
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
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
assignmentSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
assignmentSchema.index({ userId: 1, dueDate: 1 });
assignmentSchema.index({ userId: 1, status: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
