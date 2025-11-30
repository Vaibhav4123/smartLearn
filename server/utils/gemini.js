
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateGeminiQA = async (subject) => {
  try {
    const prompt = `
Generate exactly 10 interview questions and answers for this subject: ${subject}.
Return ONLY this JSON:

{
  "questions": [
    { "question": "", "answer": "" }
  ]
}

No extra text. No explanation. No markdown. Only pure JSON.
`;

    const result = await model.generateContent(prompt);
    let text = result?.response?.text();

    if (!text) {
      console.error("❌ Gemini returned EMPTY response:", result);
      throw new Error("Gemini returned no text");
    }

    // Remove ```json … ``` if exists
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("❌ GEMINI RAW RESPONSE:", text);
      throw new Error("Gemini returned invalid JSON");
    }

    // Normalize output
    const final = parsed.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    }));

    return { questions: final };

  } catch (error) {
    console.error("Gemini QA Generation Error:", error);
    throw new Error("Failed to generate interview questions");
  }
};


