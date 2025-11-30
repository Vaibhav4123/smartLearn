

import React, { useEffect, useState } from "react";
import {
  Users,
  MessageCircle,
  PlusCircle,
  Heart,
  Share2,
  Image as ImageIcon,
  Search,
  Trash2,
  Edit2,
  X,
  Check,
} from "lucide-react";
import axios from "axios";
const API_BASE =  `${import.meta.env.VITE_API_URL}/community`;
const LS_KEY = "smartlearn_user";
const TOKEN_KEY = "smartlearn_token";
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const categories = ["DSA", "OOP", "DBMS", "OS", "ML", "Cloud", "WebDev"];

/* ---------- Helpers ---------- */
const safeId = (v) => (v ? String(v) : "");
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ---------- Small UI: Confirm Modal ---------- */
function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onCancel} className="text-slate-300 p-1 rounded">
            <X />
          </button>
        </div>
        <p className="text-slate-300 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-slate-700 px-4 py-2 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Trash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Edit Post Modal ---------- */
function EditPostModal({ open, post, onClose, onSaved, refreshPosts }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (!post) return;
    setContent(post.content || "");
    setCategory(post.category || categories[0]);
    setImagePreview(post.image || null);
    setImageBase64(null);
    setSaving(false);
  }, [post]);

  if (!open || !post) return null;

  const handleFile = async (file) => {
    if (!file) {
      setImagePreview(post.image || null);
      setImageBase64(null);
      return;
    }
    const b64 = await fileToBase64(file);
    setImagePreview(b64);
    setImageBase64(b64);
  };

  const handleSave = async () => {
    if (!token) return alert("Login required");
    setSaving(true);
    try {
      const payload = { content, category };
      // Send imageBase64 only if changed (we use presence)
      if (imageBase64) payload.imageBase64 = imageBase64;

      const res = await axios.put(`${API_BASE}/${post._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSaved?.(res.data);
      refreshPosts?.();
      onClose();
    } catch (err) {
      console.error("Edit save error:", err);
      alert(err?.response?.data?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Edit Post</h3>
          <button onClick={onClose} className="text-slate-300 p-1 rounded">
            <X />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full bg-slate-800 p-3 rounded-xl mb-3"
        />

        <div className="flex gap-3 items-center mb-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 p-2 rounded-xl"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl cursor-pointer">
            <ImageIcon />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <span className="text-sm text-slate-300">Replace image</span>
          </label>
        </div>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="w-40 h-40 rounded-lg mb-3 object-cover"
          />
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-slate-700 px-4 py-2 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Check /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Post Details Modal (view + comment + delete comment via custom confirm) ---------- */
function PostDetailsModal({ postId, onClose, refreshPosts, onEditOpen }) {
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentImageBase64, setCommentImageBase64] = useState(null);
  const [posting, setPosting] = useState(false);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    payload: null,
  }); // type: 'post' | 'comment'
  const token = localStorage.getItem(TOKEN_KEY);
  const user = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  const localUserId = safeId(user?._id || user?.id);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Fetch post error:", err);
      }
    })();
  }, [postId]);

  const isOwnerOfPost = () =>
    safeId(post?.user?._id || post?.user) === localUserId;
  const isCommentOwner = (c) => safeId(c.user?._id || c.user) === localUserId;

  const handleCommentImage = async (file) => {
    if (!file) return setCommentImageBase64(null);
    const b64 = await fileToBase64(file);
    setCommentImageBase64(b64);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    if (!token) return alert("Login required");
    setPosting(true);
    try {
      const payload = { text: commentText };
      if (commentImageBase64) payload.imageBase64 = commentImageBase64;
      const res = await axios.post(`${API_BASE}/${postId}/comment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
      setCommentText("");
      setCommentImageBase64(null);
      refreshPosts?.();
    } catch (err) {
      console.error("Add comment error:", err);
      alert(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  const openDeleteConfirm = (type, payload) => {
    setConfirm({ open: true, type, payload });
  };

  const closeConfirm = () =>
    setConfirm({ open: false, type: null, payload: null });

  const doDelete = async () => {
    if (!token) return alert("Login required");

    try {
      if (confirm.type === "post") {
        // delete post
        await axios.delete(`${API_BASE}/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        closeConfirm();
        onClose();
        refreshPosts?.();
        return;
      }

      if (confirm.type === "comment") {
        const { commentId } = confirm.payload;
        await axios.delete(`${API_BASE}/${postId}/comment/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // refresh post
        const res = await axios.get(`${API_BASE}/${postId}`);
        setPost(res.data);
        closeConfirm();
        refreshPosts?.();
        return;
      }
    } catch (err) {
      console.error("Delete action error:", err);
      alert(err?.response?.data?.message || "Delete failed");
      closeConfirm();
    }
  };

  if (!post) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
        <div className="w-full max-w-3xl bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={post.user?.profilePic || DEFAULT_AVATAR}
                alt="avatar"
                className="w-11 h-11 rounded-full"
              />
              <div>
                <div className="font-semibold">
                  {post.user?.name || "Unknown"}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnerOfPost() && (
                <>
                  <button
                    onClick={() => onEditOpen(post)}
                    className="text-slate-300 p-2 rounded"
                    title="Edit post"
                  >
                    <Edit2 />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm("post", null)}
                    className="text-red-400 p-2 rounded"
                    title="Delete post"
                  >
                    <Trash2 />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-slate-300 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-slate-200 whitespace-pre-wrap">{post.content}</p>
            {post.category && (
              <span className="inline-block text-xs md:text-sm bg-purple-700 px-2 py-1 rounded-lg mt-3">
                {post.category}
              </span>
            )}
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="w-full rounded-lg mt-4 object-cover"
              />
            )}
          </div>

          <h4 className="text-lg font-semibold text-purple-300 mt-6">
            Comments
          </h4>
          <div className="space-y-3 max-h-64 overflow-auto pr-2">
            {(post.commentsList || []).map((c) => (
              <div
                key={c._id}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img
                      src={c.user?.profilePic || DEFAULT_AVATAR}
                      className="w-9 h-9 rounded-full"
                      alt="cuser"
                    />
                    <div>
                      <div className="text-sm font-semibold text-purple-300">
                        {c.user?.name || "User"}
                      </div>
                      <div className="text-sm text-slate-200">{c.text}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {c.image && (
                      <img
                        src={c.image}
                        alt=""
                        className="w-14 h-14 rounded-md object-cover"
                      />
                    )}
                    {(isCommentOwner(c) || isOwnerOfPost()) && (
                      <button
                        onClick={() =>
                          openDeleteConfirm("comment", { commentId: c._id })
                        }
                        className="text-xs text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-slate-800 p-3 rounded-xl mt-4"
            rows={3}
            placeholder="Write a comment..."
          />

          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl cursor-pointer">
              <ImageIcon />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleCommentImage(e.target.files?.[0])}
              />
            </label>

            {commentImageBase64 && (
              <img
                src={commentImageBase64}
                alt="preview"
                className="w-16 h-16 rounded-md object-cover"
              />
            )}

            <button
              onClick={addComment}
              disabled={posting}
              className="ml-auto bg-purple-600 px-4 py-2 rounded-xl"
            >
              {posting ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title={confirm.type === "post" ? "Delete post" : "Delete comment"}
        message={
          confirm.type === "post"
            ? "Are you sure you want to delete this post? This cannot be undone."
            : "Are you sure you want to delete this comment?"
        }
        onCancel={closeConfirm}
        onConfirm={doDelete}
      />
    </>
  );
}

/* ---------- Main Community Component ---------- */
export default function SmartLearnCommunity() {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editPost, setEditPost] = useState(null); // post object to edit

  const [showForm, setShowForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [confirmGlobal, setConfirmGlobal] = useState({
    open: false,
    postId: null,
  }); // optional global confirm usage

  const user = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  const token = localStorage.getItem(TOKEN_KEY);
  const localUserId = safeId(user?._id || user?.id);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const isOwner = (post) => {
    if (!post || !user) return false;
    return safeId(post.user?._id || post.user) === localUserId;
  };

  const handleImageChange = async (file) => {
    if (!file) {
      setImagePreview(null);
      setImageBase64(null);
      return;
    }
    const b64 = await fileToBase64(file);
    setImagePreview(b64);
    setImageBase64(b64);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return alert("Enter content");
    if (!token) return alert("Login required");
    try {
      const payload = { content: newPostContent, category: newCategory };
      if (imageBase64) payload.imageBase64 = imageBase64;
      const res = await axios.post(API_BASE, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => [res.data, ...prev]);
      setShowForm(false);
      setNewPostContent("");
      setImagePreview(null);
      setImageBase64(null);
    } catch (err) {
      console.error("Create post error:", err);
      alert(err?.response?.data?.message || "Failed to create post");
    }
  };

  const handleToggleLike = async (postId) => {
    if (!token) return alert("Login required");
    try {
      await axios.post(
        `${API_BASE}/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // open a custom confirm modal before delete (global style)
  const openGlobalDelete = (postId) => setConfirmGlobal({ open: true, postId });
  const closeGlobalDelete = () =>
    setConfirmGlobal({ open: false, postId: null });

  const doGlobalDelete = async () => {
    if (!token) return alert("Login required");
    const postId = confirmGlobal.postId;
    try {
      await axios.delete(`${API_BASE}/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      closeGlobalDelete();
    } catch (err) {
      console.error("Global delete error:", err);
      alert(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const getLikeCount = (p) =>
    Array.isArray(p.likes) ? p.likes.length : p.likes || 0;
  const isLikedByUser = (p) =>
    Array.isArray(p.likes) && localUserId
      ? p.likes.includes(localUserId)
      : false;

  const filtered = posts.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      (p.content || "").toLowerCase().includes(q) ||
      (p.user?.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q);
    const matchCategory =
      filterCategory === "All" || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "liked") return getLikeCount(b) - getLikeCount(a);
    return (
      new Date(b.createdAt || b.time || 0) -
      new Date(a.createdAt || a.time || 0)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-4 md:p-6 text-white">
      
      <div className="w-full bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 shadow-xl mb-6 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              SmartLearn Community
            </h1>
            <p className="text-xs text-slate-400 hidden md:block">
              Join discussions, share knowledge and ask doubts.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl w-full md:w-auto">
            <Search className="text-slate-400" />
            <input
              type="text"
              placeholder="Search user, content or category..."
              className="w-full md:w-64 bg-transparent focus:outline-none text-sm text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-purple-600 px-3 py-2 rounded-xl hover:bg-purple-700 transition"
            >
              <PlusCircle size={18} />{" "}
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </div>



      <div className="max-w-3xl mx-auto px-2 md:px-4 space-y-4">
        {sorted.length === 0 && !loading && (
          <div className="text-center text-gray-400">No posts yet.</div>
        )}

        {sorted.map((post) => {
          const pid = post._id || post.id;
          return (
            <article
              key={pid}
              className="bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-700 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={post.user?.profilePic || DEFAULT_AVATAR}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border border-slate-700"
                  />
                  <div>
                    <p className="font-semibold text-sm md:text-base">
                      {post.user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(
                        post.createdAt || post.time || ""
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner(post) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditPost(post)}
                        title="Edit"
                        className="p-2 text-slate-300"
                      >
                        <Edit2 />
                      </button>
                      <button
                        onClick={() => openGlobalDelete(pid)}
                        title="Delete"
                        className="p-2 text-red-400"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs bg-purple-700 px-2 py-1 rounded-lg">
                  {post.category}
                </span>
                <p className="text-slate-200 mt-2 text-sm md:text-base whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="attachment"
                    className="w-40 h-40 rounded-lg object-cover mx-auto mt-4 border"
                  />
                )}
              </div>

              <div className="flex items-center gap-6 mt-4 text-slate-300">

                <button
                  onClick={() => handleToggleLike(pid)}
                  className="flex items-center gap-2"
                >
                  <Heart
                    size={18}
                    className={
                      isLikedByUser(post)
                        ? "text-red-500 fill-red-500"
                        : "text-white"
                    }
                  />
                  <span>{getLikeCount(post)}</span>
                </button>

                <button
                  onClick={() => setSelectedPostId(pid)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle size={16} />{" "}
                  <span className="text-sm">
                    {(post.commentsList || []).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      window.location.href + `#post-${pid}`
                    );
                    alert("Link copied");
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Create Post Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Post</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setImagePreview(null);
                  setImageBase64(null);
                }}
                className="text-slate-300"
              >
                <X />
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-slate-800 p-3 rounded-xl focus:outline-none resize-none text-sm md:text-base"
              rows={4}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-slate-800 p-2 rounded-xl text-sm w-full sm:w-auto"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl cursor-pointer">
                <ImageIcon />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(e.target.files && e.target.files[0])
                  }
                />
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreatePost}
                className="bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-700 transition"
              >
                Post
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setImagePreview(null);
                  setImageBase64(null);
                }}
                className="bg-slate-700 px-4 py-2 rounded-xl hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <EditPostModal
          open={!!editPost}
          post={editPost}
          onClose={() => setEditPost(null)}
          onSaved={() => setEditPost(null)}
          refreshPosts={fetchPosts}
        />
      )}

      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          refreshPosts={fetchPosts}
          onEditOpen={(p) => setEditPost(p)}
        />
      )}

      {/* Global Confirm for delete (owner in list) */}
      <ConfirmModal
        open={confirmGlobal.open}
        title="Delete post"
        message="Are you sure you want to delete this post? This action can't be undone."
        onCancel={closeGlobalDelete}
        onConfirm={doGlobalDelete}
      />
    </div>
  );
}
