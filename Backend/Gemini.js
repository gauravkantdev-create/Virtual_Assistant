import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 260,
    },
  });
};

const knowledgeBase = [
  {
    match: /^(who are you|what are you|what is your name|your name)$/i,
    response:
      "I am your virtual assistant. I can help with conversation, quick guidance, app navigation, and voice-based interaction.",
  },
  {
    match: /^(what can you do|help me|can you help|how can you help)$/i,
    response:
      "I can answer questions, explain topics, help you think through tasks, and guide you around this assistant app. Ask directly in natural language and I will keep the reply clear and concise.",
  },
  {
    match: /^(time|current time|what time is it)$/i,
    response: () =>
      `The current time is ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`,
  },
  {
    match: /^(date|today|day today|what is today's date|what is the date today)$/i,
    response: () =>
      `Today is ${new Date().toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}.`,
  },
  {
    match: /^(hello|hi|hey|good morning|good evening)$/i,
    response: "Hello. I am ready whenever you are.",
  },
  {
    match: /^(thank you|thanks)$/i,
    response: "You are welcome. Let me know what you would like next.",
  },
  {
    match: /joke/i,
    response:
      "Here is one: Why did the developer go broke? Because he used up all his cache.",
  },
];

const extractUserQuestion = (userInput) => {
  const normalized = userInput.trim();
  const explicitQuestion =
    normalized.match(/User question:\s*([\s\S]*)$/i)?.[1]?.trim() ||
    normalized.match(/following question:\s*([\s\S]*)$/i)?.[1]?.trim();

  return explicitQuestion || normalized;
};

const getLocalFallback = (userInput) => {
  const normalized = extractUserQuestion(userInput);

  for (const entry of knowledgeBase) {
    if (entry.match.test(normalized)) {
      return typeof entry.response === "function"
        ? entry.response()
        : entry.response;
    }
  }

  return `I understood your request about "${normalized}". I can still help with app usage, short explanations, planning, and voice responses here. For deeper general-knowledge answers, make sure the Gemini API key is configured and reachable.`;
};

const formatAssistantReply = (text) => {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*#_`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const sentenceMatches = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  return sentenceMatches.slice(0, 3).join(" ").trim();
};

const geminiResponse = async (userInput) => {
  try {
    if (!userInput || !userInput.trim()) {
      return "Please ask a clear question and I will help.";
    }

    const model = getModel();
    if (!model) {
      return getLocalFallback(userInput);
    }

    const result = await model.generateContent(userInput);
    const response = await result.response;
    const text = formatAssistantReply(response.text() || "");

    if (text) {
      return text;
    }

    return getLocalFallback(userInput);
  } catch (error) {
    console.error("Gemini request failed:", error.message);

    if (error.message?.includes("429")) {
      return "The AI service is temporarily rate-limited right now. Please try again in a few moments.";
    }

    return getLocalFallback(userInput);
  }
};

export default geminiResponse;
