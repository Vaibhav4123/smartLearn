// import React from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";
// import chapterContent from "../../../data/chapterContent.json";
// import ReactMarkdown from "react-markdown";
// import webdev from "../../../data/webdev.json";
// import os from "../../../data/os.json";
// import oop from "../../../data/oop.json";
// import ml from "../../../data/ml.json";
// import maths from "../../../data/maths.json";
// import dsa from "../../../data/dsa.json";
// import dbms from "../../../data/dbms.json";
// import cn from "../../../data/cn.json";
// import cloud from "../../../data/cloud.json";

// const ChapterPage = () => {
//   const { subjectname, lessonname } = useParams();
//   const navigate = useNavigate();

//   const subject = decodeURIComponent(subjectname);
//   const lesson = decodeURIComponent(lessonname);


//   const content = chapterContent[lesson] || "Chapter content coming soon...";

//   return (
//     <div className="p-6 text-white">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 text-gray-300 mb-4 hover:text-purple-400"
//       >
//         <ArrowLeft /> Back
//       </button>

//       <h1 className="text-3xl font-bold text-purple-400">{lesson}</h1>
//       <p className="text-gray-400 mb-6">📘 {subject}</p>

//       <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 leading-relaxed">
//         {chapterContent[lesson] || "Chapter content coming soon..."}
//       </div>
//     </div>
//   );
// };

// export default ChapterPage;



















import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Import ALL subject JSONs
import webdev from "../../../data/webdev.json";
import os from "../../../data/os.json";
import oop from "../../../data/oop.json";
import ml from "../../../data/ml.json";
import maths from "../../../data/maths.json";
import dsa from "../../../data/dsa.json";
import dbms from "../../../data/dbms.json";
import cn from "../../../data/cn.json";
import cloud from "../../../data/cloud.json";

const SUBJECT_MAP = {
  "Web Development": webdev,
  "Operating System": os,
  "OOP": oop,
  "Machine Learning": ml,
  "Mathematics": maths,
  "DSA": dsa,
  "DBMS": dbms,
  "Computer Networks": cn,
  "Cloud Computing": cloud,
};

const ChapterPage = () => {
  const { subjectname, lessonname } = useParams();
  const navigate = useNavigate();

  const subject = decodeURIComponent(subjectname);
  const lesson = decodeURIComponent(lessonname);

  const subjectData = SUBJECT_MAP[subject];
  const chapter = subjectData?.[lesson];

  return (
    <div className="p-6 text-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-300 mb-4 hover:text-purple-400 transition"
      >
        <ArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold text-purple-400">{lesson}</h1>
      <p className="text-gray-400 mb-6">📘 {subject}</p>

      {!chapter ? (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 text-gray-400">
          Chapter content coming soon...
        </div>
      ) : (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 leading-relaxed space-y-6">
          
          {/* Description */}
          <p className="text-lg text-gray-300">{chapter.description}</p>

          {/* Sections */}
          {Object.entries(chapter.sections).map(([sectionTitle, sectionData], idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h2 className="text-xl font-semibold text-purple-300 mb-2">{sectionTitle}</h2>

              {/* details[] */}
              {sectionData.details && (
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  {sectionData.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}

              {/* Code Block */}
              {sectionData.code && (
                <pre className="bg-black/40 text-purple-200 p-3 rounded-lg mt-3 overflow-x-auto text-sm">
{sectionData.code}
                </pre>
              )}

              {/* Units, tables, extra fields */}
              {sectionData.units && (
                <div className="mt-3">
                  {Object.entries(sectionData.units).map(([u, v], i) => (
                    <p key={i} className="text-gray-300">
                      <span className="text-purple-300 font-semibold">{u}: </span>{v}
                    </p>
                  ))}
                </div>
              )}

              {sectionData.example && (
                <pre className="bg-black/40 text-green-200 p-3 rounded-lg mt-3 overflow-x-auto text-sm">
{sectionData.example}
                </pre>
              )}

              {sectionData.examples && (
                <ul className="list-disc pl-5 text-gray-300 mt-3 space-y-1">
                  {sectionData.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              )}

              {sectionData.methods && (
                <ul className="list-disc pl-5 text-gray-300 mt-3 space-y-1">
                  {sectionData.methods.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Summary */}
          {chapter.sections.summary && (
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h2 className="text-xl font-bold text-green-300">Summary</h2>
              <p className="text-gray-300 mt-2">{chapter.sections.summary}</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ChapterPage;
