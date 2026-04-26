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

// ❌ REMOVE dotenv in production (Railway already injects env)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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

// ✅ Logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ DB connect
connectDb();

// ✅ Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", AuthRoutes);

// ✅ Test route
app.get("/test-gemini", async (req, res) => {
  try {
    const prompt = req.query.prompt || "Hello";
    const response = await geminiResponse(prompt);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully...");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ CRITICAL FIX (Railway compatible)
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server started on port ${PORT}`);
});