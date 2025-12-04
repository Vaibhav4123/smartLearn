import Otp from "../models/Otp.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { passwordResetSuccessTemplate, registrationOtpTemplate, resendOtpTemplate, resetPasswordOtpTemplate } from "./emailTemplates.js";
dotenv.config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: process.env.SMTP_PORT, // 587
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER, // Gmail email
    pass: process.env.SMTP_PASS, // Gmail app password
  },
  tls: {
    // rejectUnauthorized: false,
    ciphers: "SSLv3",//for outlook.com
  },
});




// ======================================================
// 🔹 SEND OTP for registration
// ======================================================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const emailLower = email.trim().toLowerCase();

    // ❌ Don't allow sending OTP if user exists
    const exists = await User.findOne({ email: emailLower });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await Otp.findOneAndUpdate(
      { email: emailLower },
      { otp, expiresAt, verified: false },
      { upsert: true }
    );

    const data=await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emailLower,
      subject: "SmartLearn Registration OTP",
      html:registrationOtpTemplate(otp),
    });
    console.log(data);

    res.json({ message: "OTP sent", email: emailLower });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ======================================================
// 🔹 VERIFY OTP (registration)
// ======================================================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(400).json({ message: "OTP not found" });

    if (record.expiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified", email });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ======================================================
// 🔁 RESEND OTP
// ======================================================
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(404).json({ message: "OTP record not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    record.otp = otp;
    record.expiresAt = expiresAt;
    record.verified = false;
    await record.save();

    const data=await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "SmartLearn OTP Resend",
      html:resendOtpTemplate(otp),
    });
    console.log(data);
    res.json({ message: "OTP resent" });

  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ======================================================
// 🔹 SEND OTP FOR FORGOT PASSWORD
// ======================================================
export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000, verified: false },
      { upsert: true }
    );
    
    const data=await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "SmartLearn Password Reset OTP",
      html:resetPasswordOtpTemplate(otp),
    });
    console.log(data);

    res.json({ message: "Reset OTP sent" });

  } catch (err) {
    console.error("FORGOT SEND OTP ERROR:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ======================================================
// 🔹 VERIFY OTP FOR PASSWORD RESET
// ======================================================
export const forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(404).json({ message: "OTP not found" });

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified" });

  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ======================================================
// 🔒 RESET PASSWORD
// ======================================================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await Otp.findOne({ email });
    if (!record || !record.verified)
      return res.status(400).json({ message: "OTP not verified" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    await Otp.deleteOne({ email });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "SmartLearn Password Changed",
      html: passwordResetSuccessTemplate(),
    });

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};





