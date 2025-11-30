import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";


const API_URL = `${import.meta.env.VITE_API_URL}`;

export default function SmartLearnQuiz() {
  const [stage, setStage] = useState("subject");

  const subjects = [
    "DSA", "OOP", "DBMS", "OS", "Computer Networks",
    "Machine Learning", "Cloud Computing", "Mathematics", "Web Development"
  ];

  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState(null);
  const [qIndex, setQIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  // FINAL FIX: Always store all 10 questions
  const [answerStore, setAnswerStore] = useState([]);

  /* ---- TIMER ---- */
  useEffect(() => {
    if (stage !== "quiz" || showAnswer) return;
    if (timer <= 0) return handleAnswer(-1);

    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, stage, showAnswer]);

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.28 }
  };

  /* ---- START QUIZ ---- */
  async function startAIQuiz(sub) {
    try {
      setSubject(sub);
      setStage("loading");

      const token = localStorage.getItem("smartlearn_token");

      const res = await fetch(`${API_URL}api/quiz/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject: sub })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to generate quiz");

      setQuestions(data.questions);
      setAnswerStore([]);
      setScore(0);
      setQIndex(0);
      setTimer(60);
      setSelectedIndex(null);
      setShowAnswer(false);
      setStage("quiz");

    } catch (err) {
      alert(err.message);
      setStage("subject");
    }
  }

  /* ---- HANDLE ANSWER ---- */
  function handleAnswer(i) {
    const current = questions[qIndex];
    const correct = current.answer;
    const selected = current.options[i] || "(No Answer)";
    const isCorrect = selected === correct;

    if (isCorrect) setScore(s => s + 1);

    const newAnswers = [
      ...answerStore,
      {
        question: current.question,
        correctAnswer: correct,
        selectedAnswer: selected,
        options: current.options
      }
    ];

    setAnswerStore(newAnswers);

    setSelectedIndex(i);
    setShowAnswer(true);

    setTimeout(() => {
      setShowAnswer(false);
      setSelectedIndex(null);

      // FIX: Use newAnswers instead of old state
      if (newAnswers.length === questions.length) {
        submitFinalResult(newAnswers);
      } else {
        setQIndex(qIndex + 1);
        setTimer(60);
      }
    }, 1500);
  }

  /* ---- SUBMIT TO BACKEND ---- */
  async function submitFinalResult(finalAnswers) {
    const token = localStorage.getItem("smartlearn_token");
    const userData = localStorage.getItem("smartlearn_user");
    const user = userData ? JSON.parse(userData) : null;

    if (!token || !user) return alert("Please login first!");

    const totalScore = finalAnswers.filter(
      q => q.selectedAnswer === q.correctAnswer
    ).length;

    const percentage = Math.round((totalScore / finalAnswers.length) * 100);

    const payload = {
      user: user.id,
      subject,
      questions: finalAnswers,
      scores: finalAnswers.map(q => q.selectedAnswer === q.correctAnswer ? 1 : 0),
      totalScore,
      percentage
    };

    try {
      const res = await fetch(`${API_URL}api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      await res.json();
    } catch (err) {
      console.error("Submit Error:", err);
    }

    setStage("done");
  }

  /* ---- EXIT ---- */
  function exitQuiz() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStage("subject");
    setSubject(null);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setAnswerStore([]);
    setSelectedIndex(null);
    setShowAnswer(false);
    setTimer(60);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900/40 border border-purple-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">SmartLearn AI Quiz</div>
            <div className="text-sm text-purple-300">AI MCQ Generator</div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* SUBJECT SELECT */}
          {stage === "subject" && (
            <motion.div {...fade} className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                <Sparkles className="w-4 h-4" /> Select a Subject
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => startAIQuiz(sub)}
                    className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition shadow-lg"
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
              <p className="mt-4 text-purple-300">Generating questions...</p>
            </motion.div>
          )}

          {/* QUIZ */}
          {stage === "quiz" && questions.length > 0 && (
            <motion.div {...fade} className="space-y-5">

              <div className="flex items-center justify-between text-purple-200 text-sm">
                <span>Subject: <strong className="text-white">{subject}</strong></span>
                <span>Q {qIndex + 1}/{questions.length}</span>
              </div>

              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500"
                     style={{ width: `${(timer / 60) * 100}%` }} />
              </div>

              <h3 className="text-lg font-bold">{questions[qIndex].question}</h3>

              <div className="space-y-3">
                {questions[qIndex].options.map((op, i) => {
                  const correct = op === questions[qIndex].answer;
                  return (
                    <button
                      key={i}
                      disabled={showAnswer}
                      onClick={() => handleAnswer(i)}
                      className={`w-full py-3 px-4 rounded-xl border transition
                        ${
                          showAnswer
                            ? i === selectedIndex
                              ? correct ? "bg-green-600 border-green-400" :
                                          "bg-red-600 border-red-400"
                              : correct ? "bg-green-600 border-green-400" :
                                          "bg-slate-900/40 border-purple-800/30"
                            : "bg-slate-900/40 border-purple-800/30 hover:bg-purple-600/20"
                        }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {stage === "done" && (
            <motion.div {...fade} className="space-y-6 text-center">

              <div className="w-40 h-40 mx-auto rounded-full border-4 border-purple-400/30 bg-white/10 flex items-center justify-center text-3xl font-bold">
                {score}/{questions.length}
              </div>

              <h2 className="text-2xl font-bold">🎉 Quiz Completed!</h2>

              <p className="text-purple-300">
                Your Score:
                <strong className="text-white"> {score} / {questions.length}</strong>
              </p>

              <button
                onClick={exitQuiz}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold"
              >
                Restart Quiz
              </button>

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

// export default function SmartLearnQuiz() {
//   const [stage, setStage] = useState("subject"); // subject | loading | quiz | done
//   const [subjects] = useState([
//     "DSA",
//     "OOP",
//     "DBMS",
//     "OS",
//     "Computer Networks",
//     "Machine Learning",
//     "Cloud Computing",
//     "Mathematics",
//     "Web Development"
//   ]);

//   const [questions, setQuestions] = useState([]);
//   const [subject, setSubject] = useState(null);
//   const [qIndex, setQIndex] = useState(0);
//   const [score, setScore] = useState(0);

//   const [timer, setTimer] = useState(60); // 1 minute timer
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(null);

//   const timerRef = useRef(null);

//   // Timer logic
//   useEffect(() => {
//     if (stage !== "quiz" || showAnswer) return;
//     if (timer <= 0) return handleAnswer(-1);

//     timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
//     return () => clearTimeout(timerRef.current);
//   }, [timer, stage, showAnswer]);

//   const fade = {
//     initial: { opacity: 0, y: 10 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -10 },
//     transition: { duration: 0.28 }
//   };

//   // START QUIZ
//   async function startAIQuiz(sub) {
//     try {
//       setSubject(sub);
//       setStage("loading");

//       const res = await fetch("http://localhost:5000/api/quiz/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subject: sub })
//       });

//       const data = await res.json();

//       if (!data.success) throw new Error("AI failed to generate questions");

//       setQuestions(data.questions);
//       setStage("quiz");
//       setQIndex(0);
//       setScore(0);
//       setTimer(60);
//       setShowAnswer(false);
//     } catch (err) {
//       alert("Error: " + err.message);
//       setStage("subject");
//     }
//   }

//   // HANDLE ANSWER CLICK
//   function handleAnswer(i) {
//     setSelectedIndex(i);

//     const isCorrect =
//       questions[qIndex].answer === questions[qIndex].options[i];

//     if (isCorrect) setScore((s) => s + 1);

//     setShowAnswer(true);

//     setTimeout(() => {
//       setShowAnswer(false);
//       setSelectedIndex(null);

//       if (qIndex + 1 < questions.length) {
//         setQIndex((n) => n + 1);
//         setTimer(60); // reset timer to 1 minute
//       } else {
//         setStage("done");
//       }
//     }, 1500);
//   }

//   // EXIT QUIZ
//   function exitQuiz() {
//     if (timerRef.current) clearInterval(timerRef.current);
//     setStage("subject");
//     setSubject(null);
//     setQuestions([]);
//     setQIndex(0);
//     setScore(0);
//     setTimer(60);
//     setShowAnswer(false);
//     setSelectedIndex(null);
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
//       <div className="w-full max-w-2xl bg-slate-900/40 border border-purple-800/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//             <BookOpen className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <div className="text-xl font-bold">SmartLearn AI Quiz</div>
//             <div className="text-sm text-purple-300">AI-Generated MCQs</div>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           {/* SUBJECT SELECT */}
//           {stage === "subject" && (
//             <motion.div key="subject" {...fade} className="space-y-6 text-center">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm mx-auto">
//                 <Sparkles className="w-4 h-4" /> Select a Subject
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {subjects.map((sub) => (
//                   <button
//                     key={sub}
//                     onClick={() => startAIQuiz(sub)}
//                     className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition shadow-lg"
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
//               <p className="mt-4 text-purple-300">
//                 Generating questions using Gemini...
//               </p>
//             </motion.div>
//           )}

//           {/* QUIZ */}
//           {stage === "quiz" && questions.length > 0 && (
//             <motion.div key="quiz" {...fade} className="space-y-5">

//               {/* TOP BAR */}
//               <div className="flex items-center justify-between text-purple-200 text-sm">
//                 <div>
//                   Subject: <strong className="text-white">{subject}</strong>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <span>
//                     Q {qIndex + 1}/{questions.length}
//                   </span>

//                   <button
//                     onClick={exitQuiz}
//                     className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded-lg text-xs transition"
//                   >
//                     Exit
//                   </button>
//                 </div>
//               </div>

//               {/* TIMER */}
//               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-purple-500 transition-all"
//                   style={{ width: `${(timer / 60) * 100}%` }}
//                 />
//               </div>
//               <div className="text-center text-purple-200 text-sm">
//                 ⏳ {timer}s Remaining
//               </div>

//               {/* QUESTION */}
//               <h3 className="text-lg font-bold">
//                 {questions[qIndex].question}
//               </h3>

//               {/* OPTIONS */}
//               <div className="space-y-3">
//                 {questions[qIndex].options.map((op, i) => {
//                   const isCorrect = op === questions[qIndex].answer;

//                   return (
//                     <button
//                       key={i}
//                       disabled={showAnswer}
//                       onClick={() => handleAnswer(i)}
//                       className={`
//                         w-full py-3 px-4 rounded-xl border transition
//                         ${
//                           showAnswer
//                             ? i === selectedIndex
//                               ? isCorrect
//                                 ? "bg-green-600 border-green-400"
//                                 : "bg-red-600 border-red-400"
//                               : isCorrect
//                               ? "bg-green-600 border-green-400"
//                               : "bg-slate-900/40 border-purple-800/30"
//                             : "bg-slate-900/40 border-purple-800/30 hover:bg-purple-600/20"
//                         }
//                       `}
//                     >
//                       {op}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* CORRECT ANSWER */}
//               {/* {showAnswer && (
//                 <div className="p-4 bg-white/10 rounded-xl border border-purple-800/30 text-purple-200">
//                   Correct Answer:{" "}
//                   <strong>{questions[qIndex].answer}</strong>
//                 </div>
//               )} */}
//             </motion.div>
//           )}

//           {/* RESULT */}
//           {stage === "done" && (
//             <motion.div key="done" {...fade} className="space-y-6 text-center">

//               <div className="mx-auto w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center text-3xl font-bold shadow-xl bg-gradient-to-br from-white/5 to-white/20">
//                 {score}/{questions.length}
//               </div>

//               <h2 className="text-2xl font-extrabold">🎉 Quiz Completed!</h2>
//               <p className="text-purple-200">
//                 Score: <strong className="text-white">{score}</strong>
//               </p>

//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   onClick={exitQuiz}
//                   className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold"
//                 >
//                   Restart
//                 </button>

//                 <button
//                   onClick={() =>
//                     alert(JSON.stringify({ subject, score }, null, 2))
//                   }
//                   className="py-3 px-6 bg-white/5 rounded-xl"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
