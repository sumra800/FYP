import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
    trim: true,
    maxLength: [200, "Event title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Event description is required"],
    trim: true,
    maxLength: [2000, "Description cannot exceed 2000 characters"]
  },
  eventType: {
    type: String,
    required: [true, "Event type is required"],
    enum: ["seminar", "workshop", "conference", "meeting", "social", "academic", "other"],
    default: "other"
  },
  organizer: {
    type: String,
    required: [true, "Organizer is required"],
    trim: true,
    maxLength: [100, "Organizer name cannot exceed 100 characters"]
  },
  location: {
    type: String,
    required: [true, "Event location is required"],
    trim: true,
    maxLength: [200, "Location cannot exceed 200 characters"]
  },
  eventDate: {
    type: Date,
    required: [true, "Event date is required"]
  },
  startTime: {
    type: String,
    required: [true, "Start time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:MM)"]
  },
  endTime: {
    type: String,
    required: [true, "End time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:MM)"]
  },
  maxAttendees: {
    type: Number,
    min: [1, "Maximum attendees must be at least 1"],
    default: null
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: [0, "Current attendees cannot be negative"]
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    default: null
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date,
    default: null
  },
  contactEmail: {
    type: String,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
  },
  contactPhone: {
    type: String,
    trim: true,
    maxLength: [20, "Phone number cannot exceed 20 characters"]
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
eventSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
eventSchema.index({ eventDate: 1, startTime: 1 });
eventSchema.index({ eventType: 1, isActive: 1 });
eventSchema.index({ isFeatured: 1, eventDate: 1 });
eventSchema.index({ tags: 1, isActive: 1 });
eventSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.maxAttendees && this.currentAttendees >= this.maxAttendees;
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationRequired) return false;
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const eventDateTime = new Date(`${this.eventDate.toISOString().split('T')[0]}T${this.startTime}`);
  return eventDateTime > now;
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;
