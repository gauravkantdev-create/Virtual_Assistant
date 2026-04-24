import express from "express";
import { getCurrentUser, login, signUp, logout, askToAssistant, updateAssistant } from "../Controllers/Auth.controller.js";
import isAuth from "../Middleware/IsAuth.js";
import geminiResponse from "../Gemini.js";

const AuthRouter = express.Router();

// Auth routes
AuthRouter.post("/login", login);
AuthRouter.post("/signup", signUp);
AuthRouter.get("/logout", logout);
AuthRouter.get("/current", isAuth, getCurrentUser);
AuthRouter.post("/ask-assistant", isAuth, askToAssistant);
AuthRouter.put("/update-assistant", isAuth, updateAssistant);

// ✅ Public test endpoint (no auth required)
AuthRouter.post("/test-assistant", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Valid prompt is required" 
      });
    }

    console.log("🧠 Testing assistant with prompt:", prompt);
    
    // Simple prompt for testing
    const testPrompt = `You are a helpful AI assistant. Please provide a clear, informative, and natural response to the following question: ${prompt}`;
    
    const response = await geminiResponse(testPrompt);

    return res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("❌ Test assistant error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error communicating with assistant",
      error: error.message 
    });
  }
});

export default AuthRouter;

