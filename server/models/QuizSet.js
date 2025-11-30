import mongoose from "mongoose";

const quizSetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    subject: { type: String, required: true },

    questions: [
      {
        question: String,
        answer: String,       // correct answer
        options: [String],    // ["a", "b", "c", "d"]
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("QuizSet", quizSetSchema);
