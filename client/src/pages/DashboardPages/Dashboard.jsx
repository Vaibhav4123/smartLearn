




import React, { useEffect, useState } from "react";
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import { BookOpen, BarChart2, Award, ListChecks } from "lucide-react";

export default function Dashboard() {

  /* ---------------------------------------
      SHORT NAME MAP FOR SUBJECTS
  ---------------------------------------- */
  const SUBJECT_MAP = {
    "Web Development": "WebDev",
    "Operating System": "OS",
    "Operating Systems": "OS",
    "OOP": "OOP",
    "Machine Learning": "ML",
    "Mathematics": "Maths",
    "DSA": "DSA",
    "DBMS": "DBMS",
    "Computer Networks": "CN",
    "Cloud Computing": "Cloud",
  };

  const [quizData, setQuizData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  const [selectedSection, setSelectedSection] = useState("quiz");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  /* ---------------------------------------
      FETCH QUIZ & INTERVIEW ATTEMPTS
  ---------------------------------------- */

  const API_URL = `${import.meta.env.VITE_API_URL}api`;

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("smartlearn_token");

        const quizRes = await fetch(`${API_URL}/quiz/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const quizJson = await quizRes.json();

        const intRes = await fetch(`${API_URL}/interview/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const intJson = await intRes.json();

        if (Array.isArray(quizJson)) setQuizData(quizJson);
        if (Array.isArray(intJson)) setInterviewData(intJson);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    }

    loadData();
  }, []);

  /* ---------------------------------------
      WHICH SECTION IS ACTIVE
  ---------------------------------------- */
  const activeData = selectedSection === "quiz" ? quizData : interviewData;

  /* ---------------------------------------
      GROUP ATTEMPTS BY SUBJECT
  ---------------------------------------- */
  const grouped = activeData.reduce((acc, item) => {
    if (!acc[item.subject]) acc[item.subject] = [];
    acc[item.subject].push(item);
    return acc;
  }, {});

  const subjectList = Object.entries(grouped).map(([subject, attempts]) => ({
    subject,                                         // Full name
    subjectShort: SUBJECT_MAP[subject] || subject,   // Short name
    attempts
  }));

  /* ---------------------------------------
      PREPARE CHART DATA WITH SHORT NAMES
  ---------------------------------------- */
  const chartData = subjectList.map((s) => {
    const avg =
      s.attempts.reduce((a, b) => a + b.percentage, 0) / s.attempts.length;

    return {
      subject: s.subjectShort,   // SHORT name for graph
      score: Number(avg.toFixed(1)),
    };
  });

  const overallAvg =
    chartData.length > 0
      ? (chartData.reduce((a, b) => a + b.score, 0) / chartData.length).toFixed(1)
      : 0;

  const bestSubject =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.score > b.score ? a : b)).subject
      : "--";

  const bestScore =
    chartData.length > 0 ? Math.max(...chartData.map((c) => c.score)) : 0;

  /* ---------------------------------------
      UI START
  ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">

      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        SmartLearn Analytics Dashboard
      </h1>

      <p className="text-center text-gray-400 mb-8">
        📊 AI Quiz & Interview Performance Overview
      </p>

      {/* SWITCH QUIZ / INTERVIEW */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-xl ${selectedSection === "quiz" ? "bg-purple-600" : "bg-slate-700"}`}
          onClick={() => {
            setSelectedSection("quiz");
            setSelectedSubject(null);
            setSelectedAttempt(null);
          }}
        >
          Quiz Results
        </button>

        <button
          className={`px-6 py-2 rounded-xl ${selectedSection === "interview" ? "bg-purple-600" : "bg-slate-700"}`}
          onClick={() => {
            setSelectedSection("interview");
            setSelectedSubject(null);
            setSelectedAttempt(null);
          }}
        >
          Interview Results
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg">
          <BookOpen size={36} className="mx-auto text-purple-400" />
          <h3 className="text-lg font-semibold mt-2">Average Score</h3>
          <p className="text-3xl font-bold text-purple-300 mt-2">{overallAvg}%</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg">
          <BarChart2 size={36} className="mx-auto text-blue-400" />
          <h3 className="text-lg font-semibold mt-2">Top Subject</h3>
          <p className="text-2xl font-bold text-blue-300 mt-2">{bestSubject}</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg">
          <Award size={36} className="mx-auto text-green-400" />
          <h3 className="text-lg font-semibold mt-2">Best Score</h3>
          <p className="text-3xl font-bold text-green-300 mt-2">{bestScore}%</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LINE CHART */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Performance Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="subject" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">
            Subject-wise Average
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="subject" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip />
              <Bar dataKey="score" fill="#7e22ce" barSize={40} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ATTEMPTS SECTION */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg mt-10">

        <h2 className="text-2xl font-semibold mb-4 text-purple-300 flex items-center gap-2">
          <ListChecks className="text-purple-400" />
          {selectedSection === "quiz" ? "Quiz Attempts" : "Interview Attempts"}
        </h2>

        {/* SUBJECT LIST */}
        {!selectedSubject && (
          <div className="space-y-4">
            {subjectList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSubject(item)}
                className="p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-purple-500 cursor-pointer"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-lg font-semibold text-purple-300">
                      {item.subject}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Attempts: {item.attempts.length}
                    </p>
                  </div>

                  <p className="text-3xl font-bold text-green-400">
                    {Math.max(...item.attempts.map(a => a.percentage))}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST OF ATTEMPTS */}
        {selectedSubject && !selectedAttempt && (
          <div className="p-4 bg-slate-900 rounded-xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                {selectedSubject.subject} – Attempts
              </h3>
              <button
                className="px-4 py-2 bg-slate-700 rounded"
                onClick={() => setSelectedSubject(null)}
              >
                ⬅ Back
              </button>
            </div>

            {selectedSubject.attempts.map((att, i) => (
              <div
                key={i}
                onClick={() => setSelectedAttempt(att)}
                className="cursor-pointer p-4 my-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-purple-400"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-lg font-semibold text-purple-300">
                      Attempt #{i + 1}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(att.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-green-400">
                    {att.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ATTEMPT BREAKDOWN */}
        {selectedAttempt && (
          <div className="p-4 bg-slate-900 rounded-xl">

            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                Attempt Breakdown
              </h3>

              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                ⬅ Back
              </button>
            </div>

            <p className="text-gray-300">
              Score:
              <span className="text-green-400 font-bold text-2xl">
                {selectedAttempt.percentage}%
              </span>
            </p>

            <div className="mt-6 space-y-4">
              {selectedAttempt.questions.map((q, index) => {
                const isCorrect =
                  selectedSection === "quiz"
                    ? q.selectedAnswer === q.correctAnswer
                    : q.userAnswer === q.correctAnswer;

                return (
                  <div
                    key={index}
                    className="p-4 bg-slate-800 rounded-xl border border-slate-700"
                  >
                    <p className="text-purple-300 font-semibold">
                      Q{index + 1}. {q.question}
                    </p>

                    <p className="mt-2 text-yellow-300">
                      <strong>Your Answer:</strong>{" "}
                      {selectedSection === "quiz" ? q.selectedAnswer : q.userAnswer}
                    </p>

                    <p className="mt-1 text-green-300">
                      <strong>Correct Answer:</strong> {q.correctAnswer}
                    </p>

                    <p
                      className={`mt-2 font-bold ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "✔ Correct" : "✘ Wrong"}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      <p className="text-center text-gray-500 mt-8">
        © 2025 SmartLearn • AI Learning Analytics 🚀
      </p>
    </div>
  );
}
