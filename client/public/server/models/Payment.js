const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount must be positive'],
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['qr', 'bank-transfer', 'cash', 'jazzcash', 'easypaisa'],
  },
  mobileNumber: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },

  // Bank transfer details
  transactionId: {
    type: String,
    default: null,
  },
  bankName: {
    type: String,
    default: null,
  },
  accountNumber: {
    type: String,
    default: null,
  },
  // UPI/QR details
  upiId: {
    type: String,
    default: null,
  },
  qrCodeUrl: {
    type: String,
    default: null,
  },
  // Payment metadata
  description: {
    type: String,
    default: 'Service booking payment',
  },
  failureReason: {
    type: String,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
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
paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

