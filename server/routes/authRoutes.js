import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  resetPassword,
} from "../controllers/otpController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();


// OTP Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Forgot Password OTP
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", resetPassword);


//auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getProfile);
router.put("/update-profile",auth,updateProfile);

export default router;
