// タイムアウト問題の比較テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function compareTimeouts() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true
  });
  
  console.log('⏱️ Web searchタイムアウト比較テスト\n');
  
  // 1. 軽量版（推奨設定）
  console.log('1️⃣ 軽量版テスト（nano + medium）');
  const start1 = Date.now();
  try {
    const res1 = await (client as any).responses.create({
      model: 'gpt-5-nano',
      input: 'What is TypeScript 5.7?',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    const time1 = ((Date.now() - start1) / 1000).toFixed(1);
    console.log(`✅ 成功: ${time1}秒\n`);
  } catch (error: any) {
    console.log(`❌ 失敗: ${error.message}\n`);
  }
  
  // 2. 中量版
  console.log('2️⃣ 中量版テスト（mini + medium）');
  const start2 = Date.now();
  try {
    const res2 = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'Search TypeScript 5.7 in Japanese sites',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'medium' }
    });
    const time2 = ((Date.now() - start2) / 1000).toFixed(1);
    console.log(`✅ 成功: ${time2}秒\n`);
  } catch (error: any) {
    console.log(`❌ 失敗: ${error.message}\n`);
  }
  
  // 3. 重量版（タイムアウトリスク）
  console.log('3️⃣ 重量版テスト（mini + high）- 30秒でキャンセル');
  const start3 = Date.now();
  
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
    console.log('⏰ 30秒でキャンセルしました\n');
  }, 30000);
  
  try {
    const res3 = await (client as any).responses.create({
      model: 'gpt-5-mini',
      input: 'Search TypeScript 5.7. Priority: Japanese sources first, then English. Provide detailed analysis.',
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'high' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const time3 = ((Date.now() - start3) / 1000).toFixed(1);
    console.log(`✅ 成功: ${time3}秒\n`);
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.log('⏰ タイムアウト（30秒超過）\n');
    } else {
      console.log(`❌ エラー: ${error.message}\n`);
    }
  }
  
  console.log('📊 推奨設定:');
  console.log('- モデル: gpt-5-nano（高速）');
  console.log('- reasoning.effort: medium（web_search可能な最小設定）');
  console.log('- 予想処理時間: 10-30秒');
}

compareTimeouts().catch(console.error);