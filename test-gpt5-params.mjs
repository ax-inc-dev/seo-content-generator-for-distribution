// GPT-5のパラメータ制約テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function testGPT5Parameters() {
  console.log('🧪 GPT-5パラメータテスト\n');
  
  const testCases = [
    { 
      name: 'リファレンス通り（temperature: 1.0, max_completion_tokens）',
      params: {
        temperature: 1.0,
        max_completion_tokens: 100
      }
    },
    {
      name: 'top_pなし',
      params: {
        temperature: 1.0,
        max_completion_tokens: 100
        // top_p削除
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 テスト: ${testCase.name}`);
    console.log('パラメータ:', JSON.stringify(testCase.params, null, 2));
    console.log('---');
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant.'
          },
          {
            role: 'user',
            content: 'Say "test successful" in Japanese.'
          }
        ],
        ...testCase.params
      });
      
      console.log('✅ 成功！');
      console.log('レスポンス:', completion.choices[0].message.content);
      
    } catch (error) {
      console.error('❌ エラー:', error.message);
    }
  }
  
  console.log('\n================================');
  console.log('テスト完了！');
}

testGPT5Parameters().catch(console.error);