// Responses API最小テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testResponsesAPI() {
  console.log('🧪 Responses API最小テスト開始\n');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ APIキーが見つかりません');
    return;
  }
  
  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  
  try {
    console.log('1️⃣ シンプルなResponses APIコール...');
    const response = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'Hello, what is 2+2?',
      reasoning: { effort: 'minimal' }
    });
    
    console.log('✅ 成功！');
    console.log('Response ID:', response.id);
    console.log('Output:', response.output_text || response.output?.[0]?.content?.[0]?.text);
    
    // Web searchツールのテスト
    console.log('\n2️⃣ Web searchツール付きテスト...');
    const searchResponse = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'What is the latest news about TypeScript in 2025?',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    
    console.log('✅ Web search成功！');
    console.log('Response:', searchResponse.output_text?.substring(0, 200) || searchResponse.output?.[0]?.content?.[0]?.text?.substring(0, 200));
    
  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    if (error.status === 404) {
      console.log('→ responses.createメソッドが見つかりません');
      console.log('→ OpenAI SDKが古い可能性があります');
    }
    if (error.status === 400) {
      console.log('→ パラメータエラー:', error.error);
    }
  }
}

testResponsesAPI();