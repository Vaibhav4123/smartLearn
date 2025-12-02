
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js";
import Otp from "../models/Otp.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({ message: "All fields required" });

//     // Check existing
//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "Email already registered" });

//     // 🔐 Hash password here (controller level)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create user with hashed password
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Registered successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//       token: generateToken(user._id),
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };




export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailLower = email.toLowerCase();

    // Check OTP verification
    const record = await Otp.findOne({ email: emailLower });
    if (!record || !record.verified)
      return res.status(400).json({ message: "Please verify OTP first" });

    // Check if already registered
    const exists = await User.findOne({ email: emailLower });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashed,
    });

    await Otp.deleteOne({ email: emailLower });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};




export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });
    const user = await User.findOne({ email });

    // console.log("PPPPPPPPPPPPPPPPPPPPPP"+email+" "+password);
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    // Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic:user.profilePic
        
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ───────────────────────────────────────────────
   🔹 GET LOGGED-IN USER
──────────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, profilePic } = req.body;

    // Only update fields that are present
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (profilePic) {
      const uploadRes = await cloudinary.uploader.upload(profilePic, {
        folder: "smartlearn_profile_pics",
        resource_type: "image",
      });

      updatedFields.profilePic = uploadRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
