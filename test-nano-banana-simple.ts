// nano banana シンプル調査
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function searchNanoBanana() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🍌 nano banana検索開始...\n');
  
  try {
    const response = await (client as any).responses.create({
      model: 'gpt-5-nano',  // より高速なnanoモデルを使用
      input: 'Search for "nano banana" and tell me what it is in one paragraph.',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    
    const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
    
    console.log('結果:');
    console.log(result);
    
    // URLが含まれているか確認
    const hasUrl = result?.includes('http') || result?.includes('.com') || result?.includes('.org');
    console.log('\n出典URL含む:', hasUrl);
    
  } catch (error: any) {
    console.error('エラー:', error.message);
  }
}

searchNanoBanana();