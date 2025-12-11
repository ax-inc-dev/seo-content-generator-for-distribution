import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testGroundingLimits() {
  console.log('\n🔬 Testing Google Search Grounding Limitations...\n');
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    tools: [{
      googleSearch: {}
    }],
    generationConfig: {
      temperature: 0.1, // 低温度で事実に基づく回答を促す
      maxOutputTokens: 8192,
    }
  });
  
  // Test 1: 検索結果のメタデータ取得
  console.log('Test 1: Can we get search result metadata?');
  try {
    const result1 = await model.generateContent(
      "Search for 'SEO対策とは 株式会社PLAN-B' and tell me ONLY what you can actually see from the search results. Do NOT guess or generate content."
    );
    console.log('Response:', result1.response.text().substring(0, 500));
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 2: ページコンテンツの取得
  console.log('\nTest 2: Can we get actual page content?');
  try {
    const result2 = await model.generateContent(
      "Search for 'SEO対策とは 株式会社PLAN-B' and tell me the EXACT H2 headings from the first result page. If you cannot access the actual page content, say 'CANNOT ACCESS PAGE CONTENT'."
    );
    console.log('Response:', result2.response.text().substring(0, 500));
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 3: 文字数カウント
  console.log('\nTest 3: Can we count actual characters?');
  try {
    const result3 = await model.generateContent(
      "Search for 'SEO対策とは 株式会社PLAN-B' and tell me the EXACT character count of the main content. If you cannot count it, say 'CANNOT COUNT - ESTIMATION ONLY'."
    );
    console.log('Response:', result3.response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 4: グラウンディングメタデータの確認
  console.log('\nTest 4: What grounding metadata is available?');
  try {
    const result4 = await model.generateContent(
      "Search for 'SEO対策とは' and return what information is available in the search results."
    );
    
    const response = result4.response;
    console.log('Response text:', response.text().substring(0, 300));
    
    // メタデータをチェック
    const metadata = response.groundingMetadata || response.grounding_metadata;
    if (metadata) {
      console.log('\n📊 Grounding Metadata Found:');
      console.log(JSON.stringify(metadata, null, 2).substring(0, 500));
    } else {
      console.log('\n⚠️ No grounding metadata available');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGroundingLimits().catch(console.error);