import mongoose from "mongoose";

const interviewSetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    subject: { type: String, required: true },
    questions: [
      {
        question: String,
        answer: String, // AI-given correct answer
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSet", interviewSetSchema);
