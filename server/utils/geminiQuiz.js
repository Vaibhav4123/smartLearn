import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateGeminiQuiz = async (subject) => {
  try {
    const prompt = `
Generate exactly 10 MCQ questions for this subject: ${subject}.
Return ONLY this JSON format:

{
  "questions": [
    {
      "q": "",
      "options": ["A","B","C","D"],
      "ans": 0
    }
  ]
}

No explanation. No extra text. Only JSON.
`;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Remove ```json ... ``` wrappers if any
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("❌ Gemini JSON Parse Error:", text);
      throw new Error("Gemini returned invalid JSON");
    }

    // Normalize output to your quiz model
    const formatted = parsed.questions.map((q) => ({
      question: q.q,
      options: q.options,
      answer: q.options[q.ans], // convert index → actual answer
    }));

    return { questions: formatted };

  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz");
  }
};
