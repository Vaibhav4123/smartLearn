

// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ArrowLeft, CheckCircle, Circle } from "lucide-react";
// import ChapterPage from "./ChapterPage";
// import lessonsData from "../../../data/subjectsLessons.json";

// const SubjectPage = () => {
//   const { subjectname } = useParams();
//   const navigate = useNavigate();
//   const decoded = decodeURIComponent(subjectname);


//   const lessons = lessonsData[decoded] || [];

//   const [completed, setCompleted] = useState([]);

//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem("smartlearn_progress")) || {};
//     if (saved[decoded]) setCompleted(saved[decoded]);
//   }, [decoded]);

//   const toggleLesson = (lesson) => {
//     let updated;
//     if (completed.includes(lesson))
//       updated = completed.filter((l) => l !== lesson);
//     else updated = [...completed, lesson];

//     setCompleted(updated);
//     const store = JSON.parse(localStorage.getItem("smartlearn_progress")) || {};
//     store[decoded] = updated;
//     localStorage.setItem("smartlearn_progress", JSON.stringify(store));
//   };

//   return (
//     <div className="p-6 text-white">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 text-gray-300 mb-4 hover:text-purple-400"
//       >
//         <ArrowLeft /> Back
//       </button>

//       <h1 className="text-3xl font-bold mb-4">{decoded}</h1>

//       <div className="space-y-4">
//         {lessons.map((lesson, index) => (
//           <div
//             key={index}
//             onClick={() =>
//               navigate(
//                 `/SmartLearnDashboard/learn/${encodeURIComponent(
//                   decoded
//                 )}/lesson/${encodeURIComponent(lesson)}`
//               )
//             }
//             className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between cursor-pointer hover:bg-slate-700/60"
//           >
//             <div>
//               <h2 className="text-lg font-semibold">
//                 Lesson {index + 1}: {lesson}
//               </h2>
//               <p className="text-gray-400 text-sm mt-1">
//                 Tap to view detailed chapter content
//               </p>
//             </div>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggleLesson(lesson);
//               }}
//             >
//               {completed.includes(lesson) ? (
//                 <CheckCircle className="text-green-400" size={28} />
//               ) : (
//                 <Circle className="text-purple-400" size={28} />
//               )}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SubjectPage;

































import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle } from "lucide-react";
import lessonsData from "../../../data/subjectsLessons.json";

const SubjectPage = () => {
  const { subjectname } = useParams();
  const navigate = useNavigate();

  const subject = decodeURIComponent(subjectname);

  // Lessons for each subject from subjectsLessons.json
  const lessons = lessonsData[subject] || [];

  // Lesson completion state
  const [completed, setCompleted] = useState([]);

  // Load saved progress
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("smartlearn_progress")) || {};
    if (saved[subject]) setCompleted(saved[subject]);
  }, [subject]);

  // Toggle completion state
  const toggleLesson = (lesson) => {
    let updated;

    if (completed.includes(lesson)) {
      updated = completed.filter((l) => l !== lesson);
    } else {
      updated = [...completed, lesson];
    }

    setCompleted(updated);

    const store = JSON.parse(localStorage.getItem("smartlearn_progress")) || {};
    store[subject] = updated;
    localStorage.setItem("smartlearn_progress", JSON.stringify(store));
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-300 mb-6 hover:text-purple-400 transition"
      >
        <ArrowLeft /> Back
      </button>

      {/* Subject Title */}
      <h1 className="text-3xl font-bold mb-2 text-purple-400">{subject}</h1>
      <p className="text-gray-400 mb-6">Tap on any lesson to view full content</p>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(
                `/SmartLearnDashboard/learn/${encodeURIComponent(
                  subject
                )}/lesson/${encodeURIComponent(lesson)}`
                )
            }
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-700/60 transition transform hover:scale-[1.01]"
          >
            {/* Lesson Name */}
            <div>
              <h2 className="text-lg font-semibold">
                Lesson {index + 1}: {lesson}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Tap to view detailed chapter content
              </p>
            </div>

            {/* Completion Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLesson(lesson);
              }}
              className="p-1"
            >
              {completed.includes(lesson) ? (
                <CheckCircle className="text-green-400" size={30} />
              ) : (
                <Circle className="text-purple-400" size={30} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;
