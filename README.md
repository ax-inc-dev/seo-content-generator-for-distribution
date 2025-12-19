# SEO Content Generator

SEOコンテンツの構成・記事を自動生成するツールです。

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [デプロイマニュアル](docs/DEPLOY_MANUAL.md) | Google Cloud Runへのデプロイ手順 |
| [カスタマイズガイド](docs/CUSTOMIZATION_GUIDE.md) | 自社用にカスタマイズする方法 |

---

## ローカル環境での実行

### 必要なもの

- Node.js（v18以上推奨）
- Gemini APIキー
- Google Search APIキー + カスタム検索エンジンID

### セットアップ手順

#### 1. 依存パッケージをインストール

```bash
npm install
```

#### 2. 環境変数を設定

```bash
cp .env.example .env
```

`.env` ファイルを開いて、以下のAPIキーを設定してください：

```env
# 必須: Gemini API（Google AI Studioで取得）
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# 必須: Google Search API（競合調査機能に必要）
GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

#### 3. アプリを起動（2つのターミナルが必要）

**ターミナル1: メインアプリ**
```bash
npm run dev
```
→ http://localhost:5176/ で起動

**ターミナル2: スクレイピングサーバー**
```bash
cd server && node scraping-server.js
```
→ http://localhost:3001/ で起動

#### 4. 動作確認

以下の両方が正常に動作していることを確認してください：

| URL | 期待される結果 |
|-----|--------------|
| http://localhost:5176/ | アプリ画面が表示される |
| http://localhost:3001/api/health | `{"status":"ok",...}` が返る |

---

## 主な機能

- キーワードからSEO記事構成を自動生成
- 記事の自動執筆（Gemini 2.5 Pro使用）
- 最終校閲・ファクトチェック
- AI画像生成
- WordPress自動投稿
- スプレッドシート連携による一括処理

---

## トラブルシューティング

### 「Puppeteer not available」エラーが出る

スクレイピングサーバーが起動していません。別ターミナルで以下を実行：

```bash
cd server && node scraping-server.js
```

### スクレイピングサーバーが起動しない

`npm run server` ではなく、直接起動してください：

```bash
cd server && node scraping-server.js
```

### APIキーのエラーが出る

`.env` ファイルに正しいAPIキーが設定されているか確認してください。
