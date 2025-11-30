
import CommunityPost from "../models/CommunityPost.js";
import cloudinary from "../config/cloudinary.js";
import uploadBase64Image from "../utils/uploadBase64.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { content, category, imageBase64 } = req.body;

    if (!content) return res.status(400).json({ message: "Content is required" });

    let image = null;
    let imagePublicId = null;

    // Upload image if provided
    if (imageBase64) {
      const uploaded = await uploadBase64Image(imageBase64, "smartlearn/posts");
      image = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const post = await CommunityPost.create({
      user: req.user.id,
      content,
      category,
      image,
      imagePublicId
    });

    const populated = await post.populate("user", "name email profilePic");
    res.status(201).json(populated);

  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const editPost = async (req, res) => {
  try {
    const { content, category, imageBase64 } = req.body;

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    if (content) post.content = content;
    if (category) post.category = category;

    // Replace image
    if (imageBase64) {
      if (post.imagePublicId) {
        await cloudinary.uploader.destroy(post.imagePublicId);
      }
      const uploaded = await uploadBase64Image(imageBase64, "smartlearn/posts");
      post.image = uploaded.url;
      post.imagePublicId = uploaded.publicId;
    }

    await post.save();

    const populated = await post.populate("user", "name email profilePic");
    res.json(populated);

  } catch (err) {
    console.error("Edit Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    // Permission check
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    // Delete image if exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    // FIX HERE: remove() → deleteOne()
    await post.deleteOne();

    res.json({ message: "Post deleted" });

  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};







export const addComment = async (req, res) => {
  try {
    const { text, imageBase64 } = req.body;

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    let image = null;

    if (imageBase64) {
      const uploaded = await uploadBase64Image(imageBase64, "smartlearn/comments");
      image = uploaded.url;
    }

    post.commentsList.push({
      user: req.user.id,
      text,
      image
    });

    await post.save();

    const populated = await post.populate([
      { path: "user", select: "name email profilePic " },
      { path: "commentsList.user", select: "name email profilePic" }
    ]);

    res.json(populated);

  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.commentsList.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      comment.user.toString() !== req.user.id &&
      post.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment removed" });

  } catch (err) {
    console.error("Delete Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};







export const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    const index = post.likes.indexOf(userId);

    let liked;
    if (index === -1) {
      post.likes.push(userId);
      liked = true;
    } else {
      post.likes.splice(index, 1);
      liked = false;
    }

    await post.save();

    res.json({ liked, likeCount: post.likes.length });

  } catch (err) {
    console.error("Toggle Like Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("user", "name email profilePic")
      .populate("commentsList.user", "name email profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("Fetch Posts Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};







export const getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate("user", "name email profilePic")
      .populate("commentsList.user", "name email profilePic");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);

  } catch (err) {
    console.error("Get Post Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

