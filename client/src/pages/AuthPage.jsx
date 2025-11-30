


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


const API_URL = `${import.meta.env.VITE_API_URL}api/auth`;


export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState("login"); // login | register | forgot
  const [step, setStep] = useState("email"); // email | otp | password
  const [loading, setLoading] = useState(false);

  const [savedEmail, setSavedEmail] = useState("");
  const [savedName, setSavedName] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ------------------------------------------------------------------
  // OTP Input System With Animation (shake + success)
  // ------------------------------------------------------------------
  const inputsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const triggerShake = () => {
    setOtpError(true);
    setTimeout(() => setOtpError(false), 600);
  };

  const triggerSuccess = () => {
    setOtpSuccess(true);
    setTimeout(() => setOtpSuccess(false), 700);
  };

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    }
  }, [step]);

  const handleFocus = (index) => {
    if (index !== currentIndex) {
      inputsRef.current[currentIndex]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (index !== currentIndex) {
      e.preventDefault();
      inputsRef.current[currentIndex]?.focus();
      return;
    }
    if (e.key === "Backspace") {
      inputsRef.current[index].value = "";
      if (index > 0) {
        const prev = index - 1;
        setCurrentIndex(prev);
        requestAnimationFrame(() => inputsRef.current[prev]?.focus());
      }
    }
  };


  // written for that input line in box is initially at end in forgotpassword pahse so to take it first box
  useEffect(() => {
  if (inputsRef.current[0]) {
    inputsRef.current[0].focus();
  }
  }, []);



  const handlePaste = (e) => {
    const raw = e.clipboardData.getData("text");
    const text = raw.replace(/[^0-9]/g, "");
    if (text.length === 6) {
      text.split("").forEach((digit, i) => {
        if (inputsRef.current[i]) inputsRef.current[i].value = digit;
      });
      setCurrentIndex(5);
      requestAnimationFrame(() => inputsRef.current[5]?.focus());
    }
    e.preventDefault();
  };

  const handleInput = (e, index) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) value = value.slice(-1);
    inputsRef.current[index].value = value;

    if (value !== "" && index < 5) {
      const next = index + 1;
      setCurrentIndex(next);
      requestAnimationFrame(() => inputsRef.current[next]?.focus());
      return;
    }
    if (value === "" && index > 0) {
      const prev = index - 1;
      setCurrentIndex(prev);
      requestAnimationFrame(() => inputsRef.current[prev]?.focus());
    }

    const otpValue = inputsRef.current.map((i) => i?.value || "").join("");
    form.otp = otpValue;
  };

  // LOGIN
  const handleLogin = async () => {
  if (!form.email || !form.password)
    return toast.error("Email and password required");

  try {
    const user = await login(form.email, form.password);

    if (user) {
      navigate("/SmartLearnDashboard/dashboard"); 
    }

  } catch (err) {
    // login() already showed exact error, so only fallback here
    // toast.error("Invalid credentials");
  }
};


  // SEND OTP (REGISTER)

  const handleSendOtp = async () => {
  if (!form.name || !form.email) {
     return toast.error("Name and Email required");
  }

  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    // Handle non-JSON response safely
    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    // Success
    setSavedName(form.name);
    setSavedEmail(form.email);
    setStep("otp");

    toast.success("OTP sent to email");

  } catch (err) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
 };




  // VERIFY REGISTER OTP
  const handleVerifyOtp = async () => {
    if (!form.otp || form.otp.length !== 6)
      return toast.error("Enter full 6-digit OTP");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedEmail, otp: form.otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerShake();
        return toast.error(data.message);
      }

      triggerSuccess();
      toast.success("OTP Verified!");

      setTimeout(() => setStep("password"), 600);
    } finally {
      setLoading(false);
    }
  };


  // FINAL REGISTER
  const handleRegister = async () => {
    if (!form.password || !form.confirmPassword)
      return toast.error("Password required");

    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: savedName,
          email: savedEmail,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Account created!");
      setForm({
        name: "",
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
      });

      inputsRef.current.forEach((input) => {
        if (input) input.value = "";
      });

      setAuthMode("login");



    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD — SEND OTP
  const handleForgotSendOtp = async () => {
    if (!form.email) return toast.error("Enter email");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setSavedEmail(form.email);
      setStep("otp");

      toast.success("Reset OTP sent");
    } finally {
      setLoading(false);
    }
  };


  // FORGOT PASSWORD — VERIFY OTP
  const handleForgotVerifyOtp = async () => {
    if (!form.otp || form.otp.length !== 6)
      return toast.error("Enter full OTP");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedEmail, otp: form.otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        triggerShake();
        return toast.error(data.message);
      }

      triggerSuccess();
      toast.success("OTP Verified!");

      setTimeout(() => setStep("password"), 600);
    } finally {
      setLoading(false);
    }
  };


  // RESET PASSWORD

  const handleForgotResetPassword = async () => {
  if (!form.password || !form.confirmPassword)
    return toast.error("Password required");

  if (form.password !== form.confirmPassword)
    return toast.error("Passwords must match");

  if (!savedEmail) return toast.error("Email missing. Restart reset process.");
  if (!form.otp) return toast.error("OTP missing");

  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: savedEmail,
        otp: form.otp,
        newPassword: form.password,   // change to password if backend expects
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.message || "Reset failed");
    }

    toast.success("Password reset successfully!");

    setAuthMode("login");
    setStep("email");

    setForm({
      name: "",
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    });

    inputsRef.current.forEach((input) => {
      if (input) input.value = "";
    });


  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};


  // UI STARTS
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white px-4 relative">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-600/30 rounded-xl backdrop-blur-xl z-20"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl border border-purple-400/30 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT BRANDING */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 p-10 w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-6"
          >
            <BookOpen className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-extrabold">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-200 to-pink-200 bg-clip-text text-transparent">
              SmartLearn
            </span>
          </h2>
          <p className="text-purple-100 mt-4 max-w-xs text-center">
            AI-powered learning, quizzes & interview prep.
          </p>
        </div>


        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-8 md:p-12">

          <AnimatePresence mode="wait">

            {/* ============================= LOGIN ============================= */}
            {authMode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
              > 
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <BookOpen className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
                    SmartLearn
                  </h1>
                </div>

                <h1 className="text-3xl font-bold">Welcome Back 👋</h1>

                <div className="space-y-5 mt-6">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateForm}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold"
                  >
                    Sign In
                  </button>

                  <p className="text-right mt-2">
                    <button
                      className="text-purple-300"
                      onClick={() => {
                        setAuthMode("forgot");
                        setStep("email");
                      }}
                    >
                      Forgot Password?
                    </button>
                  </p>

                  <p className="text-sm text-center mt-6">
                    Don’t have an account?
                    <button
                      className="text-purple-300 ml-2"
                      onClick={() => {
                        setAuthMode("register");
                        setStep("email");
                      }}
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================ REGISTER STEP 1 ============================ */}
            {authMode === "register" && step === "email" && (
              <motion.div
                key="reg1"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
              > 
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <BookOpen className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
                    SmartLearn
                  </h1>
                </div>
                
                <h1 className="text-3xl font-bold">Create Account 🚀</h1>

                <div className="space-y-5 mt-6">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <button
                    onClick={handleSendOtp}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>

                  <p className="text-sm text-center mt-6">
                    Already have an account?
                    <button
                      className="text-purple-300 ml-2"
                      onClick={() => {
                        setAuthMode("login");
                        setStep("email");
                      }}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================ REGISTER STEP 2 (OTP) ============================ */}
            {authMode === "register" && step === "otp" && (
              <motion.div
                key="regOtpUi"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <h1 className="text-3xl font-bold">Verify OTP 🔐</h1>
                <p className="text-purple-300 mt-1">
                  OTP sent to <b>{savedEmail}</b>
                </p>

                {/* ADVANCED OTP UI */}
                <div
                  className="flex justify-center mt-8 gap-3"
                  onPaste={handlePaste}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      maxLength={1}
                      ref={(el) => (inputsRef.current[i] = el)}
                      onFocus={() => handleFocus(i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onChange={(e) => handleInput(e, i)}
                      className={`
                        w-[55px] h-[65px] text-[30px] text-center rounded-xl 
                        bg-white/10 border-2 outline-none text-white 
                        transition-all duration-200
                        ${otpError ? "animate-shake border-red-500" : "border-purple-400/50"}
                        ${otpSuccess ? "animate-otpSuccess border-green-400 shadow-green-500/40" : ""}
                      `}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full mt-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-bold"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  onClick={handleSendOtp}
                  className="text-purple-300 mt-3 underline"
                >
                  Resend OTP
                </button>
              </motion.div>
            )}

            {/* ============================ REGISTER STEP 3 (PASSWORD) ============================ */}
            {authMode === "register" && step === "password" && (
              <motion.div
                key="reg3"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-2xl font-bold mb-4">Set Password 🔒</h1>

                <div className="space-y-5">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateForm}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateForm}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ============================ FORGOT STEP 1 ============================ */}
            {authMode === "forgot" && step === "email" && (
              <motion.div
                key="forgot1"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl font-bold mb-6">Forgot Password 🔐</h1>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 rounded-xl"
                />

                <button
                  onClick={handleForgotSendOtp}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <p className="text-sm text-center mt-6">
                  Back to login?
                  <button
                    className="text-purple-300 ml-2"
                    onClick={() => setAuthMode("login")}
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}

            {/* ============================ FORGOT STEP 2 (OTP) ============================ */}
            {authMode === "forgot" && step === "otp" && (
              <motion.div
                key="forgot2"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <h1 className="text-2xl font-bold mb-3">Verify OTP 🔑</h1>
                <p className="text-purple-300">
                  OTP sent to <b>{savedEmail}</b>
                </p>

                {/* OTP UI */}
                <div
                  className="flex justify-center mt-6 gap-3"
                  onPaste={handlePaste}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      maxLength={1}
                      ref={(el) => (inputsRef.current[i] = el)}
                      onFocus={() => handleFocus(i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onChange={(e) => handleInput(e, i)}
                      className={`
                        w-[55px] h-[65px] text-[30px] text-center rounded-xl 
                        bg-white/10 border-2 outline-none text-white 
                        transition-all duration-200
                        ${otpError ? "animate-shake border-red-500" : "border-purple-400/50"}
                        ${otpSuccess ? "animate-otpSuccess border-green-400 shadow-green-500/40" : ""}
                      `}
                    />
                  ))}
                </div>




                <button
                  onClick={handleForgotVerifyOtp}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-bold"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </motion.div>
            )}

            {/* ============================ FORGOT STEP 3 (RESET PASSWORD) ============================ */}
            {authMode === "forgot" && step === "password" && (
              <motion.div
                key="forgot3"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-2xl font-bold mb-3">Reset Password 🔒</h1>

                <div className="space-y-5">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateForm}
                    placeholder="New Password"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateForm}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl"
                  />

                  <button
                    onClick={handleForgotResetPassword}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold"
                  >
                    {loading ? "Saving..." : "Reset Password"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}



