import mongoose from "mongoose";
import User from "./User.js";
// models/Interview.js

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // set true if login required
    },
    subject: { type: String, required: true },
    questions: [
      {
        question: String,
        correctAnswer: String,
        userAnswer: String,
      }
    ],
    scores: [Number],  // each 0 or 1 → max 10
    totalScore:{ type: Number, required: true },    // out of 10
    percentage:{ type: Number, required: true },     // (totalScore / questions.length) * 100
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);

