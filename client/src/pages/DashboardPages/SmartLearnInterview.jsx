import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}`;

export default function SmartLearnInterviewUI() {
  const [stage, setStage] = useState("subject");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [breakdown, setBreakdown] = useState([]);  
  const [scores, setScores] = useState([]);        

  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  const SUBJECTS = [
    "DSA","DBMS","OS","OOP","Cloud Computing",
    "Computer Networks","Machine Learning","Mathematics","Web Development"
  ];

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (stage !== "interview") return;

    if (timer <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [stage, timer]);

  /* ---------------- START INTERVIEW ---------------- */
  async function startInterview(sub) {
    setSubject(sub);
    setStage("loading");

    try {
      const token = localStorage.getItem("smartlearn_token");

      const res = await fetch(`${API_URL}api/interview/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject: sub })
      });

      const data = await res.json();
      if (!data.success) throw new Error("Failed to load interview questions");

      setQuestions(data.questions);
      setQIndex(0);
      setAnswer("");
      setBreakdown([]);
      setScores([]);
      setTimer(60);
      setStage("interview");

    } catch (err) {
      alert("Error: " + err.message);
      setStage("subject");
    }
  }

  /* ---------------- SEND TO GEMINI SCORING ---------------- */


  async function scoreWithGemini() {
  try {
    const token = localStorage.getItem("smartlearn_token");  // <-- FIXED

    const res = await fetch(`${API_URL}api/interview/geminiScoringAns`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        questions: breakdown.map(q => ({
          question: q.question,
          userAnswer: q.userAnswer
        }))
      })
    });

    const data = await res.json();
    if (!data.success) return breakdown.map(() => 0);

    return data.scores;

  } catch (err) {
    console.error("Scoring Error:", err);
    return breakdown.map(() => 0);
  }
  }


  /* ---------------- SAVE RESULT TO BACKEND ---------------- */
  async function saveInterviewResult() {
    const token = localStorage.getItem("smartlearn_token");
    const userData = localStorage.getItem("smartlearn_user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user?.id;

    if (!token || !userId) return alert("Please login first!");

    const aiScores = await scoreWithGemini();
    setScores(aiScores);

    const formattedQuestions = breakdown.map(item => ({
      question: item.question,
      userAnswer: item.userAnswer
    }));

    const totalScore = aiScores.reduce((a, b) => a + b, 0);     // 0–100
    const percentage = Math.round((totalScore / 100) * 100);    // 0–100%

    const payload = {
      user: userId,
      subject,
      questions: formattedQuestions,
      scores: aiScores,
      totalScore,
      percentage
    };

    try {
      await fetch(`${API_URL}api/interview/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Saving Error:", err);
    }
  }

  /* ---------------- SUBMIT ANSWER ---------------- */
  function handleSubmit() {
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentQ = questions[qIndex];
    const userAns = answer.trim() || "(No Answer)";

    setBreakdown(prev => [
      ...prev,
      { question: currentQ.question, userAnswer: userAns ,correctAnswer: currentQ.answer }
    ]);

    if (breakdown.length + 1 >= 10) {
      saveInterviewResult();
      setStage("done");
    } else {
      setQIndex(i => i + 1);
      setAnswer("");
      setTimer(60);
    }
  }

  /* ---------------- SKIP QUESTION ---------------- */
  function skipQuestion() {
    const currentQ = questions[qIndex];

    setBreakdown(prev => [
      ...prev,
      { question: currentQ.question, userAnswer: "(Skipped)" }
    ]);

    if (breakdown.length + 1 >= 10) {
      saveInterviewResult();
      setStage("done");
    } else {
      setQIndex(i => i + 1);
      setAnswer("");
      setTimer(60);
    }
  }

  /* ---------------- EXIT INTERVIEW ---------------- */
  function exitInterview() {
    setStage("subject");
    setSubject("");
    setQuestions([]);
    setBreakdown([]);
    setScores([]);
    setAnswer("");
    setTimer(60);
    setQIndex(0);
  }

  const totalScore = scores.reduce((a, b) => a + b, 0);  
  const percentage = Math.round((totalScore / 100) * 100);

  /* ---------------- UI BELOW ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 text-white flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900/40 border border-purple-800/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">SmartLearn AI Interview</div>
            <div className="text-sm text-purple-300">Answer • Improve • Score</div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* SUBJECT SELECT */}
          {stage === "subject" && (
            <motion.div {...fade} className="space-y-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                <Sparkles className="w-4 h-4 mr-2" /> Select a Subject
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUBJECTS.map(sub => (
                  <button
                    key={sub}
                    onClick={() => startInterview(sub)}
                    className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* LOADING */}
          {stage === "loading" && (
            <motion.div {...fade} className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-300" />
              <p className="mt-4 text-purple-300">Generating interview questions…</p>
            </motion.div>
          )}

          {/* INTERVIEW */}
          {stage === "interview" && questions.length > 0 && (
            <motion.div {...fade} className="space-y-6">

              <div className="flex items-center justify-between text-purple-300 text-sm">
                <span>Subject: <strong>{subject}</strong></span>
                <span>Q {qIndex + 1}/10</span>
              </div>

              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${(timer / 60) * 100}%` }}
                />
              </div>

              <div className="text-center text-purple-200 text-sm">⏳ {timer}s remaining</div>

              <h3 className="text-lg font-bold">{questions[qIndex].question}</h3>

              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 bg-slate-900/50 border border-purple-800/30 rounded-xl"
              />

              <div className="flex gap-3">
                <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold">Submit</button>
                <button onClick={skipQuestion} className="py-3 px-4 bg-white/10 rounded-xl">Skip</button>
                <button onClick={exitInterview} className="py-3 px-4 bg-white/10 rounded-xl">Exit</button>
              </div>
            </motion.div>
          )}

          {/* DONE SCREEN */}
          {stage === "done" && (
            <motion.div {...fade} className="space-y-6 text-center">

              <div className="w-40 h-40 mx-auto rounded-full bg-white/10 border-4 border-purple-500/30 flex items-center justify-center text-3xl font-bold">
                {totalScore}/100
              </div>

              <h2 className="text-2xl font-bold">🎉 Interview Completed!</h2>
              <p className="text-purple-300">
                AI Score: <strong className="text-white">{percentage}%</strong>
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStage("breakdown")} className="py-3 bg-white/10 rounded-xl">View Breakdown</button>
                <button onClick={exitInterview} className="py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold">Restart</button>
              </div>

            </motion.div>
          )}

          {/* BREAKDOWN PAGE */}
          {/* {stage === "breakdown" && (
            <motion.div {...fade} className="space-y-6">

              <h2 className="text-2xl font-bold text-center">📘 Breakdown Report</h2>

              <div className="space-y-4 max-h-[450px] overflow-y-auto">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/10 border border-purple-800/30 rounded-xl">

                    <div className="text-sm text-purple-300">Question {idx + 1}</div>
                    <p className="text-white font-semibold">{item.question}</p>

                    <p className="text-purple-300 mt-2">
                      <strong className="text-white">Your Answer:</strong> {item.userAnswer}
                    </p>

                    <p className="text-green-300 mt-1">
                     <strong className="text-white">Correct Answer:</strong> {item.correctAnswer}
                    </p>

                    <p className="text-yellow-300 mt-2">
                      <strong className="text-white">Score:</strong> {scores[idx] || 0}/10
                    </p>

                  </div>
                ))}
              </div>

              <div className="text-center text-xl font-bold text-white">
                Total Score: {totalScore}/100
              </div>

              <button onClick={() => setStage("subject")} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold">
                Restart
              </button>

            </motion.div>
          )} */}

          {stage === "breakdown" && (
  <motion.div {...fade} className="space-y-6">

    <h2 className="text-2xl font-bold text-center">📘 Breakdown Report</h2>

    <div className="space-y-4 max-h-[450px] overflow-y-auto">
      {breakdown.map((item, idx) => (
        <div key={idx} className="p-4 bg-white/10 border border-purple-800/30 rounded-xl">

          <div className="text-sm text-purple-300">Question {idx + 1}</div>
          <p className="text-white font-semibold">{item.question}</p>

          <p className="text-purple-300 mt-2">
            <strong className="text-white">Your Answer:</strong> {item.userAnswer}
          </p>

          <p className="text-green-300 mt-1">
            <strong className="text-white">Correct Answer:</strong> {item.correctAnswer}
          </p>

          <p className="text-yellow-300 mt-2">
            <strong className="text-white">Score:</strong> {scores[idx] || 0}/10
          </p>

        </div>
      ))}
    </div>

    <div className="text-center text-xl font-bold text-white">
      Total Score: {totalScore}/100
    </div>

    {/* TWO BUTTONS BELOW — BACK TO RESULT + RESTART */}
    <div className="grid grid-cols-2 gap-4">

      <button
        onClick={() => setStage("done")}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold"
      >
        Back to Result
      </button>

      <button
        onClick={() => setStage("subject")}
        className="w-full py-3 bg-white/10 rounded-xl font-semibold"
      >
        Restart
      </button>

    </div>

  </motion.div>
)}



        </AnimatePresence>

      </div>
    </div>
  );
}


















// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { BookOpen, Sparkles, Loader2 } from "lucide-react";

// export default function SmartLearnInterviewUI() {
//   const [stage, setStage] = useState("subject"); 
//   const [subject, setSubject] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [qIndex, setQIndex] = useState(0);
//   const [answer, setAnswer] = useState("");

//   const [scores, setScores] = useState([]);
//   const [breakdown, setBreakdown] = useState([]);

//   const [timer, setTimer] = useState(60);
//   const timerRef = useRef(null);

//   const SUBJECTS = [
//     "DSA",
//     "DBMS",
//     "OS",
//     "OOP",
//     "Cloud Computing",
//     "Computer Networks",
//     "Machine Learning",
//     "Mathematics",
//     "Web Development"
//   ];

//   const fade = {
//     initial: { opacity: 0, y: 10 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -10 },
//     transition: { duration: 0.3 }
//   };

//   /* ---------------- TIMER ---------------- */
//   useEffect(() => {
//     if (stage !== "interview") return;

//     if (timer <= 0) {
//       handleSubmit();
//       return;
//     }

//     timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
//     return () => clearTimeout(timerRef.current);
//   }, [stage, timer]);

//   /* ---------------- FETCH QUESTIONS ---------------- */
//   async function startInterview(sub) {
//     setSubject(sub);
//     setStage("loading");

//     try {
//       const res = await fetch("http://localhost:5000/api/interview/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subject: sub })
//       });

//       const data = await res.json();

//       if (!data.success) throw new Error("Failed to load interview questions");

//       setQuestions(data.questions);
//       setStage("interview");
//       setQIndex(0);
//       setAnswer("");
//       setScores([]);
//       setBreakdown([]);
//       setTimer(60);
//     } catch (err) {
//       alert("Error: " + err.message);
//       setStage("subject");
//     }
//   }

//   /* ---------------- SUBMIT ANSWER ---------------- */
//   function handleSubmit() {
//     if (timerRef.current) clearTimeout(timerRef.current);

//     const currentQ = questions[qIndex];
//     const correct = currentQ.answer;
//     const userAns = answer.trim() || "(No Answer)";

//     const randomScore = Math.floor(Math.random() * 5) + 6; // 6–10

//     setBreakdown(prev => [
//       ...prev,
//       {
//         question: currentQ.question,
//         userAnswer: userAns,
//         correctAnswer: correct,
//         score: randomScore
//       }
//     ]);

//     const updatedScores = [...scores, randomScore];
//     setScores(updatedScores);

//     if (updatedScores.length >= 10) {
//       setStage("done");
//     } else {
//       setQIndex(i => i + 1);
//       setAnswer("");
//       setTimer(60);
//     }
//   }

//   /* ---------------- SKIP ---------------- */
//   function skipQuestion() {
//     const currentQ = questions[qIndex];

//     setBreakdown(prev => [
//       ...prev,
//       {
//         question: currentQ.question,
//         userAnswer: "(Skipped)",
//         correctAnswer: currentQ.answer,
//         score: 0
//       }
//     ]);

//     const updatedScores = [...scores, 0];
//     setScores(updatedScores);

//     if (updatedScores.length >= 10) {
//       setStage("done");
//     } else {
//       setQIndex(i => i + 1);
//       setAnswer("");
//       setTimer(60);
//     }
//   }

//   /* ---------------- EXIT ---------------- */
//   function exitInterview() {
//     setStage("subject");
//     setQuestions([]);
//     setScores([]);
//     setBreakdown([]);
//     setSubject("");
//     setAnswer("");
//     setTimer(60);
//     setQIndex(0);
//   }

//   const totalScore = scores.reduce((a, b) => a + b, 0);
//   const percentage = Math.round((totalScore / 100) * 100);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 text-white flex items-center justify-center">
//       <div className="w-full max-w-2xl bg-slate-900/40 border border-purple-800/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

//         {/* HEADER */}
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//             <BookOpen className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <div className="text-xl font-bold">SmartLearn AI Interview</div>
//             <div className="text-sm text-purple-300">Answer • Improve • Score</div>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">

//           {/* SUBJECT SELECT */}
//           {stage === "subject" && (
//             <motion.div key="subject" {...fade} className="space-y-6 text-center">
//               <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm">
//                 <Sparkles className="w-4 h-4 mr-2" /> Select a Subject
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {SUBJECTS.map(sub => (
//                   <button
//                     key={sub}
//                     onClick={() => startInterview(sub)}
//                     className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg font-semibold hover:scale-105 transition"
//                   >
//                     {sub}
//                   </button>
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* LOADING */}
//           {stage === "loading" && (
//             <motion.div key="loading" {...fade} className="text-center py-16">
//               <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-300" />
//               <p className="mt-4 text-purple-300">Generating interview questions…</p>
//             </motion.div>
//           )}

//           {/* INTERVIEW */}
//           {stage === "interview" && questions.length > 0 && (
//             <motion.div key="interview" {...fade} className="space-y-6">

//               <div className="flex items-center justify-between text-purple-300 text-sm">
//                 <div>Subject: <strong>{subject}</strong></div>
//                 <div>Q {qIndex + 1}/10</div>
//               </div>

//               {/* TIMER BAR */}
//               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-purple-500 transition-all"
//                   style={{ width: `${(timer / 60) * 100}%` }}
//                 />
//               </div>
//               <div className="text-center text-purple-200 text-sm">⏳ {timer}s remaining</div>

//               {/* QUESTION */}
//               <h3 className="text-lg font-bold">{questions[qIndex].question}</h3>

//               <textarea
//                 rows={5}
//                 value={answer}
//                 onChange={(e) => setAnswer(e.target.value)}
//                 className="w-full p-4 bg-slate-900/50 border border-purple-800/30 rounded-xl"
//               />

//               {/* BUTTONS */}
//               <div className="flex gap-3">
//                 <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold">Submit</button>
//                 <button onClick={skipQuestion} className="py-3 px-4 bg-white/10 rounded-xl">Skip</button>
//                 <button onClick={exitInterview} className="py-3 px-4 bg-white/10 rounded-xl">Exit</button>
//               </div>
//             </motion.div>
//           )}

//           {/* DONE SCREEN */}
//           {stage === "done" && (
//             <motion.div key="done" {...fade} className="space-y-6 text-center">

//               <div className="w-40 h-40 mx-auto rounded-full bg-white/10 border-4 border-purple-500/30 flex items-center justify-center text-3xl font-bold">
//                 {totalScore}/100
//               </div>

//               <h2 className="text-2xl font-bold">🎉 Interview Completed!</h2>
//               <p className="text-purple-300">Your Score: <strong className="text-white">{percentage}%</strong></p>

//               <div className="grid grid-cols-2 gap-4">
//                 <button onClick={() => setStage("breakdown")} className="py-3 bg-white/10 rounded-xl">
//                   View Breakdown
//                 </button>
//                 <button onClick={exitInterview} className="py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold">
//                   Restart
//                 </button>
//               </div>
//             </motion.div>
//           )}

//           {/* BREAKDOWN PAGE */}
//           {stage === "breakdown" && (
//             <motion.div key="breakdown" {...fade} className="space-y-6">

//               <h2 className="text-2xl font-bold text-center mb-3">📘 Breakdown Report</h2>

//               <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
//                 {breakdown.map((item, idx) => (
//                   <div key={idx} className="p-4 bg-white/10 border border-purple-800/30 rounded-xl">
//                     <div className="text-sm text-purple-300 mb-1">Question {idx + 1}</div>

//                     <p className="text-white font-semibold">{item.question}</p>

//                     <p className="text-purple-300 mt-2">
//                       <strong className="text-white">Your Answer:</strong> {item.userAnswer}
//                     </p>

//                     <p className="text-green-300 mt-1">
//                       <strong className="text-white">Correct Answer:</strong> {item.correctAnswer}
//                     </p>

//                     <p className="text-yellow-300 mt-2">
//                       <strong className="text-white">Score:</strong> {item.score}/10
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               <div className="text-center text-lg font-bold text-white">
//                 Total Score: {totalScore}/100
//               </div>

//               <button
//                 onClick={() => setStage("done")}
//                 className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold"
//               >
//                 Back to Result
//               </button>

//             </motion.div>
//           )}

//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
