// nano banana 詳細URL取得テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function searchNanoBananaDetailed() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('🍌 nano banana詳細検索（完全なURL取得）\n');
  
  try {
    const response = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: `Search for "nano banana" (Google's Gemini 2.5 Flash Image model). 
      
IMPORTANT: When citing sources, provide the FULL article URL, not just the domain. 
For example:
- GOOD: https://www.androidcentral.com/apps-software/ai/google-says-nano-banana-drove-in-over-10-million-new-users-to-gemini-app
- BAD: androidcentral.com

Please provide specific article URLs that directly discuss nano banana.`,
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'high' }
    });
    
    const result = response.output_text || response.output?.[0]?.content?.[0]?.text;
    
    console.log('📊 検索結果:');
    console.log('━'.repeat(60));
    console.log(result);
    console.log('━'.repeat(60));
    
    // URLを抽出して表示
    console.log('\n🔗 検出されたURL:');
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const urls = result?.match(urlPattern) || [];
    
    if (urls.length > 0) {
      urls.forEach((url, i) => {
        // クリーンなURLを表示（utm_sourceなどを除去）
        const cleanUrl = url.replace(/\?utm_source=openai$/, '');
        console.log(`\n${i + 1}. ${cleanUrl}`);
        
        // ドメインと記事パスを分離
        try {
          const urlObj = new URL(cleanUrl);
          console.log(`   ドメイン: ${urlObj.hostname}`);
          console.log(`   記事パス: ${urlObj.pathname}`);
        } catch (e) {
          console.log('   URLパース失敗');
        }
      });
    } else {
      console.log('URLが見つかりませんでした');
    }
    
    // 使用トークン数も確認
    if (response.usage) {
      console.log('\n📈 使用統計:');
      console.log(`- 入力トークン: ${response.usage.input_tokens}`);
      console.log(`- 出力トークン: ${response.usage.output_tokens}`);
    }
    
  } catch (error: any) {
    console.error('❌ エラー:', error.message);
  }
}

searchNanoBananaDetailed();