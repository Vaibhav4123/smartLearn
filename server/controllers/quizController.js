
import QuizSet from "../models/QuizSet.js";
import Quiz from "../models/Quiz.js";

import { generateGeminiQuiz } from "../utils/geminiQuiz.js";
/* ────────────────────────────────
   🔹 AI QUIZ GENERATION
   prefix: /api/quiz/ai/...
   ──────────────────────────────── */
export const generateQuiz = async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject)
      return res.status(400).json({ message: "Subject required" });

    // Generate using Gemini/GPT
    const aiData = await generateGeminiQuiz(subject);

    const set = await QuizSet.create({
      user: req.user?.id || null,
      subject,
      questions: aiData.questions,
    });

    res.json({
      success: true,
      setId: set._id,
      questions: set.questions,
    });
  } catch (err) {
    console.error("Generate quiz error:", err);
    res.status(500).json({ message: "AI quiz generation failed" });
  }
};





export const getQuizQuestions = async (req, res) => {
  try {
    const set = await QuizSet.findById(req.params.id);

    if (!set) return res.status(404).json({ message: "Not found" });

    res.json(set);
  } catch (err) {
    console.error("Fetch quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const submitQuiz = async (req, res) => {
  try {
    const { subject, questions, scores, totalScore, percentage } = req.body;

    if (!subject || !questions || !scores)
      return res.status(400).json({ message: "Missing fields" });

    const quiz = await Quiz.create({
      user: req.user?.id || null,
      subject,
      questions,     // stores entire attempt
      scores,        // 0/1 array
      totalScore,
      percentage,
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error("My quizzes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json(quiz);
  } catch (err) {
    console.error("Get quiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

