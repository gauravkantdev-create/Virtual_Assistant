import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoutes from "./Routes/Auth.Routes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(express.json()); // Parse JSON request body
app.use(cookieParser()); // Parse cookies

// ✅ Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Cookies:", req.cookies);
  console.log("Request Body:", req.body);
  next();
});

// ✅ Routes
app.use("/api/auth", AuthRoutes);

// ✅ Test endpoint
app.get("/", (req, res) => {
  res.send("🚀 Test server is running... Available routes: /api/auth/login, /api/auth/signup, /api/auth/ask-assistant");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Test server started on port ${PORT}`);
  console.log("📝 Available endpoints:");
  console.log("  POST /api/auth/login");
  console.log("  POST /api/auth/signup");
  console.log("  POST /api/auth/ask-assistant (requires auth)");
  console.log("  GET  /api/auth/current (requires auth)");
});
