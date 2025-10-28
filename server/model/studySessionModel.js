import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  
  duration: {
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Total duration in seconds for easy calculations
  totalSeconds: {
    type: Number,
    required: true,
    min: 0
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studySessionSchema.index({ userId: 1, courseName: 1 });
studySessionSchema.index({ userId: 1, date: -1 });
studySessionSchema.index({ userId: 1, courseName: 1, date: -1 });

// Virtual for formatted duration
studySessionSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.totalSeconds / 3600);
  const minutes = Math.floor((this.totalSeconds % 3600) / 60);
  const seconds = this.totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
});

export default mongoose.model("StudySession", studySessionSchema);

