

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { BookMarked, Layers } from "lucide-react";

// const SmartLearnSubjects = () => {
//   const navigate = useNavigate();

//   const subjects = [
//     { name: "Web Development", lessons: 12, desc: "Master web technologies." },
//     { name: "DBMS", lessons: 10, desc: "Learn databases & SQL." },
//     { name: "Operating Systems", lessons: 9, desc: "Understand OS internals." },
//     { name: "Computer Networks", lessons: 8, desc: "Networking concepts." },
//     { name: "DSA", lessons: 14, desc: "Data structures & algorithms." },
//     { name: "Machine Learning", lessons: 11, desc: "Build ML models." },
//     { name: "OOP", lessons: 10, desc: "Object-oriented concepts." },
//     { name: "Mathematics", lessons: 15, desc: "Math for CS." },
//     { name: "Cloud Computing", lessons: 9, desc: "Modern cloud platforms." },
//   ];

//   return (
//     <div className="p-6 text-white">
//       <h1 className="text-3xl font-bold mb-4">SmartLearn Subjects</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {subjects.map((sub) => (
//           <div
//             key={sub.name}
//             onClick={() =>
//               navigate(`/SmartLearnDashboard/learn/${encodeURIComponent(sub.name)}`)
//             }
//             className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:scale-105 transition border border-slate-700"
//           >
//             <div className="flex items-center gap-3 mb-3">
//               <BookMarked className="text-purple-400" size={24} />
//               <h2 className="text-lg font-semibold">{sub.name}</h2>
//             </div>

//             <p className="text-gray-400">{sub.desc}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SmartLearnSubjects;
















import React from "react";
import { useNavigate } from "react-router-dom";
import { BookMarked, Layers } from "lucide-react";

const SmartLearnSubjects = () => {
  const navigate = useNavigate();

  const subjects = [
    { name: "Web Development", lessons: 12, desc: "Master web technologies." },
    { name: "DBMS", lessons: 10, desc: "Learn databases & SQL." },
    { name: "Operating Systems", lessons: 9, desc: "Understand OS internals." },
    { name: "Computer Networks", lessons: 8, desc: "Networking concepts." },
    { name: "DSA", lessons: 14, desc: "Data structures & algorithms." },
    { name: "Machine Learning", lessons: 11, desc: "Build ML models." },
    { name: "OOP", lessons: 10, desc: "Object-oriented concepts." },
    { name: "Mathematics", lessons: 15, desc: "Math for CS." },
    { name: "Cloud Computing", lessons: 9, desc: "Modern cloud platforms." },
  ];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">SmartLearn Subjects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.name}
            onClick={() =>
              navigate(
                `/SmartLearnDashboard/learn/${encodeURIComponent(sub.name)}`
              )
            }
            className="bg-slate-800 p-5 rounded-xl cursor-pointer hover:scale-[1.03] hover:bg-slate-700 transition transform duration-200 border border-slate-700 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookMarked className="text-purple-400" size={24} />
              <h2 className="text-lg font-semibold">{sub.name}</h2>
            </div>

            <p className="text-gray-400 mb-3">{sub.desc}</p>

            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Layers size={16} />
              <span>{sub.lessons} Lessons</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartLearnSubjects;





