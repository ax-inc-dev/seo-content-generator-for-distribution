// nano banana クイック検索（日本語優先）
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function quickSearch() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🍌 nano banana 検索（日本語優先）\n');
  
  const response = await (client as any).responses.create({
    model: 'gpt-5-nano',  // 高速なnanoモデル
    input: 'Search "nano banana" OR "ナノバナナ". Prioritize Japanese sites. List top 3 URLs.',
    tools: [{ type: 'web_search' }],
    reasoning: { effort: 'medium' }
  });
  
  const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
  console.log(result);
  
  // 日本のサイトをカウント
  const urls = result?.match(/https?:\/\/[^\s\)]+/g) || [];
  const jpCount = urls.filter(url => 
    url.includes('.jp') || 
    url.includes('japan') ||
    url.includes('goo.ne') ||
    url.includes('yahoo.co.jp')
  ).length;
  
  console.log(`\n📊 ${urls.length}件中${jpCount}件が日本のサイト`);
}

quickSearch().catch(console.error);