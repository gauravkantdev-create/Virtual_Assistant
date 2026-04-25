import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const DEFAULT_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 15000;
const RETRY_DELAYS_MS = [800, 1600];
const MAX_QUOTA_RETRY_DELAY_MS =
  Number(process.env.GEMINI_MAX_QUOTA_RETRY_DELAY_MS) || 5000;
const QUOTA_COOLDOWN_MS =
  Number(process.env.GEMINI_QUOTA_COOLDOWN_MS) || 15 * 60 * 1000;

let geminiQuotaBlockedUntil = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getModelNames = () => {
  const configuredModels = [
    process.env.GEMINI_MODEL,
    process.env.GEMINI_FALLBACK_MODEL,
  ]
    .flatMap((value) => (value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...configuredModels, ...DEFAULT_MODELS])];
};

const getModel = (modelName) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 260,
    },
  });
};

const knowledgeBase = [
  {
    match: /^(who are you|what are you|what('?s| is) your name|your name)/i,
    response:
      "I am your virtual assistant. I can help with conversation, quick guidance, app navigation, and voice-based interaction.",
  },
  {
    match: /^(what can you do|help me|can you help|how can you help)/i,
    response:
      "I can answer questions, explain topics, help you think through tasks, and guide you around this assistant app. Ask directly in natural language and I will keep the reply clear and concise.",
  },
  {
    match: /\b(what time|current time|what('?s| is) the time|tell me the time)\b/i,
    response: () =>
      `The current time is ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`,
  },
  {
    match: /\b(what('?s| is) the date|what('?s| is) today|today('?s| is) date|date today|day today)\b/i,
    response: () =>
      `Today is ${new Date().toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}.`,
  },
  {
    match: /^(hello|hi|hey|good morning|good afternoon|good evening|good night)$/i,
    response: "Hello! I am ready whenever you are.",
  },
  {
    match: /^(thank you|thanks|thank's)$/i,
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

const getKnowledgeBaseResponse = (userInput) => {
  const normalized = extractUserQuestion(userInput);

  for (const entry of knowledgeBase) {
    if (entry.match.test(normalized)) {
      return typeof entry.response === "function"
        ? entry.response()
        : entry.response;
    }
  }

  return "";
};

const cleanTopic = (topic) =>
  topic
    .replace(/\bplease\b/gi, "")
    .replace(/[?.!,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const getTopicFromQuestion = (userInput) => {
  const normalized = extractUserQuestion(userInput);
  const topic =
    normalized.match(
      /(?:what is|what are|explain|tell me about|help me to know about|help me know about|learn about|about)\s+([\s\S]+)/i
    )?.[1] || "";

  return cleanTopic(topic || normalized);
};

const isLocalFirstQuestion = (userInput) => {
  const normalized = extractUserQuestion(userInput).toLowerCase();
  return /^(what('?s| is| are)|explain|tell me about|help me (to )?know about|learn about|about)\b/.test(
    normalized
  );
};

const getEducationalFallback = (userInput) => {
  const topic = getTopicFromQuestion(userInput);
  const normalizedTopic = topic.toLowerCase();

  const topicResponses = [
    {
      match: /\bpython\b/,
      response:
        "Python is a beginner-friendly programming language used for web development, automation, data analysis, AI, and scripting. Start with variables, conditions, loops, functions, lists, dictionaries, then practice by building small programs.",
    },
    {
      match: /\bjavascript|js\b/,
      response:
        "JavaScript is the programming language of the web. It runs in browsers and Node.js, and it helps you build interactive pages, APIs, apps, and full-stack projects.",
    },
    {
      match: /\bhtml\b/,
      response:
        "HTML is the structure language for web pages. It defines content like headings, paragraphs, links, images, forms, and sections that CSS and JavaScript can style or control.",
    },
    {
      match: /\bcss\b/,
      response:
        "CSS is used to style web pages. It controls layout, colors, spacing, fonts, responsiveness, and animations so HTML content looks polished on different screens.",
    },
    {
      match: /\breact\b/,
      response:
        "React is a JavaScript library for building user interfaces with reusable components. It is commonly used for dashboards, single-page apps, and interactive frontend experiences.",
    },
    {
      match: /\bnode|node\.js\b/,
      response:
        "Node.js lets JavaScript run on the server. It is often used to build APIs, backend services, real-time apps, and tools with packages from npm.",
    },
    {
      match: /\bmongodb|mongo\b/,
      response:
        "MongoDB is a NoSQL database that stores data as flexible documents. It is useful when your app data can change shape over time, such as users, profiles, chats, and app settings.",
    },
  ];

  const matchedTopic = topicResponses.find((entry) =>
    entry.match.test(normalizedTopic)
  );

  if (matchedTopic) {
    return matchedTopic.response;
  }

  // Do NOT return a generic useless message for unknown topics
  return "";
};

const getLocalFallback = (userInput) => {
  const normalized = extractUserQuestion(userInput);
  const knowledgeBaseResponse = getKnowledgeBaseResponse(userInput);

  if (knowledgeBaseResponse) {
    return knowledgeBaseResponse;
  }

  const educationalFallback = getEducationalFallback(userInput);
  if (educationalFallback) {
    return educationalFallback;
  }

  return `I understood your question: "${normalized}". The AI service is temporarily unavailable due to quota limits. Please try again in a few minutes, or try a simpler question.`;
};

const getQuotaFallback = (userInput) => getLocalFallback(userInput);

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

const isRetryableGeminiError = (error) => {
  const message = error?.message || "";
  const status = error?.status || error?.statusCode;
  return status === 429 || status === 503 || /429|503|quota|rate/i.test(message);
};

const isQuotaExceededError = (error) => {
  const message = error?.message || "";
  return /quota exceeded|exceeded your current quota|free_tier_requests/i.test(
    message
  );
};

const rememberQuotaBlock = (error) => {
  const retryDelayMs = getGeminiRetryDelayMs(error);
  geminiQuotaBlockedUntil =
    Date.now() + Math.max(retryDelayMs, QUOTA_COOLDOWN_MS);
};

const getGeminiRetryDelayMs = (error) => {
  const message = error?.message || "";
  const retryInfoDelay =
    message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i)?.[1] ||
    message.match(/retry in (\d+(?:\.\d+)?)s/i)?.[1];

  return retryInfoDelay ? Math.ceil(Number(retryInfoDelay) * 1000) : 0;
};

const generateWithTimeout = async (model, userInput) => {
  const request = model.generateContent(userInput);
  const timeout = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Gemini request timed out")),
      REQUEST_TIMEOUT_MS
    );
  });

  return Promise.race([request, timeout]);
};

const generateGeminiText = async (userInput) => {
  let lastError;

  for (const modelName of getModelNames()) {
    const model = getModel(modelName);
    if (!model) return "";

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        const result = await generateWithTimeout(model, userInput);
        const response = await result.response;
        const text = formatAssistantReply(response.text() || "");

        if (text) return text;
        break;
      } catch (error) {
        lastError = error;
        console.error(
          `Gemini request failed for ${modelName} (attempt ${attempt + 1}):`,
          error.message
        );

        if (isQuotaExceededError(error)) {
          rememberQuotaBlock(error);
          const retryDelayMs = getGeminiRetryDelayMs(error);
          const canRetryQuota =
            attempt === 0 &&
            retryDelayMs > 0 &&
            retryDelayMs <= MAX_QUOTA_RETRY_DELAY_MS;

          if (canRetryQuota) {
            await sleep(retryDelayMs);
            continue;
          }

          break;
        }

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        if (attempt < RETRY_DELAYS_MS.length) {
          await sleep(RETRY_DELAYS_MS[attempt]);
        }
      }
    }
  }

  if (lastError) throw lastError;
  return "";
};

const geminiResponse = async (userInput) => {
  try {
    if (!userInput || !userInput.trim()) {
      return "Please ask a clear question and I will help.";
    }

    // Check knowledge base using the extracted user question only
    const knowledgeBaseResponse = getKnowledgeBaseResponse(userInput);
    if (knowledgeBaseResponse) {
      console.log("📚 Matched knowledge base, returning local answer.");
      return knowledgeBaseResponse;
    }

    // Always try the Gemini API first if available
    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.log("⚠️ No GEMINI_API_KEY set, using local fallback.");
      return getLocalFallback(userInput);
    }

    if (Date.now() < geminiQuotaBlockedUntil) {
      const remainingSec = Math.ceil((geminiQuotaBlockedUntil - Date.now()) / 1000);
      console.log(`⏳ Gemini quota cooldown active (${remainingSec}s remaining), using local fallback.`);
      return getLocalFallback(userInput);
    }

    console.log("🤖 Sending request to Gemini API...");
    const text = await generateGeminiText(userInput);

    if (text) {
      console.log("✅ Gemini API responded successfully.");
      return text;
    }

    console.log("⚠️ Gemini returned empty response, using local fallback.");
    return getLocalFallback(userInput);
  } catch (error) {
    console.error("❌ Gemini request failed:", error.message);

    if (isQuotaExceededError(error)) {
      rememberQuotaBlock(error);
      console.log("🚫 Gemini quota exceeded. Cooldown activated.");
      return getQuotaFallback(userInput);
    }

    return getLocalFallback(userInput);
  }
};

export default geminiResponse;
