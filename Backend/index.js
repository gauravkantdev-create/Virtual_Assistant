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

// ✅ Diagnostic Logs for Railway
console.log("--- ENVIRONMENT DIAGNOSTICS ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("-------------------------------");

// ✅ Required for Railway/Production (Trust the proxy)
app.set("trust proxy", 1);

// ✅ Relaxed CORS for Debugging (Rule out CORS as the cause)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow everything for now to test connectivity
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Enhanced Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'direct'}`);
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

// ✅ Root route (SIMPLIFIED for debugging)
app.get("/", (req, res) => {
  console.log("Hit Root / route");
  res.status(200).send("🚀 JARVIS Backend is ONLINE");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// ✅ 🔥 FINAL PORT FIX
const PORT = process.env.PORT || 10000;

// Listen on all interfaces (0.0.0.0) which is mandatory for Railway
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`✅ Access it at: https://grateful-learning-production.up.railway.app`);
});