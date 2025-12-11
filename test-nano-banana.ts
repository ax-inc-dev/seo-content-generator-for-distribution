// nano banana調査テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function searchNanoBanana() {
  console.log('🍌 「nano banana」について調査開始\n');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey!,
    dangerouslyAllowBrowser: true
  });
  
  try {
    console.log('🔍 Web searchツールで「nano banana」を検索中...');
    const startTime = Date.now();
    
    const response = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'What is "nano banana"? Search for the latest information about nano banana. Include any recent news, products, or technologies related to nano banana.',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'high' }
    });
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ 検索時間: ${elapsedTime}秒\n`);
    
    const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
    
    console.log('📊 検索結果:');
    console.log('━'.repeat(50));
    console.log(result);
    console.log('━'.repeat(50));
    
    // メタ情報
    console.log('\n📈 メタ情報:');
    console.log('- Response ID:', response.id);
    console.log('- Model:', response.model);
    
    if (response.usage) {
      console.log('- Input tokens:', response.usage.input_tokens);
      console.log('- Output tokens:', response.usage.output_tokens);
      console.log('- Reasoning tokens:', response.usage.output_tokens_details?.reasoning_tokens);
    }
    
    // URL検出
    const urlPattern = /https?:\/\/[^\s)]+/g;
    const urls = result?.match(urlPattern) || [];
    if (urls.length > 0) {
      console.log('\n🔗 検出されたURL:');
      urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
    }
    
    // 日本語で追加検索
    console.log('\n\n🇯🇵 日本語でも検索...');
    const jpResponse = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: '「ナノバナナ」または「nano banana」について、日本語のウェブサイトも含めて最新情報を検索してください。製品、技術、ニュース、研究など何でも良いので情報を探してください。',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'high' }
    });
    
    const jpResult = jpResponse.output_text || jpResponse.output?.[0]?.content?.[0]?.text;
    
    console.log('📊 日本語検索結果:');
    console.log('━'.repeat(50));
    console.log(jpResult);
    console.log('━'.repeat(50));
    
  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    if (error.response) {
      console.log('詳細:', error.response.data);
    }
  }
}

searchNanoBanana().then(() => {
  console.log('\n✅ 調査完了');
}).catch(console.error);