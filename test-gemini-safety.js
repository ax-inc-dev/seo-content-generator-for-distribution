// Gemini コンテンツフィルタリングエラーのテスト
// 現在使用されているGoogleGenerativeAIライブラリでテスト

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

async function testGeminiSafety() {
  console.log('🔒 Gemini コンテンツフィルタリング エラーテスト開始\n');

  const env = loadEnv();
  if (!env || !env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  // テスト1: 通常の無害なコンテンツ
  console.log('📝 テスト1: 通常のSEO構成生成（安全なコンテンツ）');
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4000,
        responseMimeType: "application/json"
      }
    });

    const safePrompt = `
あなたはSEOコンテンツプランナーです。
「AI研修 メリット」というキーワードで記事構成案を作成してください。

JSON形式で以下を出力してください：
{
  "title": "記事タイトル",
  "outline": [
    {
      "heading": "見出し1",
      "subheadings": ["サブ見出し1", "サブ見出し2"]
    }
  ]
}`;

    const result = await model.generateContent(safePrompt);
    const responseText = result.response.text();
    console.log('✅ 成功: 安全なコンテンツは正常に処理されました');
    console.log('📄 応答の一部:', responseText.substring(0, 200) + '...\n');

  } catch (error) {
    console.error('❌ 予期しないエラー（安全なコンテンツ）:', error.message);
    console.error('詳細:', error);
  }

  // テスト2: より複雑なプロンプト（潜在的にフィルタリングされる可能性）
  console.log('📝 テスト2: 複雑なプロンプト（実際のoutlineGeneratorV2に近い）');
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 16000,
        responseMimeType: "application/json"
      }
    });

    const complexPrompt = `
あなたはSEOに精通したコンテンツプランナーです。
現在は2025年9月です。必ず最新の2025年の情報を基に構成を作成してください。
以下の要件に従って、「AI導入 課題」の記事構成案を作成してください。

【⚠️ 最重要：絶対禁止事項 ⚠️】
制約条件:
  H2への番号付け禁止:
    - H2に順序番号（1. 2. 3.）を付けない
    - 例外: 「○選」「○つのポイント」型のH2のみ番号OK
    ❌悪い例: "1. AI導入とは？" "2. 導入方法"
    ✅良い例: "AI導入とは？" "おすすめツール12選"

【競合分析データ】
- 上位10記事の平均H2数: 8
- 上位10記事の平均H3数: 12
- 最小H2数（-10%ルール）: 7
- 最小H3数（-10%ルール）: 11

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
    min: 7
    max: 9
    ideal: 8

  H3総数:
    min: 11
    max: 13
    ideal: 12

JSON形式で出力してください：
{
  "title": "タイトル",
  "metaDescription": "メタディスクリプション",
  "outline": [
    {
      "heading": "H2見出し",
      "subheadings": [
        { "text": "H3見出し1" },
        { "text": "H3見出し2" }
      ]
    }
  ]
}`;

    const result = await model.generateContent(complexPrompt);
    const responseText = result.response.text();
    console.log('✅ 成功: 複雑なプロンプトも正常に処理されました');
    console.log('📄 応答の一部:', responseText.substring(0, 300) + '...\n');

  } catch (error) {
    console.error('❌ エラー発生（複雑なプロンプト）:', error.message);

    // コンテンツフィルタリング関連のエラーかチェック
    if (error.message.includes('SAFETY') ||
        error.message.includes('HARM') ||
        error.message.includes('BLOCKED') ||
        error.message.includes('content filter') ||
        error.message.includes('safety filter')) {
      console.error('🚨 コンテンツフィルタリングエラーを検出！');
      console.error('原因: Geminiの安全フィルターがプロンプトをブロックしました');
    }

    console.error('詳細:', error);
  }

  // テスト3: Safety settings を明示的に設定
  console.log('📝 テスト3: Safety Settings を低めに設定してテスト');
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4000,
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

    const testPrompt = `
以下のキーワードで記事構成を作成：「AI 危険性 問題点」

JSON形式で出力：
{
  "title": "記事タイトル",
  "outline": [{"heading": "見出し", "subheadings": ["サブ見出し"]}]
}`;

    const result = await model.generateContent(testPrompt);
    const responseText = result.response.text();
    console.log('✅ 成功: Safety Settings調整により正常に処理されました');
    console.log('📄 応答:', responseText.substring(0, 200) + '...\n');

  } catch (error) {
    console.error('❌ エラー（Safety Settings調整後）:', error.message);
    console.error('詳細:', error);
  }

  console.log('🏁 テスト完了');
}

testGeminiSafety().catch(console.error);