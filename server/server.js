import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { authRoutes,communityRoutes,interviewRoutes,quizRoutes } from "./routes/index.js";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

// middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.CORS_ORIGIN_1,
  ],
  credentials: true,                
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/community", communityRoutes);


app.get("/", (req, res) => res.send("API is running..."));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

