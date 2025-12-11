// ESModule形式
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(apiKey);

async function testSearchGrounding() {
  console.log('\n🧪 Testing Google Search Grounding...\n');
  
  try {
    // Try with Gemini 2.0 Flash
    console.log('1️⃣ Testing with gemini-2.0-flash-exp...');
    const model2 = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{ googleSearch: {} }]
    });
    
    const result2 = await model2.generateContent("What are the top 3 websites about SEO in 2024? Give me real URLs.");
    const response2 = await result2.response;
    console.log('Response:', response2.text().substring(0, 500));
    
    // Check for grounding metadata
    if (response2.groundingMetadata) {
      console.log('✅ Grounding metadata found!');
    } else {
      console.log('⚠️ No grounding metadata - search may not be working');
    }
    
  } catch (error) {
    console.error('❌ Error with gemini-2.0:', error.message);
  }
  
  try {
    // Try with Gemini 1.5 Flash
    console.log('\n2️⃣ Testing with gemini-1.5-flash...');
    const model1 = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{ googleSearchRetrieval: {} }]
    });
    
    const result1 = await model1.generateContent("What are the top 3 websites about SEO in 2024? Give me real URLs.");
    const response1 = await result1.response;
    console.log('Response:', response1.text().substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error with gemini-1.5:', error.message);
  }
}

testSearchGrounding().catch(console.error);