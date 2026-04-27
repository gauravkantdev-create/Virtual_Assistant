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

// ✅ Load .env only in local (NOT in Railway production)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// ✅ Required for Railway/Production (Trust the proxy)
app.set("trust proxy", 1);

// ✅ Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  "https://grateful-learning-production.up.railway.app", // Allow the backend to see itself
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
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

// ✅ Root route (CRITICAL for Railway Health Checks)
app.get("/", (req, res) => {
  res.status(200).send("🚀 Backend is running successfully on Railway!");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ 🔥 FINAL PORT FIX
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server started on port ${PORT}`);
});