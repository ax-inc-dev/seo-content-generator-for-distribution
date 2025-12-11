// nano banana 日本語優先検索
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function searchNanoBananaJapan() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🍌 nano banana を日本語優先で検索\n');
  
  const response = await (client as any).responses.create({
    model: 'gpt-5-mini',
    input: `Search for "nano banana" OR "ナノバナナ" (Google's Gemini 2.5 Flash Image model).
    
PRIORITY: 
1. Japanese sources first (any relevant Japanese websites)
2. International sources as supplement

Provide full article URLs with brief descriptions.`,
    tools: [{ type: 'web_search' }],
    reasoning: { effort: 'high' }
  });
  
  const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
  console.log('検索結果:');
  console.log('━'.repeat(60));
  console.log(result);
  console.log('━'.repeat(60));
  
  // URL分析
  const urls = result?.match(/https?:\/\/[^\s\)]+/g) || [];
  const jpUrls = urls.filter(url => 
    url.includes('.jp') || 
    url.includes('japan') || 
    url.includes('yahoo.co.jp') ||
    url.includes('nikkei.com')
  );
  
  console.log(`\n📊 統計:`);
  console.log(`- 全URL数: ${urls.length}`);
  console.log(`- 日本のサイト: ${jpUrls.length}`);
  
  if (jpUrls.length > 0) {
    console.log('\n🇯🇵 日本のサイト:');
    jpUrls.forEach(url => {
      const cleanUrl = url.replace(/\?utm_source=openai$/, '');
      console.log(`- ${cleanUrl}`);
    });
  }
}

searchNanoBananaJapan().catch(console.error);