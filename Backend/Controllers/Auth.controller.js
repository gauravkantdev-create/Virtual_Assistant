import bcrypt from "bcryptjs";
import moment from "moment";
import mongoose from "mongoose";
import genToken from "../Config/Token.js";
import geminiResponse from "../Gemini.js";
import User from "../Models/User.model.js";

export const getCurrentDateTime = () => {
  const now = moment();
  return {
    date: now.format("YYYY-MM-DD"),
    time: now.format("HH:mm:ss"),
    month: now.format("MMMM"),
    fullDateTime: now.format("YYYY-MM-DD HH:mm:ss"),
    dayOfWeek: now.format("dddd"),
  };
};

const getMockUser = () => ({
  _id: "mock_id",
  name: "Offline User",
  email: "offline@example.com",
  assistantName: "",
  assistantImage: "",
});

const isOfflineMode = (userId) =>
  mongoose.connection.readyState !== 1 || userId === "mock_id";

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (isOfflineMode()) {
      const mockToken = genToken("mock_id");
      res.cookie("token", mockToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 86400000,
      });

      return res.status(201).json({
        message: "Offline mode enabled. You can continue using the app locally.",
        user: {
          id: "mock_id",
          name: name || "Offline User",
          email: email || "offline@example.com",
          assistantName: "",
          assistantImage: "",
        },
        token: mockToken,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      assistantName: "",
      assistantImage: "",
    });

    const token = genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isOfflineMode()) {
      const mockToken = genToken("mock_id");
      res.cookie("token", mockToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 86400000,
      });

      return res.status(200).json({
        message: "Offline mode enabled. Signed in locally.",
        user: {
          id: "mock_id",
          name: "Offline User",
          email: email || "offline@example.com",
          assistantName: "",
          assistantImage: "",
        },
        token: mockToken,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        assistantName: user.assistantName || "",
        assistantImage: user.assistantImage || "",
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });
    }

    if (isOfflineMode(req.userId)) {
      return res.status(200).json({ success: true, user: getMockUser() });
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Current user error:", error);
    return res.status(500).json({ message: "Server error while fetching user" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Valid prompt is required" });
    }

    const user = isOfflineMode(req.userId)
      ? getMockUser()
      : await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const currentDateTime = getCurrentDateTime();
    const assistantName = user.assistantName?.trim() || "Assistant";
    const authorName = user.name?.trim() || "User";

    const enhancedPrompt = `
You are a helpful virtual assistant named ${assistantName}.
You are speaking with ${authorName}.
Today is ${currentDateTime.dayOfWeek}, ${currentDateTime.date}, and the current time is ${currentDateTime.time}.

Response rules:
- Answer the user's actual question directly.
- Keep the tone natural, polished, and friendly.
- Use plain text only.
- Reply in 1 to 3 short sentences by default.
- Do not use headings, bullet points, step lists, or code blocks unless the user clearly asks for them.
- Prefer a quick, direct answer over a long explanation.
- If you do not know a live fact, say so clearly instead of inventing it.

User question: ${prompt.trim()}
    `.trim();

    const response = await geminiResponse(enhancedPrompt);
    if (!response || !response.trim()) {
      return res.status(502).json({
        success: false,
        message: "The assistant could not generate a response.",
      });
    }

    return res.status(200).json({
      success: true,
      assistantName,
      response,
    });
  } catch (error) {
    console.error("askToAssistant error:", error);
    return res.status(500).json({
      success: false,
      message: "Error communicating with assistant",
      error: error.message,
    });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, assistantImage } = req.body;

    if (!assistantName || !assistantName.trim()) {
      return res.status(400).json({ message: "Assistant name is required" });
    }

    if (isOfflineMode(req.userId)) {
      return res.status(200).json({
        success: true,
        message: "Assistant updated locally",
        assistant: {
          name: assistantName.trim(),
          image: assistantImage || "",
          createdBy: "Offline User",
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName: assistantName.trim(),
        assistantImage: assistantImage || "",
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Assistant updated successfully",
      assistant: {
        name: user.assistantName,
        image: user.assistantImage,
        createdBy: user.name,
      },
    });
  } catch (error) {
    console.error("Update Assistant error:", error);
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};
