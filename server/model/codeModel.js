import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"]
  },
  title: {
    type: String,
    required: [true, "Code title is required"],
    trim: true,
    maxLength: [200, "Code title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, "Description cannot exceed 1000 characters"]
  },
  language: {
    type: String,
    required: [true, "Programming language is required"],
    enum: ["javascript", "python", "java", "cpp", "c", "csharp", "php", "ruby", "go", "rust", "swift", "kotlin", "typescript", "html", "css", "sql", "other"],
    default: "javascript"
  },
  code: {
    type: String,
    required: [true, "Code content is required"],
    maxLength: [10000, "Code cannot exceed 10000 characters"]
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [30, "Tag cannot exceed 30 characters"]
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: [500, "Comment cannot exceed 500 characters"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
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
codeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
codeSchema.index({ userId: 1, createdAt: -1 });
codeSchema.index({ language: 1, createdAt: -1 });
codeSchema.index({ isPublic: 1, createdAt: -1 });
codeSchema.index({ tags: 1 });

const Code = mongoose.model("Code", codeSchema);

export default Code;
