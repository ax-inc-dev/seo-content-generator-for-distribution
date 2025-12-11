// Web Search動作確認テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testWebSearch() {
  console.log('🔍 Web Search動作確認テスト\n');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey!,
    dangerouslyAllowBrowser: true
  });
  
  try {
    // 1. まずWeb search無しで質問
    console.log('1️⃣ Web search無しで質問...');
    const noSearchResponse = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'What was the final score of the Super Bowl that happened in February 2025?',
      reasoning: { effort: 'minimal' }
    });
    
    console.log('Web search無しの回答:');
    const noSearchText = noSearchResponse.output_text || noSearchResponse.output?.[0]?.content?.[0]?.text;
    console.log(noSearchText?.substring(0, 300));
    console.log('\n---\n');
    
    // 2. Web search有りで同じ質問
    console.log('2️⃣ Web search有りで同じ質問...');
    const startTime = Date.now();
    
    const searchResponse = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'What was the final score of the Super Bowl that happened in February 2025? Use web search to find the actual result.',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`処理時間: ${elapsedTime}秒`);
    
    const searchText = searchResponse.output_text || searchResponse.output?.[0]?.content?.[0]?.text;
    console.log('Web search有りの回答:');
    console.log(searchText?.substring(0, 500));
    
    // 3. レスポンスの詳細を確認
    console.log('\n3️⃣ レスポンス詳細:');
    console.log('Response ID:', searchResponse.id);
    console.log('Model:', searchResponse.model);
    
    // ツール使用の証跡を探す
    if (searchResponse.usage) {
      console.log('Usage:', searchResponse.usage);
    }
    
    // reasoning_contentがあるか確認
    if (searchResponse.reasoning_content) {
      console.log('\n推論内容（抜粋）:');
      console.log(searchResponse.reasoning_content.substring(0, 500));
    }
    
    // 4. 違いを比較
    console.log('\n4️⃣ 比較結果:');
    const hasUrl = searchText?.includes('http') || searchText?.includes('www');
    const hasSpecificInfo = searchText?.includes('2025') || searchText?.includes('February');
    const isDifferent = noSearchText !== searchText;
    
    console.log('- URLが含まれている:', hasUrl);
    console.log('- 具体的な2025年の情報:', hasSpecificInfo);
    console.log('- 回答が異なる:', isDifferent);
    
    if (isDifferent && (hasUrl || hasSpecificInfo)) {
      console.log('\n✅ Web searchが動作している証拠があります！');
    } else {
      console.log('\n⚠️ Web searchの動作が確認できません');
    }
    
  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    if (error.response) {
      console.log('詳細:', error.response.data || error.response);
    }
  }
}

// タイムアウトを設定
const timeout = setTimeout(() => {
  console.log('\n⏱️ 60秒経過 - 処理継続中...');
}, 60000);

testWebSearch().then(() => {
  clearTimeout(timeout);
  console.log('\n🏁 テスト完了');
}).catch(console.error);