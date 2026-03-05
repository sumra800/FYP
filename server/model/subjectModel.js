import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: [100, "Subject name cannot exceed 100 characters"],
  },
});

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;