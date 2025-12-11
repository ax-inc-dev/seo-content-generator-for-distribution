// GPT-5モデルの直接テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function testGPT5() {
  console.log('🧪 GPT-5 直接テスト開始...\n');
  
  const models = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'];
  
  for (const model of models) {
    console.log(`\n📝 テスト中: ${model}`);
    console.log('================================');
    
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Reply with just "GPT-5 is working!" in Japanese.'
          }
        ],
        temperature: 1.0,
        max_completion_tokens: 100
      });
      
      console.log(`✅ ${model} 成功！`);
      console.log('レスポンス:', completion.choices[0].message.content);
      console.log('使用トークン:', completion.usage);
      
    } catch (error) {
      console.error(`❌ ${model} エラー:`, error.message);
      if (error.response) {
        console.error('詳細:', error.response.data);
      }
    }
  }
  
  console.log('\n================================');
  console.log('テスト完了！');
}

testGPT5().catch(console.error);