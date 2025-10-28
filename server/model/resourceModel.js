import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  resourceType: {
    type: String,
    required: true,
    enum: ["pastPaper", "notes", "tutorial"],
    default: "notes"
  },
  
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  
  year: {
    type: String,
    required: true
  },
  
  semester: {
    type: String,
    required: true,
    enum: ["Fall", "Spring", "Summer"]
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  
  filePath: {
    type: String,
    required: true
  },
  
  fileSize: {
    type: Number
  },
  
  fileType: {
    type: String
  },
  
  // Author Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  authorName: {
    type: String,
    required: true
  },
  
  // Engagement Metrics
  downloads: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  // Status and Approval
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can add moderation later
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Tags for searching
  tags: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
resourceSchema.index({ courseName: 1, year: -1 });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ semester: 1 });

// Virtual for formatted upload date
resourceSchema.virtual('formattedDate').get(function() {
  return this.uploadedAt.toLocaleDateString();
});

export default mongoose.model("Resource", resourceSchema);

