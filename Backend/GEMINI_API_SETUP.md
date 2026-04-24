# Gemini API Setup Guide

## Current Status
✅ Backend is running with mock responses (working)
❌ Gemini API key needs to be configured for real AI responses

## To Get Real Gemini API Responses:

### Step 1: Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Update the .env file
Replace the current API key in `d:\Jarvishmrk2\Backend\.env`:
```
GEMINI_API_KEY="your_actual_api_key_here"
```

### Step 3: Restore Real Gemini Integration
Replace the mock system in `Gemini.js` with the real implementation:

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiResponse = async (userInput) => {
  try {
    if (!userInput || typeof userInput !== 'string') {
      throw new Error("Invalid input: prompt must be a non-empty string");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userInput);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return "I apologize, but I encountered an error while processing your request.";
  }
};
```

### Step 4: Restart the Server
```bash
# Kill current server (Ctrl+C)
# Then restart:
node index.js
```

## Testing
Test the API with:
```bash
curl http://localhost:5000/test-gemini?prompt=Hello
```

## Current Working Mock Responses
- "hello" → "Hello! I'm your virtual assistant. How can I help you today?"
- "hi" → "Hi there! What can I do for you?"
- "how are you" → "I'm doing great, thank you for asking! I'm here to assist you with any questions you have."
- Any other input → Default assistant response

The mock system is working perfectly for testing your frontend integration!
