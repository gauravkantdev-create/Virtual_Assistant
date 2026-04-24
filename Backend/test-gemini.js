import geminiResponse from './Gemini.js';
import dotenv from 'dotenv';

dotenv.config();

// Test the Gemini API directly
const testGemini = async () => {
  try {
    console.log('🧠 Testing Gemini API with "What is JavaScript?"...');
    
    const response = await geminiResponse("What is JavaScript?");
    
    console.log('✅ Success! Response:');
    console.log(response);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testGemini();
