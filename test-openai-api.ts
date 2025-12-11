// OpenAI API接続テスト
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testOpenAIConnection() {
  console.log('🔍 OpenAI API接続テスト開始\n');
  
  // 1. APIキーの確認
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('1️⃣ APIキー設定:', apiKey ? `✅ 設定済み (${apiKey.substring(0, 10)}...)` : '❌ 未設定');
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEYが設定されていません');
    return;
  }
  
  // 2. OpenAIクライアントの初期化
  const openai = new OpenAI({ apiKey });
  console.log('2️⃣ OpenAIクライアント:', '✅ 初期化完了');
  
  // 3. 通常のChat Completions APIテスト
  console.log('\n3️⃣ Chat Completions APIテスト...');
  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "API works"' }],
      max_tokens: 10
    });
    console.log('   ✅ Chat API動作確認:', chatResponse.choices[0].message.content);
  } catch (error: any) {
    console.error('   ❌ Chat APIエラー:', error.message);
  }
  
  // 4. Responses API（GPT-5）のテスト
  console.log('\n4️⃣ Responses API (GPT-5) テスト...');
  try {
    // responses.createメソッドが存在するか確認
    const hasResponsesAPI = (openai as any).responses?.create;
    console.log('   responses.create存在:', hasResponsesAPI ? '✅ あり' : '❌ なし');
    
    if (hasResponsesAPI) {
      // GPT-5 APIを呼び出してみる
      const response = await (openai as any).responses.create({
        model: 'gpt-5-nano',
        input: 'Return a JSON object with a test field',
        text: {
          format: { type: 'json_object' },
          verbosity: 'medium'
        },
        reasoning: { 
          effort: 'minimal'
        }
      });
      console.log('   ✅ Responses API成功:', response);
    } else {
      console.log('   ℹ️ Responses APIはOpenAIクライアントに存在しません');
      console.log('   📌 利用可能なメソッド:', Object.keys(openai).join(', '));
      
      // OpenAIオブジェクトの構造を詳しく調べる
      console.log('\n   🔍 OpenAIクライアント構造:');
      for (const key of Object.keys(openai)) {
        const value = (openai as any)[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`     - ${key}:`, Object.keys(value).slice(0, 5).join(', '), '...');
        }
      }
    }
  } catch (error: any) {
    console.error('   ❌ Responses APIエラー:', error.message);
    if (error.response) {
      console.error('   📝 エラー詳細:', error.response.data || error.response);
    }
  }
  
  // 5. モデルリストの確認
  console.log('\n5️⃣ 利用可能なモデル確認...');
  try {
    const models = await openai.models.list();
    const modelNames = models.data.map(m => m.id);
    console.log('   📋 モデル数:', modelNames.length);
    
    // GPT-5系のモデルを探す
    const gpt5Models = modelNames.filter(name => name.includes('gpt-5'));
    if (gpt5Models.length > 0) {
      console.log('   ✅ GPT-5モデル:', gpt5Models.join(', '));
    } else {
      console.log('   ℹ️ GPT-5モデルは見つかりませんでした');
      console.log('   📌 GPT-4系モデル:', modelNames.filter(n => n.includes('gpt-4')).slice(0, 5).join(', '));
    }
  } catch (error: any) {
    console.error('   ❌ モデルリスト取得エラー:', error.message);
  }
}

// テスト実行
testOpenAIConnection().then(() => {
  console.log('\n✅ テスト完了');
}).catch(error => {
  console.error('\n❌ テストエラー:', error);
});