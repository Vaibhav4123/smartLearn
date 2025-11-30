
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    subject: { type: String, required: true },

    questions: [
      {
        question: String,
        correctAnswer: String,
        selectedAnswer: String,
        options: [String],
      }
    ],

    scores: [Number],  // 1 = correct, 0 = wrong
    totalScore: Number,
    percentage: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
