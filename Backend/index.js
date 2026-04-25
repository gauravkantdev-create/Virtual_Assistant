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

dotenv.config({ path: path.resolve(__dirname, ".env") });

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
app.use(express.json()); // Parse JSON request body
app.use(cookieParser()); // Parse cookies

// ✅ Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Request Body:", req.body);
  next();
});

// ✅ Connect to Database
connectDb();

// ✅ Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", AuthRoutes);

// ✅ Gemini AI Route
// app.get("/api/gemini", async (req, res) => {
//   try {
//     const prompt = req.query.prompt || "Hello, World!";
//     console.log("🧠 Gemini Prompt:", prompt);

//     const response = await geminiResponse(prompt);

//     res.status(200).json({
//       message: "✅ Gemini response generated successfully!",
//       prompt,
//       response,
//     });
//   } catch (error) {
//     console.error("❌ Gemini API Error:", error.message);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch Gemini response.", error: error.message });
//   }
// });

// ✅ Test Gemini API endpoint (no auth required for testing)
app.get("/test-gemini", async (req, res) => {
  const prompt = req.query.prompt || "What is JavaScript?";
  
  try {
    console.log("🧠 Testing Gemini with prompt:", prompt);
    const response = await geminiResponse(prompt);
    
    res.status(200).json({
      success: true,
      prompt,
      response: response,
    });
  } catch (error) {
    console.error("❌ Test Gemini Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to test Gemini API.", 
      error: error.message 
    });
  }
});

// ✅ Root route with Gemini support
app.get("/", async (req, res) => {
  const prompt = req.query.prompt;
  
  if (prompt) {
    try {
      console.log("🧠 Gemini Prompt:", prompt);
      const response = await geminiResponse(prompt);
      
      res.status(200).json({
        success: true,
        message: "✅ Gemini response generated successfully!",
        prompt,
        response: response,
      });
    } catch (error) {
      console.error("❌ Gemini API Error:", error.message);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch Gemini response.", 
        error: error.message 
      });
    }
  } else {
    res.send("🚀 Backend is running successfully... Use /test-gemini?prompt=your+question to test the assistant");
  }
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app
  .listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err.message);
  });
