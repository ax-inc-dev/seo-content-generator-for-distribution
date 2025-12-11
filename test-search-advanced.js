import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(apiKey);

async function testAdvancedSearch() {
  console.log('\n🧪 Testing Google Search with various configurations...\n');
  
  // Test 1: Gemini 2.0 Flash with tools config
  try {
    console.log('1️⃣ Testing gemini-2.0-flash-exp with tools...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 8192,
      }
    });
    
    const result = await model.generateContent(
      "Search Google for 'SEO対策とは' and give me the actual top 3 ranking websites with their real URLs. I need REAL search results, not examples."
    );
    
    const response = await result.response;
    console.log('Response preview:', response.text().substring(0, 500));
    
    // Check for grounding metadata
    if (response.grounding_metadata || response.groundingMetadata) {
      console.log('✅ Grounding metadata found!');
      console.log('Metadata:', response.grounding_metadata || response.groundingMetadata);
    } else {
      console.log('⚠️ No grounding metadata');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: Try with google_search_retrieval (legacy)
  try {
    console.log('\n2️⃣ Testing with google_search_retrieval (legacy)...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{
        google_search_retrieval: {}
      }]
    });
    
    const result = await model.generateContent(
      "Search Google for 'SEO対策とは' and give me the actual top 3 ranking websites with their real URLs."
    );
    
    const response = await result.response;
    console.log('Response preview:', response.text().substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Try with different tool syntax
  try {
    console.log('\n3️⃣ Testing with string syntax...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: "Search Google for 'SEO対策とは' and give me the actual top 3 ranking websites with their real URLs."
        }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 1.0
      }
    });
    
    const response = await result.response;
    console.log('Response preview:', response.text().substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdvancedSearch().catch(console.error);