import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  Brain,
  Layers,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./DashboardPages/Dashboard";
import AIAssistantPage from "./DashboardPages/AIAssistantPage";
import QuizPage from "./DashboardPages/QuizPage";
import ProfilePage from "./DashboardPages/ProfilePage";
import SmartLearnSubjects from "./DashboardPages/Subjects/SmartLearnSubjects";
import SubjectPage from "./DashboardPages/Subjects/SubjectPage";
import SmartLearnInterview from "./DashboardPages/SmartLearnInterview";
import SmartLearnCommunity from "./DashboardPages/SmartLearnCommunity";

import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ChapterPage from "./DashboardPages/Subjects/ChapterPage";

const sidebarOptions = [
  { name: "Dashboard", path: "/SmartLearnDashboard/dashboard", icon: <TrendingUp className="w-5 h-5" /> },
  { name: "Learn", path: "/SmartLearnDashboard/learn", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Quiz", path: "/SmartLearnDashboard/quiz", icon: <Layers className="w-5 h-5" /> },
  // { name: "AI Assistant", path: "/SmartLearnDashboard/ai", icon: <Brain className="w-5 h-5" /> },
  { name: "AI Interview", path: "/SmartLearnDashboard/aiInterview", icon: <Brain className="w-5 h-5" /> },
  { name: "Community", path: "/SmartLearnDashboard/SmartLearnCommunity", icon: <Users className="w-5 h-5" /> },
];

export default function SmartLearnDashboard() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">

      {/* ============== SIDEBAR (Desktop) ============== */}
      <aside className="hidden lg:flex flex-col justify-between h-screen w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-5 fixed left-0 top-0 z-40">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-10">
            <BookOpen className="w-6 h-6 text-purple-400" /> SmartLearn
          </h1>

          <nav className="space-y-3">
            {sidebarOptions.map((opt) => (
              <motion.button
                key={opt.path}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(opt.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  location.pathname === opt.path
                    ? "bg-purple-600/30 border border-purple-400"
                    : "bg-white/10 hover:bg-white/20 border border-white/10"
                }`}
              >
                {opt.icon}
                <span>{opt.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Profile + Logout */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <button
            onClick={() => navigate("/SmartLearnDashboard/profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === "/SmartLearnDashboard/profile"
                ? "bg-purple-600/30 border border-purple-400"
                : "bg-white/10 hover:bg-white/20 border border-white/10"
            }`}
          >
            <User className="w-5 h-5 text-purple-300" />
            <span>Profile</span>
          </button>
                    {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-400 border border-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ============== SIDEBAR (Mobile) ============== */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20 flex flex-col justify-between p-5 z-50 lg:hidden"
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" /> SmartLearn
            </h1>

            <button onClick={() => setSidebarOpen(false)}>
              <X className="text-white" />
            </button>
          </div>

          <nav className="space-y-3">
            {sidebarOptions.map((opt) => (
              <motion.button
                key={opt.path}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  navigate(opt.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === opt.path
                    ? "bg-purple-600/30 border border-purple-400"
                    : "bg-white/10 hover:bg-white/20 border border-white/10"
                }`}
              >
                {opt.icon}
                <span>{opt.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Logout Mobile */}
        <div className="border-t border-white/10 pt-4 space-y-3">

          <button
            onClick={() => {
              navigate("/SmartLearnDashboard/profile");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === "/SmartLearnDashboard/profile"
                ? "bg-purple-600/30 border border-purple-400"
                : "bg-white/10 hover:bg-white/20 border border-white/10"
            }`}
          >
            <User className="w-5 h-5 text-purple-300" />
            <span>Profile</span>
          </button>

          {/* MOBILE LOGOUT BUTTON */}
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-400 border border-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============== MAIN CONTENT ============== */}
      <div className="flex-1 flex flex-col p-8 lg:ml-64">
        <button
          className="lg:hidden fixed top-5 left-5 px-4 py-2 bg-white/10 rounded-lg z-[60] hover:bg-white/20 flex items-center gap-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          Menu
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="quiz" element={<QuizPage />} />
              <Route path="ai" element={<AIAssistantPage />} />
              <Route path="aiInterview" element={<SmartLearnInterview />} />
              {/* <Route path="learn" element={<SmartLearnSubjects />} />
              <Route path="learn/:subjectname" element={<SubjectPage />} /> */}

              <Route path="learn" element={<SmartLearnSubjects />} />
              <Route path="learn/:subjectname" element={<SubjectPage />} />
              <Route path="learn/:subjectname/lesson/:lessonname" element={<ChapterPage />} />




              <Route path="SmartLearnCommunity" element={<SmartLearnCommunity />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
