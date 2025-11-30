import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  editPost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
} from "../controllers/communityController.js";

const router = express.Router();

// Public
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected
router.post("/", auth, createPost);
router.put("/:id", auth, editPost);
router.delete("/:id", auth, deletePost);

router.post("/:id/comment", auth, addComment);
router.delete("/:id/comment/:commentId", auth, deleteComment);

router.post("/:id/like", auth, toggleLike);

export default router;

