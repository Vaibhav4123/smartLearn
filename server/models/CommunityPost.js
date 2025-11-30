import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   text: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now }
// });

// const communityPostSchema = new mongoose.Schema(
//   {
//     user: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: "User", 
//       required: true 
//     },

//     content: { type: String, required: true },
//     category: { type: String, required: true },
//     image: { type: String },

//     likes: { type: Number, default: 0 },

//     commentsList: [commentSchema]
//   },
//   { timestamps: true }
// );

// export default mongoose.model("CommunityPost", communityPostSchema);












const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  image: { type: String },               // add image support for comment
  timestamp: { type: Date, default: Date.now }
});

const communityPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },

    // CHANGE this from Number -> array of user ObjectIds
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

    commentsList: [commentSchema]
  },
  { timestamps: true }
);

export default mongoose.model("CommunityPost", communityPostSchema);