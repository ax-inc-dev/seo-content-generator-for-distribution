// GPT-5レスポンステスト（最終校閲のシミュレーション）
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// 実際の最終校閲エージェントと同じシステムプロンプト（簡略版）
const SYSTEM_PROMPT = `
あなたは日本語のテック/生成AI記事に特化した校閲・事実検証エージェントです。
最優先は事実誤りのゼロ化です。
出力は5部構成：corrected_html / references_html / change_log / factcheck_report / uncertainties。
`;

async function testProofread() {
  console.log('🧪 GPT-5 最終校閲レスポンステスト\n');
  
  const testArticle = `
<h2>生成AIの基本</h2>
<p>GPT-4は2023年3月にリリースされたOpenAIの最新モデルです。</p>
<p>処理速度は従来の10倍向上しています。</p>
  `;
  
  const userPrompt = `
# 入力
- 記事本文（HTML断片）:
${testArticle}

- ターゲットキーワード: 生成AI
- 目的：事実誤り率の最小化

# やること
1) 主張抽出（C001..）→ 影響度付け
2) 事実確認
3) 本文を最小編集で修正
4) 5部構成で返してください

## corrected_html
（修正後のHTML）

## references_html
（参考文献）

## change_log
（変更履歴）

## factcheck_report
（ファクトチェック表）

## uncertainties
（不確実な点）
`;

  try {
    console.log('📝 リクエスト送信中...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 1.0,
      max_completion_tokens: 10000  // 推論トークンを考慮して大きめに
    });
    
    console.log('✅ レスポンス受信！');
    console.log('---レスポンス詳細---');
    console.log('choices数:', completion.choices.length);
    
    if (completion.choices[0]) {
      const message = completion.choices[0].message;
      console.log('role:', message.role);
      console.log('content長:', message.content?.length || 0);
      console.log('finish_reason:', completion.choices[0].finish_reason);
      
      if (message.content) {
        console.log('\n--- コンテンツ ---');
        console.log(message.content);
      } else {
        console.log('\n⚠️ コンテンツが空です');
      }
    }
    
    console.log('\n--- 使用トークン ---');
    console.log(completion.usage);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.response) {
      console.error('詳細:', error.response.data);
    }
  }
}

testProofread().catch(console.error);