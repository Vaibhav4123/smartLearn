
import Interview from "../models/Interview.js";
import InterviewSet from "../models/InterviewSet.js";
import { generateGeminiQA } from "../utils/gemini.js";


/* ────────────────────────────────
   🔹 AI GENERATION CONTROLLERS
   prefix: /api/interview/ai/...
   ──────────────────────────────── */

// 1️⃣ Generate interview questions using Gemini AI
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ message: "Subject required" });

    const aiData = await generateGeminiQA(subject);

    const interviewSet = await InterviewSet.create({
      user: req.user?.id || null,
      subject,
      questions: aiData.questions,
    });

    res.json({
      success: true,
      setId: interviewSet._id,
      questions: interviewSet.questions,
    });
  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ message: "AI generation failed" });
  }
};


// 2️⃣ Get generated question set
export const getInterviewQuestions = async (req, res) => {
  try {
    const set = await InterviewSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: "Not found" });

    res.json(set);
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ────────────────────────────────
   🔹 INTERVIEW RESULT CONTROLLERS
   prefix: /api/interview/...
   ──────────────────────────────── */

// 3️⃣ Save written interview attempt
export const saveInterview = async (req, res) => {
  try {
    const { subject, questions, scores, totalScore, percentage } = req.body;

    if (!subject || !questions || !scores)
      return res.status(400).json({ message: "Missing fields" });

    const interview = await Interview.create({
      user: req.user?.id || null,
      subject,
      questions,
      scores,
      totalScore,
      percentage,
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error("Save interview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 4️⃣ Get all my interview attempts
export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (err) {
    console.error("Get interviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 5️⃣ Get one interview result
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Not found" });

    res.json(interview);
  } catch (err) {
    console.error("Get interview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


