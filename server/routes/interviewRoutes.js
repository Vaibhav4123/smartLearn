
import express from "express";

import auth from "../middleware/authMiddleware.js";
import {
  generateInterviewQuestions,
  getInterviewQuestions,
  saveInterview,
  getMyInterviews,
  getInterviewById,
} from "../controllers/interviewController.js";
import { scoreInterviewAnswers } from "../controllers/scoreInterviewAnswers.js";

const router = express.Router();


/* ────────────────────────────────
   🔹 AI GENERATION ROUTES
   prefix: /api/interview/ai/...
   ──────────────────────────────── */
router.post("/geminiScoringAns",auth, scoreInterviewAnswers);
router.post("/ai/generate", auth, generateInterviewQuestions);
router.get("/ai/set/:id", auth, getInterviewQuestions);


/* ────────────────────────────────
   🔹 INTERVIEW RESULT ROUTES
   prefix: /api/interview/...
   ──────────────────────────────── */

router.post("/save", auth, saveInterview);
router.get("/my", auth, getMyInterviews);


export default router;

