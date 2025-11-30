
import express from "express";

import auth from "../middleware/authMiddleware.js";
import {
  generateQuiz,
  getQuizQuestions,
  submitQuiz,
  getMyQuizzes,
  getQuizById,
} from "../controllers/quizController.js";

const router = express.Router();

/* ────────────────────────────────
   🔹 AI QUIZ GENERATION
   prefix: /api/quiz/ai/...
   ──────────────────────────────── */
router.post("/ai/generate", auth ,  generateQuiz);
router.get("/ai/set/:id", auth, getQuizQuestions);

/* ────────────────────────────────
   🔹 QUIZ RESULT ROUTES
   prefix: /api/quiz/...
   ──────────────────────────────── */
router.post("/submit", auth, submitQuiz);
router.get("/my", auth, getMyQuizzes);
router.get("/:id", auth, getQuizById);

export default router;















// import express from "express";
// import protect from "../middlewares/authMiddleware.js";

// import {
//   generateQuiz,
//   getQuiz,
//   saveQuizResult,
//   getMyQuizResults
// } from "../controllers/quizController.js";

// const router = express.Router();

// // Generate questions using Gemini
// router.post("/generate", protect, generateQuiz);

// // Get generated quiz
// router.get("/:id", protect, getQuiz);

// // Save result
// router.post("/save", protect, saveQuizResult);

// // My history
// router.get("/my-results", protect, getMyQuizResults);

// export default router;



