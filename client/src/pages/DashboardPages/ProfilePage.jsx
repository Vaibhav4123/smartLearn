
import React, { useEffect, useState } from "react";
import { Camera, Pencil, Check, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}api/auth/update-profile`;
const LS_KEY = "smartlearn_user";
const TOKEN_KEY = "smartlearn_token";

// Default avatar
const DEFAULT_PROFILE =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  

  const [name, setName] = useState("");
  const [profilePreview, setProfilePreview] = useState(DEFAULT_PROFILE);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Always load user from localStorage
  const loadUserFromLocalStorage = () => {
    const saved = localStorage.getItem("smartlearn_user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setName(u.name);
      console.log(u.profilePic);
      setProfilePreview(u.profilePic || DEFAULT_PROFILE);
    }
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, []);

  // Convert file → Base64
  const handleFileChange = (e) => {
    if (!editing) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result); // Base64 preview
      setIsImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      alert("Login expired. Please login again.");
      return;
    }

    setIsSaving(true);

    try {
      const finalImage = isImageChanged ? profilePreview : null;

      const res = await axios.put(
        API_URL,
        { name, profilePic: finalImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.user;

      // Save updated user to localStorage
      localStorage.setItem(LS_KEY, JSON.stringify(updated));

      // Sync React state with localStorage again
      loadUserFromLocalStorage();

      setIsImageChanged(false);
      setEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      alert(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadUserFromLocalStorage(); // Reset from localStorage (source of truth)
    setIsImageChanged(false);
  };

  if (!user)
    return (
      <div className="text-center mt-20 text-gray-300 text-xl">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
        Your SmartLearn Profile
      </h1>

      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
        
        {/* Profile Image */}
        <div className="relative w-fit mx-auto">
          <img
            src={profilePreview || DEFAULT_PROFILE}
            className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-lg object-cover"
            alt="Profile"
          />

          {editing && (
            <label className="absolute bottom-2 right-2 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-md">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Name */}
        {!editing ? (
          <h2 className="text-3xl font-bold text-center mt-4">{name}</h2>
        ) : (
          <div className="flex justify-center mt-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-lg w-64 text-white outline-none focus:border-purple-500"
              disabled={isSaving}
            />
          </div>
        )}

        {/* Email */}
        <p className="text-center text-gray-400 mt-1">{user.email}</p>

        {/* Buttons */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="mt-5 mx-auto flex items-center gap-2 bg-purple-600 px-5 py-2 rounded-xl text-white hover:bg-purple-700 shadow-lg transition"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex justify-center gap-4 mt-5">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-xl text-white hover:bg-green-700 shadow-lg transition"
            >
              <Check size={18} /> {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-red-600 px-5 py-2 rounded-xl text-white hover:bg-red-700 shadow-lg transition"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
