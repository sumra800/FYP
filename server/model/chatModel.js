import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  isBot: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
