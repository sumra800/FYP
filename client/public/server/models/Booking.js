const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  service: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  serviceId: {
    type: Number,
    required: [true, 'Service ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  time: {
    type: String,
    required: [true, 'Booking time is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
  },
  address: {
    type: String,
    required: [true, 'Service address is required'],
    trim: true,
  },
  specialInstructions: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending_admin', 'pending_provider', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending_admin',
  },
  assignedHelper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  helperName: {
    type: String,
    default: '',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['qr', 'bank-transfer', 'cash'],
    default: 'qr',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    trim: true,
    default: '',
  },
  clientRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  clientReview: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 }); // For user's bookings queries
bookingSchema.index({ status: 1 }); // For filtering by status
bookingSchema.index({ date: 1 }); // For date-based queries
bookingSchema.index({ assignedHelper: 1 }); // For helper's assigned bookings

module.exports = mongoose.model('Booking', bookingSchema);

