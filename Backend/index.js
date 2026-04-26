import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "./Config/Db.js";
import userRoutes from "./Routes/Users.routes.js";
import AuthRoutes from "./Routes/Auth.Routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import geminiResponse from "./Gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ❌ override hata diya (Railway ke env ko disturb karta hai)
dotenv.config();

const app = express();

// ✅ Middleware 
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ Connect to Database
connectDb();

// ✅ Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", AuthRoutes);

// ✅ Test Gemini API endpoint
app.get("/test-gemini", async (req, res) => {
  const prompt = req.query.prompt || "What is JavaScript?";

  try {
    const response = await geminiResponse(prompt);

    res.status(200).json({
      success: true,
      prompt,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to test Gemini API.",
      error: error.message
    });
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully...");
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
  });
});

// ✅ IMPORTANT: Railway compatible PORT
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server started on port ${PORT}`);
});