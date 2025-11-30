import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const scoreInterviewAnswers = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.json({ success: false, msg: "Invalid question format", scores: [] });
    }

    const prompt = `
You are an expert technical interviewer.
Score each answer from 0 to 10.

Return ONLY:

{
  "scores": [0, 5, 10, ...]
}

No explanation.

Questions:
${JSON.stringify(questions, null, 2)}
`;

    const geminiRes = await model.generateContent(prompt);
    let text = geminiRes.response.text();
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Error:", text);
      return res.json({ success: false, scores: [] });
    }

    return res.json({ success: true, scores: parsed.scores });

  } catch (err) {
    console.error("Gemini Scoring Error:", err);
    res.json({ success: false, scores: [] });
  }
};
