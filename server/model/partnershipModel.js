import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestType: {
    type: String,
    enum: ["Event", "Exam", "Coding Issue", "Any"],
    default: "Any",
  },
  subject: {
    type: String,
    trim: true,
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  connectedAt: {
    type: Date,
    default: null,
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

partnershipSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

partnershipSchema.index({ user1Id: 1, user2Id: 1 });

const Partnership = mongoose.model("Partnership", partnershipSchema);

export default Partnership;