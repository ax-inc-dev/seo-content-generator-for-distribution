// OpenAI APIキーのテストスクリプト
// GPT-5とResponses APIへのアクセス権を確認

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
});

async function testAPIAccess() {
  console.log('🔍 OpenAI APIアクセステスト開始\n');
  console.log('================================');
  
  // 1. APIキーの存在確認
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ APIキーが設定されていません');
    return;
  }
  console.log('✅ APIキー検出: ' + apiKey.substring(0, 10) + '...');
  
  // 2. 利用可能なモデルの確認
  console.log('\n📋 利用可能なモデルを確認中...');
  try {
    const models = await openai.models.list();
    const modelIds = models.data.map(m => m.id).sort();
    
    console.log('\n利用可能なモデル一覧:');
    modelIds.forEach(id => {
      // GPT-5関連のモデルをハイライト
      if (id.includes('gpt-5')) {
        console.log(`  🌟 ${id} (GPT-5モデル)`);
      } else if (id.includes('gpt-4')) {
        console.log(`  ✓ ${id}`);
      } else if (id.includes('gpt-3.5')) {
        console.log(`  - ${id}`);
      }
    });
    
    // GPT-5モデルの確認
    const hasGPT5 = modelIds.some(id => id.includes('gpt-5'));
    const hasGPT5Full = modelIds.includes('gpt-5');
    const hasGPT5Mini = modelIds.includes('gpt-5-mini');
    const hasGPT5Nano = modelIds.includes('gpt-5-nano');
    
    console.log('\n================================');
    console.log('🤖 GPT-5モデルアクセス状況:');
    console.log(`  GPT-5 (Full): ${hasGPT5Full ? '✅ 利用可能' : '❌ 利用不可'}`);
    console.log(`  GPT-5-mini: ${hasGPT5Mini ? '✅ 利用可能' : '❌ 利用不可'}`);
    console.log(`  GPT-5-nano: ${hasGPT5Nano ? '✅ 利用可能' : '❌ 利用不可'}`);
    
  } catch (error) {
    console.error('❌ モデルリスト取得エラー:', error.message);
  }
  
  // 3. 簡単なテストリクエスト（GPT-3.5で代替テスト）
  console.log('\n🧪 APIリクエストテスト...');
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Say 'API test successful' in Japanese." }
      ],
      max_tokens: 50
    });
    
    console.log('✅ APIリクエスト成功');
    console.log('レスポンス:', completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ APIリクエストエラー:', error.message);
  }
  
  // 4. アカウント情報の確認（利用制限など）
  console.log('\n💳 アカウント情報...');
  try {
    // 注: OpenAI SDKでは直接的なアカウント情報取得はサポートされていない場合があります
    console.log('アカウント情報の詳細は以下で確認してください:');
    console.log('🔗 https://platform.openai.com/account/usage');
    console.log('🔗 https://platform.openai.com/account/limits');
    
  } catch (error) {
    console.error('アカウント情報取得エラー:', error.message);
  }
  
  console.log('\n================================');
  console.log('📝 推奨事項:');
  console.log('1. GPT-5モデルが表示されない場合:');
  console.log('   - OpenAIダッシュボードでAPIキーの権限を確認');
  console.log('   - GPT-5へのアクセス申請が必要な可能性があります');
  console.log('2. Responses APIについて:');
  console.log('   - /v1/responses エンドポイントへのアクセス権を確認');
  console.log('   - ベータ機能の場合は申請が必要な可能性があります');
  console.log('\n================================');
}

// テスト実行
testAPIAccess().catch(console.error);