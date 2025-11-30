


import React, { useState } from "react";
import { BookOpen, Sparkles, Zap, BarChart, Target,Users,Brain } from "lucide-react";
import AuthPage from './AuthPage';
// import SmartLearnAuth from "./SmartLearnAuth"; // <-- from earlier code
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Floating Lights */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-3xl rounded-full top-[-100px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 blur-3xl rounded-full bottom-[-100px] right-[-100px] animate-pulse"></div>

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md fixed w-full z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide">SmartLearn</span>
        </div>

        <button
  onClick={() => navigate("/auth")}
  className="
    px-3 py-1.5 text-xs        /* smaller padding & text for mobile */
    sm:px-5 sm:py-2 sm:text-sm /* normal size on bigger screens */
    bg-white text-purple-700 font-semibold
    rounded-lg hover:bg-gray-200 transition
  "
>
  Get Started
</button>


        {/* <button onClick={() => navigate("/auth")}
         className=" px-5 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm sm:text-base ">
           Get Started
        </button> */}




      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> AI-Powered Learning Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Master Computer Science
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            One Quiz at a Time
          </span>
        </h1>

        <p className="text-gray-300 text-base md:text-lg max-w-2xl mb-8">
          Practice, analyze, and improve with AI-driven quizzes and visual progress tracking designed to help you excel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            Start Learning
          </button>
          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-24 max-w-6xl mx-auto relative z-10"
      >
        {[
          {
            icon: Zap,
            title: "AI-Generated Quizzes",
            desc: "Unlimited practice tailored to your strengths and weaknesses.",
          },
          {
            icon: BarChart,
            title: "Progress Tracking",
            desc: "View detailed stats and weekly improvement insights.",
          },
          {
            icon: Target,
            title: "Core Subjects",
            desc: "Focus on DSA, OS, CN, DBMS, OOP, ML, and Web Development.",
          },
          {
            icon: Users,  
            title: "SmartLearn Community",
            desc: "Join a collaborative space to discuss doubts, share notes, and learn together with peers.",
          },

          {
            icon: Brain,  
            title: "AI Interviews",
            desc: "Practice real interview rounds with AI-powered questions, feedback, scoring, and analysis.",
          },

        ].map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-purple-800/30 bg-slate-900/40 hover:bg-slate-800/60 transition-transform hover:scale-105 text-center shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <f.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-purple-200/80 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 py-6 text-center text-purple-200 text-sm bg-slate-900/40 backdrop-blur-sm">
        © 2025 SmartLearn — Empowering Students to Learn Smarter.
      </footer>
    </div>
  );
};

export default LandingPage;



















