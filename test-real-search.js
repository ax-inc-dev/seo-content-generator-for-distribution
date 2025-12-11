import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testRealSearch() {
  console.log('\n🧪 Testing real search with Gemini...\n');
  
  try {
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
    
    // より詳細なプロンプト
    const prompt = `
Search Google for "SEO対策とは" and analyze the top 10 search results.

For each result, provide:
1. The actual domain name (not vertexaisearch redirect URL)
2. The page title
3. A brief summary

Focus on organic search results only (exclude ads).

Return the information in this JSON format:
{
  "results": [
    {
      "rank": 1,
      "domain": "actual-domain.com",
      "title": "Actual page title",
      "summary": "Brief summary"
    }
  ]
}
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Full response:\n', text);
    
    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        console.log('\n📊 Parsed data:');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('Could not parse JSON');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealSearch().catch(console.error);