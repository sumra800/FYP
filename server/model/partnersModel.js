import mongoose from "mongoose";

const PartnershipSchema = new mongoose.Schema(
  {
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "pending"
    },
    requestType: { type: String, enum: ["Coding", "Exam", "Event", "Any"], required: true },
    subject: { type: String }, // Only populated if requestType is "Exam"
    compatibilityScore: { type: Number, required: true }, // 0-100
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who sent the request
    communicationTools: [String], // e.g., ["Discord", "Email", "Phone"]
    notes: { type: String, trim: true }, // Additional notes from either user
  },
  { timestamps: true }
);

// Ensure only one partnership per pair of users (regardless of direction)
PartnershipSchema.index(
  { user1Id: 1, user2Id: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } }
  }
);

// Export under a unique model name to avoid colliding with the existing
// `Partnership` model defined in `partnershipModel.js`.
export default mongoose.model("PartnersRecord", PartnershipSchema);
