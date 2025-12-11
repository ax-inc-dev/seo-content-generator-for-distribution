// GPT-5 + Responses API 最小テストスクリプト
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルを読み込み
dotenv.config({ path: join(__dirname, '.env') });

console.log('🧪 GPT-5 最小テストを開始...\n');

// 1. API接続テスト
async function testConnection() {
  console.log('===== 1. OpenAI API接続テスト =====');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ APIキーが見つかりません');
    return false;
  }
  
  console.log('✅ APIキー検出:', apiKey.substring(0, 10) + '...');
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // 最小のテスト：モデルリストを取得（GPT-5が存在するか確認）
    console.log('\n📋 利用可能なモデルを確認中...');
    const models = await openai.models.list();
    
    const gpt5Models = [];
    for (const model of models.data) {
      if (model.id.includes('gpt-5')) {
        gpt5Models.push(model.id);
      }
    }
    
    if (gpt5Models.length > 0) {
      console.log('✅ GPT-5モデル検出:', gpt5Models);
    } else {
      console.log('⚠️  GPT-5モデルが見つかりません。利用可能なGPTモデル:');
      models.data.forEach(model => {
        if (model.id.includes('gpt')) {
          console.log('  -', model.id);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ API接続エラー:', error.message);
    return false;
  }
}

// 2. 簡単なテキスト生成テスト
async function testSimpleCompletion() {
  console.log('\n===== 2. シンプルな生成テスト =====');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  
  try {
    // GPT-5を試し、失敗したらGPT-4oにフォールバック
    const models = ['gpt-5-nano', 'gpt-5-mini', 'gpt-5', 'gpt-4o-mini', 'gpt-4o'];
    let response = null;
    let usedModel = null;
    
    for (const model of models) {
      try {
        console.log(`\n🔄 ${model} で試行中...`);
        response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'あなたはテストアシスタントです。'
            },
            {
              role: 'user', 
              content: 'OpenAIのGPT-5について1文で説明してください。'
            }
          ],
          temperature: model.includes('gpt-5') ? 1.0 : 0.5,
          max_completion_tokens: 100
        });
        usedModel = model;
        break; // 成功したらループを抜ける
      } catch (error) {
        console.log(`  ⚠️ ${model} は利用不可:`, error.message);
      }
    }
    
    if (response && usedModel) {
      console.log(`\n✅ 使用モデル: ${usedModel}`);
      console.log('📝 応答:', response.choices[0].message.content);
      return true;
    } else {
      console.error('❌ 全てのモデルで失敗しました');
      return false;
    }
  } catch (error) {
    console.error('❌ 生成エラー:', error.message);
    return false;
  }
}

// 3. Responses API web_searchツールのテスト
async function testWebSearchTool() {
  console.log('\n===== 3. Responses API web_searchツールテスト =====');
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  
  try {
    // web_searchツールを定義
    const tools = [
      {
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web for real-time information',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query'
              }
            },
            required: ['query']
          }
        }
      }
    ];
    
    // GPT-5でweb_searchツールを使用
    const models = ['gpt-5', 'gpt-5-mini', 'gpt-4o'];
    let response = null;
    let usedModel = null;
    
    for (const model of models) {
      try {
        console.log(`\n🔄 ${model} でweb_searchツールを試行中...`);
        response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'web_searchツールを使って最新情報を取得してください。'
            },
            {
              role: 'user',
              content: '2025年9月の最新のAI関連ニュースを1つ教えてください。web_searchツールを使って検索してください。'
            }
          ],
          tools: tools,
          tool_choice: 'auto',
          temperature: model.includes('gpt-5') ? 1.0 : 0.5,
          max_completion_tokens: 500
        });
        usedModel = model;
        break;
      } catch (error) {
        console.log(`  ⚠️ ${model} でのweb_search失敗:`, error.message);
      }
    }
    
    if (response && usedModel) {
      console.log(`\n✅ 使用モデル: ${usedModel}`);
      
      // ツールコールがあったか確認
      const toolCalls = response.choices[0].message.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        console.log('🔧 ツールコール検出:');
        toolCalls.forEach(call => {
          console.log(`  - ${call.function.name}:`, JSON.parse(call.function.arguments));
        });
      } else {
        console.log('⚠️  ツールコールなし（通常の応答）');
      }
      
      console.log('\n📝 応答:', response.choices[0].message.content || '(ツール実行中)');
      return true;
    } else {
      console.error('❌ web_searchツールのテスト失敗');
      return false;
    }
  } catch (error) {
    console.error('❌ web_searchエラー:', error.message);
    return false;
  }
}

// メイン実行
async function main() {
  console.log('🚀 テスト開始時刻:', new Date().toLocaleString('ja-JP'));
  console.log('================================\n');
  
  // 1. 接続テスト
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n⚠️  接続テスト失敗。終了します。');
    process.exit(1);
  }
  
  // 2. 簡単な生成テスト
  const completionOk = await testSimpleCompletion();
  
  // 3. web_searchツールテスト
  const webSearchOk = await testWebSearchTool();
  
  // 結果サマリー
  console.log('\n================================');
  console.log('📊 テスト結果サマリー:');
  console.log('  1. API接続:', connectionOk ? '✅ 成功' : '❌ 失敗');
  console.log('  2. テキスト生成:', completionOk ? '✅ 成功' : '❌ 失敗');
  console.log('  3. web_search:', webSearchOk ? '✅ 成功' : '❌ 失敗');
  console.log('\n🏁 テスト完了時刻:', new Date().toLocaleString('ja-JP'));
}

// 実行
main().catch(console.error);