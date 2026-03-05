import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    maxLength: [100, "Full name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters long"]
  },
  universityName: {
    type: String,
    required: [true, "University name is required"],
    trim: true,
    maxLength: [200, "University name cannot exceed 200 characters"]
  },
  departmentName: {
    type: String,
    required: [true, "Department name is required"],
    trim: true,
    maxLength: [200, "Department name cannot exceed 200 characters"]
  },
  // Profile customization fields (optional)
  nickname: {
    type: String,
    trim: true,
    maxLength: [50, "Nickname cannot exceed 50 characters"]
  },
  currentSemester: {
    type: String,
    trim: true
  },
  codingSkills: {
    type: String,
    trim: true
  },
  studyPersona: {
    type: String,
    enum: ["geek", "nerd", "chill", ""],
    default: ""
  },
  personalDescription: {
    type: String,
    trim: true,
    maxLength: [500, "Personal description cannot exceed 500 characters"]
  },
  societyPosition: {
    type: String,
    trim: true,
    maxLength: [200, "Society position cannot exceed 200 characters"]
  },
  profilePicture: {
    type: String, // Store the file path or URL
    default: null
  },
   partnerProfile: {
    isVisible: {
      type: Boolean,
      default: true
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [600, "Bio cannot exceed 600 characters"]
    },
    primaryCourses: {
      type: [String],
      default: [],
      set: (courses) => courses.map(course => course.trim()).filter(Boolean)
    },
    focusAreas: {
      type: [String],
      default: [],
      set: (areas) => areas.map(area => area.trim()).filter(Boolean)
    },
    preferredLearningStyle: {
      type: String,
      enum: ["visual", "auditory", "kinesthetic", "reading", "any"],
      default: "any"
    },
    preferredStudyTimes: {
      type: [String],
      default: []
    },
    collaborationStyle: {
      type: String,
      enum: ["structured", "casual", "accountability", "any"],
      default: "any"
    },
    timezone: {
      type: String,
      trim: true
    },
    communicationTools: {
      type: [String],
      default: [],
      set: (tools) => tools.map(tool => tool.trim()).filter(Boolean)
    },
    experienceLevel: {
      type: String,
      enum: ["freshman", "sophomore", "junior", "senior", "graduate", "professional", "other"],
      default: "other"
    },
    lastMatchedAt: {
      type: Date,
      default: null
    }
  },
  // Scoring system
  score: {
    type: Number,
    default: 0,
    min: [0, "Score cannot be negative"]
  },
  // Google Classroom Integration
  googleAuth: {
    accessToken: {
      type: String,
      default: null
    },
    refreshToken: {
      type: String,
      default: null
    },
    tokenExpiry: {
      type: Date,
      default: null
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    lastSync: {
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

// Hash password before saving
userSchema.pre("save", async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
