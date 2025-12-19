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

#### 3. アプリを起動

**基本モード（2つのターミナル）**

| ターミナル | コマンド | ポート |
|-----------|---------|-------|
| 1 | `npm run dev` | http://localhost:5176/ |
| 2 | `cd server && node scraping-server.js` | http://localhost:3001/ |

**フル自動モード（3つのターミナル）**

フル自動モードでAI画像生成まで行う場合は、画像生成エージェントも起動してください：

| ターミナル | コマンド | ポート |
|-----------|---------|-------|
| 1 | `npm run dev` | http://localhost:5176/ |
| 2 | `cd server && node scraping-server.js` | http://localhost:3001/ |
| 3 | `cd ai-article-imager-for-wordpress && npm install && npm run dev` | http://localhost:5177/ |

#### 4. 動作確認

以下が正常に動作していることを確認してください：

| URL | 用途 | 期待される結果 |
|-----|------|--------------|
| http://localhost:5176/ | メインアプリ | アプリ画面が表示される |
| http://localhost:3001/api/health | スクレイピング | `{"status":"ok",...}` が返る |
| http://localhost:5177/ | 画像生成（フル自動時のみ） | 画像生成画面が表示される |

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
