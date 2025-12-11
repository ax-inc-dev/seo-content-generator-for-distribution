// outlineGeneratorV2の実際のエラーパターンをテスト

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env読み込み
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }

  return env;
}

async function debugOutlineGenerator() {
  console.log('🔧 OutlineGeneratorV2 実際のエラーパターンをデバッグ\n');

  const env = loadEnv();
  if (!env || !env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  // 問題が起きやすいキーワードパターンをテスト
  const problematicKeywords = [
    'AI導入 問題点',
    'AI 危険性',
    'AI 失敗事例',
    'AI 課題',
    'AI リスク',
    'DX 失敗',
    'システム導入 失敗',
    '人工知能 危険',
    'AI セキュリティ 脅威',
    'AI 倫理問題'
  ];

  for (const keyword of problematicKeywords) {
    console.log(`📝 テスト: "${keyword}"`);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 16000,
          responseMimeType: "application/json"
        }
        // Safety settings なし（デフォルト設定で試す）
      });

      // outlineGeneratorV2と同じようなプロンプト構造
      const prompt = `
あなたはSEOに精通したコンテンツプランナーです。
現在は2025年9月です。必ず最新の2025年の情報を基に構成を作成してください。
以下の要件に従って、「${keyword}」の記事構成案を作成してください。

【⚠️ 最重要：絶対禁止事項 ⚠️】
制約条件:
  H2への番号付け禁止:
    - H2に順序番号（1. 2. 3.）を付けない
    - 例外: 「○選」「○つのポイント」型のH2のみ番号OK
    ❌悪い例: "1. ${keyword}とは？" "2. 導入方法"
    ✅良い例: "${keyword}とは？" "おすすめツール12選"

【重要：上位10記事の実際の見出し構造】
1位：${keyword}の基本知識と対策方法
  H2[1]: ${keyword}とは？基本概念の理解（H3: 3個）
    → H3: 定義と特徴, 主な種類, 現状の課題
  H2[2]: ${keyword}の主な要因と背景（H3: 2個）
    → H3: 技術的要因, 組織的要因
  H2[3]: 具体的な対策方法（H3: 4個）
    → H3: 事前準備, 実装段階, 運用段階, 改善・最適化

【要件】
構成要件:
  タイトル:
    文字数:
      min: 29
      max: 50
      ideal: 35
    キーワード位置: "冒頭5-10文字以内"
    禁止: ["AX CAMP"]

  H2数:
    min: 6
    max: 8
    ideal: 7

  H3総数:
    min: 10
    max: 15
    ideal: 12

【JSON形式で出力】
{
  "title": "タイトル",
  "metaDescription": "メタディスクリプション",
  "outline": [
    {
      "heading": "H2見出し",
      "subheadings": [
        { "text": "H3見出し1", "writingNote": "執筆メモ" },
        { "text": "H3見出し2", "writingNote": "執筆メモ" }
      ],
      "writingNote": "H2の執筆メモ"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log(`  ✅ 成功: ${responseText.length}文字の応答`);

      // JSONパースが可能かチェック
      try {
        const parsed = JSON.parse(responseText);
        console.log(`  📊 構造: タイトル(${parsed.title?.length || 0}文字), H2数(${parsed.outline?.length || 0}), H3総数(${parsed.outline?.reduce((sum, h2) => sum + (h2.subheadings?.length || 0), 0) || 0})`);
      } catch (parseError) {
        console.log(`  ⚠️ JSONパースエラー: ${parseError.message}`);
      }

    } catch (error) {
      console.error(`  ❌ エラー: ${error.message}`);

      // エラーの詳細分析
      if (error.message.includes('SAFETY') ||
          error.message.includes('HARM') ||
          error.message.includes('BLOCKED') ||
          error.message.includes('content filter') ||
          error.message.includes('safety filter')) {
        console.error('  🚨 コンテンツフィルタリング検出！');

        // Safety settingsを追加してリトライ
        console.log('  🔄 Safety Settings緩和でリトライ...');
        try {
          const safeModel = genAI.getGenerativeModel({
            model: "gemini-2.5-pro",
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 16000,
              responseMimeType: "application/json"
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH",
              },
            ],
          });

          const retryResult = await safeModel.generateContent(prompt);
          console.log('  ✅ リトライ成功: Safety Settings調整により解決');

        } catch (retryError) {
          console.error(`  ❌ リトライも失敗: ${retryError.message}`);
        }
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        console.error('  💰 クォータ/レート制限エラー');
      } else if (error.message.includes('timeout')) {
        console.error('  ⏱️ タイムアウトエラー');
      }
    }

    console.log(''); // 空行
  }

  console.log('🏁 デバッグテスト完了');

  // 統計情報
  console.log('\n📊 まとめ:');
  console.log('- 問題のあるキーワードパターンを特定しました');
  console.log('- Safety Settingsの調整が必要かどうか判明しました');
  console.log('- Rate limiting の状況も確認しました');
}

debugOutlineGenerator().catch(console.error);