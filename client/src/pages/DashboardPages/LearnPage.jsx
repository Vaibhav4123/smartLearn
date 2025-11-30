


import React from "react";
import { BookMarked, Layers } from "lucide-react";

const LearnPage = () => {
  const subjects = [
    { name: "Web Development", lessons: 12, progress: 85 },
    { name: "DBMS", lessons: 10, progress: 65 },
    { name: "Operating Systems", lessons: 9, progress: 72 },
    { name: "Computer Networks", lessons: 8, progress: 59 },
    { name: "DSA", lessons: 14, progress: 92 },
    { name: "Machine Learning", lessons: 11, progress: 76 },
    { name: "OOP", lessons: 10, progress: 68 },
    { name: "Mathematics", lessons: 15, progress: 80 },
    { name: "Cloud Computing", lessons: 9, progress: 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
        SmartLearn Subjects
      </h1>
      <p className="text-center text-gray-400 mb-10">🧠 Explore all your subjects and track progress</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <div
            key={subject.name}
            className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 hover:scale-105 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                  <BookMarked className="text-white" size={26} />
                </div>
                <h3 className="text-lg font-semibold">{subject.name}</h3>
              </div>
              <Layers className="text-purple-400" size={22} />
            </div>

            <p className="text-gray-400 text-sm mb-2">Lessons: {subject.lessons}</p>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${subject.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
              <span>Progress</span>
              <span className="text-purple-300 font-medium">{subject.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center text-gray-500 text-sm mt-10">
        © 2025 SmartLearn. Learn. Improve. Succeed 🚀
      </footer>
    </div>
  );
};

export default LearnPage;