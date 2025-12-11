// 日本語記事優先検索テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function searchWithJapanPriority() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🇯🇵 日本語記事優先検索テスト\n');
  
  try {
    // 1. nano bananaを日本語優先で検索
    console.log('1️⃣ nano banana（日本語記事優先）\n');
    
    const response1 = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: `Search for "nano banana" OR "ナノバナナ" (Google's Gemini 2.5 Flash Image).

IMPORTANT PRIORITY:
1. FIRST: Search for Japanese articles (sites like .jp domains, ITmedia, Impress Watch, CNET Japan, etc.)
2. SECOND: If Japanese articles exist, list them FIRST
3. THIRD: Then add English/international sources as supplementary

Please search in both Japanese and English, but prioritize and list Japanese sources first if available.
Provide full article URLs with titles.`,
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'high' }
    });
    
    const result1 = response1.output_text || response1.output?.[0]?.content?.[0]?.text;
    
    console.log('結果:');
    console.log(result1);
    console.log('\n' + '━'.repeat(60) + '\n');
    
    // 2. 別のトピックでもテスト（GPT-5について）
    console.log('2️⃣ GPT-5（日本語記事優先）\n');
    
    const response2 = await (client as any).responses.create({
      model: 'gpt-5-nano',  // 高速化のためnanoを使用
      input: `Search for information about "GPT-5" with Japanese articles prioritized.

SEARCH PRIORITY:
1. Japanese tech news sites (.jp domains, ITmedia, ASCII, mynavi, etc.) - LIST THESE FIRST
2. English sources as supplementary information - LIST THESE SECOND

Format: 
[Japanese Sources]
- Article title: URL

[International Sources]  
- Article title: URL`,
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    
    const result2 = response2.output_text || response2.output?.[0]?.content?.[0]?.text;
    
    console.log('結果:');
    console.log(result2);
    
    // URLを分析
    console.log('\n\n📊 URL分析:');
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    
    const urls1 = result1?.match(urlPattern) || [];
    const urls2 = result2?.match(urlPattern) || [];
    
    console.log('\nnano banana検索:');
    const jpUrls1 = urls1.filter(url => url.includes('.jp') || url.includes('japan'));
    console.log(`- 日本語サイト: ${jpUrls1.length}件`);
    console.log(`- 全URL: ${urls1.length}件`);
    
    console.log('\nGPT-5検索:');
    const jpUrls2 = urls2.filter(url => url.includes('.jp') || url.includes('japan'));
    console.log(`- 日本語サイト: ${jpUrls2.length}件`);
    console.log(`- 全URL: ${urls2.length}件`);
    
  } catch (error: any) {
    console.error('❌ エラー:', error.message);
  }
}

searchWithJapanPriority();