import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

/* =========================
   ROUTE IMPORTS
   ========================= */
import analyzeRoute from "./routes/analyze.js";
import authRoute from "./routes/auth.js";

/* =========================
   APP INIT
   ========================= */
const app = express();

/* =========================
   GLOBAL MIDDLEWARE
   ========================= */
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   MONGODB ATLAS CONNECTION
   ========================= */
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* =========================
   ROUTES
   ========================= */
app.use("/api/auth", authRoute);
app.use("/api/analyze", analyzeRoute);

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "AI Resume Analyzer Backend",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
