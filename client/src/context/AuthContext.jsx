import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
const AuthContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL}api/auth`;

export const AuthProvider = ({ children }) => {
  const navigate=useNavigate();
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lastQuizResult, setLastQuizResult] = useState(null);
  const [lastInterviewResult, setLastInterviewResult] = useState(null);

  // Load user from localStorage on first load
  useEffect(() => {
    const savedUser = localStorage.getItem("smartlearn_user");
    const savedPic = localStorage.getItem("smartlearn_profile_pic");
    const savedQuiz = localStorage.getItem("smartlearn_last_quiz");
    const savedInterview = localStorage.getItem("smartlearn_last_interview");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPic) setProfilePic(savedPic);
    if (savedQuiz) setLastQuizResult(JSON.parse(savedQuiz));
    if (savedInterview) setLastInterviewResult(JSON.parse(savedInterview));
    
    setLoading(false);
  }, []);


// ⭐ LOGIN
// const login = async (email, password) => {
//   // Frontend validation
//   if (!email || !password) {
//     toast.error("Please enter email and password");
//     return;
//   }

//   // Basic email check
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     toast.error("Invalid email format");
//     return;
//   }

//   const toastId = toast.loading("Logging in...");

//   try {
//     const res = await axios.post(
//       `${API_URL}/login`,
//       { email, password },
//       { withCredentials: true }
//     );

//     const { user, token, message } = res.data;

//     // SUCCESS
//     localStorage.setItem("smartlearn_user", JSON.stringify(user));
//     localStorage.setItem("smartlearn_token", token);
//     setUser(user);

//     toast.success(message || "Login successful 🎉", { id: toastId });

//     return user; // return success so handleLogin knows

//   } catch (err) {
//     const msg = err?.response?.data?.message;

//     // SERVER RESPONSES
//     switch (msg) {
//       case "All fields required":
//         toast.error("All fields are required ⚠️", { id: toastId });
//         break;

//       case "Invalid email or password":
//         toast.error("Invalid email or password ❌", { id: toastId });
//         break;

//       case "User not found":
//         toast.error("No account found with this email ❌", { id: toastId });
//         break;

//       case "Invalid password":
//         toast.error("Incorrect password ❌", { id: toastId });
//         break;

//       case "Server error":
//         toast.error("Server error! Try again later ⛔", { id: toastId });
//         break;

//       default:
//         toast.error("Login failed, please try again ❗", { id: toastId });
//     }

//     throw err; // important so handleLogin can catch it
//   }
// };





const login = async (email, password) => {
  // Frontend validation
  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }
  

  // Basic email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Invalid email format");
    return;
  }

  const toastId = toast.loading("Logging in...");

  try {
    const res = await axios.post(
      `${API_URL}/login`,
      { email, password },
      { withCredentials: true }
    );

    let data = res.data || {};

    // Extract values safely
    const user = data.user || null;
    const token = data.token || null;
    const message = data.message || "Login successful 🎉";

    if (!user || !token) {
      toast.error("Invalid server response ❗", { id: toastId });
      return;
    }

    // SUCCESS
    localStorage.setItem("smartlearn_user", JSON.stringify(user));
    localStorage.setItem("smartlearn_token", token);
    setUser(user);

    toast.success(message, { id: toastId });

    return user; // so handleLogin() can continue

  } catch (err) {
    console.log("Login Error:", err);
    console.log(API_URL);

    const msg = err?.response?.data?.message;

    // HANDLE SERVER RESPONSES
    switch (msg) {
      case "All fields required":
        toast.error("All fields are required ⚠️", { id: toastId });
        break;

      case "Invalid email or password":
        toast.error("Invalid email or password ❌", { id: toastId });
        break;

      case "User not found":
        toast.error("No account found with this email ❌", { id: toastId });
        break;

      case "Invalid password":
        toast.error("Incorrect password ❌", { id: toastId });
        break;

      case "Server error":
        toast.error("Server error! Try again later ⛔", { id: toastId });
        break;

      default:
        toast.error("Login failed, please try again ❗", { id: toastId });
    }

    throw err; // allow handleLogin to catch it
  }
};



  

  // ===========================
  // ⭐ REGISTER
  // ===========================
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/register`,
        { name, email, password },
        { withCredentials: true }
      );

      const { user, token } = res.data;

      // Save to localStorage
      localStorage.setItem("smartlearn_user", JSON.stringify(user));
      localStorage.setItem("smartlearn_token", token);

      setUser(user);
      toast.success("Account created successfully 🎉");

      return user;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  // ===========================
  // ⭐ LOGOUT
  // ===========================
  const logout = () => {
    

    setUser(null);
    setProfilePic(null);
    setLastQuizResult(null);
    setLastInterviewResult(null);

    localStorage.removeItem("smartlearn_user");
    localStorage.removeItem("smartlearn_token");
    localStorage.removeItem("smartlearn_profile_pic");
    localStorage.removeItem("smartlearn_last_quiz");
    localStorage.removeItem("smartlearn_last_interview");

    toast.success("Logged out successfully!");
  };

  // ===========================
  // ⭐ PROFILE PIC UPLOAD
  // ===========================
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      localStorage.setItem("smartlearn_profile_pic", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ===========================
  // EXPORT CONTEXT
  // ===========================
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        profilePic,
        handleProfilePicChange,

        // Quiz & Interview data
        lastQuizResult,
        setLastQuizResult,
        lastInterviewResult,
        setLastInterviewResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
