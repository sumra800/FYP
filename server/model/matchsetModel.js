import mongoose from "mongoose";

const MatchSetSchema = new mongoose.Schema(
  {
    requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestType: { type: String, enum: ["Coding", "Exam", "Event", "Any"], required: true },
    subject: { type: String }, // Only populated if requestType is "Exam"
    matchedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        compatibilityScore: { type: Number, required: true }, // 0-100
        status: {
          type: String,
          enum: ["not_connected", "pending", "approved"],
          default: "not_connected"
        },
        _id: false, // Prevent individual _id for subdocuments
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("MatchSet", MatchSetSchema);
