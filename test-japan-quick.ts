// 日本語優先クイックテスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function quickJapanTest() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🇯🇵 日本語記事優先テスト（AI研修）\n');
  
  const response = await (client as any).responses.create({
    model: 'gpt-5-nano',
    input: `Search for "AI研修" (AI training/education services in Japan).
Priority: Japanese websites first (.jp, ITmedia, etc.), then English.
List top 3 sources with full URLs.`,
    tools: [{ type: 'web_search' }],
    reasoning: { effort: 'medium' }
  });
  
  const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
  console.log(result);
  
  // URL分析
  const urls = result?.match(/https?:\/\/[^\s\)]+/g) || [];
  const jpCount = urls.filter(url => url.includes('.jp') || url.includes('japan')).length;
  
  console.log(`\n📊 ${urls.length}件中${jpCount}件が日本のサイト`);
}

quickJapanTest().catch(console.error);