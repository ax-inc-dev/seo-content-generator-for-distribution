// Standalone test for Gemini API connectivity
// Run this with: node test-gemini-api.js

import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
  
  return env;
}

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API connectivity...\n');
  
  // Load environment variables
  const env = loadEnv();
  if (!env) {
    process.exit(1);
  }
  
  const apiKey = env.GEMINI_API_KEY;
  
  console.log('📋 Environment Check:');
  console.log('- .env file found:', '✅');
  console.log('- GEMINI_API_KEY exists:', apiKey ? '✅' : '❌');
  console.log('- API key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  console.log('- API key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY not found in .env file');
    console.error('Please make sure your .env file contains:');
    console.error('GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  try {
    console.log('\n🔌 Testing API connection...');
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Please respond with 'API connection successful' to confirm connectivity.",
      config: {
        temperature: 0.1,
      },
    });
    
    const responseText = response.text;
    console.log('✅ API Response:', responseText);
    console.log('\n✅ Gemini API is working correctly!');
    
    // Test with a more complex request
    console.log('\n🔍 Testing complex request...');
    const complexResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a simple JSON object with properties: title (string), description (string), and number (integer from 1-10)",
      config: {
        temperature: 0.3,
      },
    });
    
    console.log('✅ Complex Response:', complexResponse.text);
    console.log('\n🎉 All tests passed! Your Gemini API configuration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.error('\n💡 Solution: Check if your API key is correct and active');
      console.error('   - Visit: https://makersuite.google.com/app/apikey');
      console.error('   - Verify your API key is enabled for Gemini API');
    }
    
    if (error.message.includes('quota')) {
      console.error('\n💡 Solution: API quota exceeded');
      console.error('   - Check your usage at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com');
    }
    
    if (error.message.includes('permission')) {
      console.error('\n💡 Solution: Permission denied');
      console.error('   - Make sure the API key has the correct permissions');
      console.error('   - Enable the Generative AI API in your Google Cloud project');
    }
    
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  }
}

testGeminiAPI();