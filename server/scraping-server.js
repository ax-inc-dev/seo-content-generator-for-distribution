// スクレイピングサーバー
// 役割：URLを受け取って、実際のH2/H3タグを正確に取得する

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// 環境に応じてPuppeteerパッケージを使い分け
const puppeteer =
  process.env.NODE_ENV === "production"
    ? require("puppeteer-core") // 本番環境：軽量版
    : require("puppeteer"); // 開発環境：Chromium付き
const fetch = require("node-fetch");
const path = require("path");
const chromium = require("@sparticuz/chromium");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3001; // Renderでは環境変数PORTを使用

// Renderのプロキシ設定（Rate Limitingエラー対策）
app.set("trust proxy", true);

// セキュリティヘッダー設定
app.use(
  helmet({
    contentSecurityPolicy: false, // Puppeteerとの互換性のため無効化
  })
);

// CORS設定（許可するオリジンのみ）
const allowedOrigins = [
  // ローカル開発環境
  "http://localhost:5176",
  "http://127.0.0.1:5176",
  "http://localhost:5177", // 画像生成エージェント
  "http://127.0.0.1:5177",
  // 環境変数で追加設定（本番環境用）
  process.env.PRODUCTION_DOMAIN,   // 本番ドメイン
  process.env.SEO_FRONTEND_URL,    // SEOエージェントのURL
  process.env.IMAGE_AGENT_URL,     // 画像生成エージェントのURL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // originがundefinedの場合（同じサーバーからのリクエスト）は許可
      if (!origin) return callback(null, true);

      // 許可されたオリジンリストをチェック
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Vercelの動的ドメインを許可（*.vercel.app）
      if (origin.endsWith(".vercel.app")) {
        console.log(`✅ Vercel domain allowed: ${origin}`);
        return callback(null, true);
      }

      // 本番環境では追加のドメインパターンをチェック
      if (process.env.NODE_ENV === "production") {
        // 必要に応じて他のドメインパターンを追加
        const allowedPatterns = [
          /^https:\/\/.*\.vercel\.app$/,
          /^https:\/\/.*\.netlify\.app$/,
        ];

        for (const pattern of allowedPatterns) {
          if (pattern.test(origin)) {
            console.log(`✅ Pattern matched domain allowed: ${origin}`);
            return callback(null, true);
          }
        }
      }

      console.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24時間キャッシュ
  })
);

// JSONペイロードのサイズ制限を50MBに設定（画像のbase64データ対応）
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// リクエストログミドルウェア
app.use((req, res, next) => {
  console.log(
    `📥 ${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`
  );
  next();
});

// Rate Limiting（レート制限）
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Render環境でのtrust proxy警告を回避
  trustProxy: process.env.NODE_ENV === "production" ? 1 : false,
  keyGenerator: (req) => {
    // プロダクション環境では実際のIPを使用、開発環境では固定値
    return process.env.NODE_ENV === "production"
      ? req.ip || req.connection.remoteAddress || "unknown"
      : "dev-key";
  },
});

// 認証ミドルウェア（APIキー認証）
const authenticate = (req, res, next) => {
  console.log(`🔐 Auth check for: ${req.method} ${req.path}`);
  console.log(`🔐 Request IP: ${req.ip}`);
  console.log(
    `🔐 API Key provided: ${req.headers["x-api-key"] ? "YES" : "NO"}`
  );

  // ヘルスチェックとWordPress設定取得は認証不要
  if (req.path === "/health" || req.path === "/wordpress/config") {
    console.log(`🔐 ${req.path} - skipping auth`);
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.INTERNAL_API_KEY;

  if (!validApiKey) {
    console.error("⚠️ INTERNAL_API_KEY が設定されていません");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!apiKey || apiKey !== validApiKey) {
    console.warn(
      `🚫 認証失敗: ${req.ip} - ${req.path} - API Key: ${
        apiKey ? "PROVIDED_BUT_INVALID" : "NOT_PROVIDED"
      }`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log(`✅ 認証成功: ${req.ip} - ${req.path}`);
  next();
};

// 全APIエンドポイントに認証とRate Limitingを適用
app.use("/api", authenticate);
app.use("/api", apiLimiter);

// Google Search API設定
const GOOGLE_API_KEY =
  process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID =
  process.env.GOOGLE_SEARCH_ENGINE_ID ||
  process.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

// ブラウザインスタンスを保持（高速化のため）
let browser = null;

// 記事完了ベースの再起動カウンター
let articlesCompleted = 0;
const RESTART_AFTER_ARTICLES =
  parseInt(process.env.RESTART_AFTER_ARTICLES) || 1; // 1記事ごとに再起動

// URL検証関数（SSRF攻撃対策）
function isValidUrl(url) {
  try {
    const parsed = new URL(url);

    // HTTPまたはHTTPSのみ許可
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        valid: false,
        error: "無効なプロトコルです。httpまたはhttpsのみ許可されています。",
      };
    }

    // hostnameの取得
    const hostname = parsed.hostname.toLowerCase();

    // プライベートIPアドレスとlocalhostをブロック（SSRF対策）
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // リンクローカル
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
      /^fe80:/, // IPv6 link-local
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(hostname)) {
        return {
          valid: false,
          error: "内部ネットワークへのアクセスは許可されていません。",
        };
      }
    }

    // URLの長さ制限（DoS対策）
    if (url.length > 2048) {
      return { valid: false, error: "URLが長すぎます。" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "無効なURL形式です。" };
  }
}

// メモリ使用量をログ出力
function logMemoryUsage(context = "") {
  const memUsage = process.memoryUsage();
  console.log(`📊 メモリ使用量 ${context}:`, {
    rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
  });

  // 警告レベル（400MB以上）
  if (memUsage.rss > 400 * 1024 * 1024) {
    console.warn("⚠️ メモリ使用量が400MBを超過しています");
  }
}

// ブラウザを起動
async function initBrowser() {
  logMemoryUsage("ブラウザ起動前");
  // 既存のブラウザインスタンスのチェックはそのまま
  if (browser) {
    try {
      await browser.version();
      return browser; // 正常ならそのまま返す
    } catch (e) {
      console.log("⚠️ ブラウザが閉じていたため再起動します");
      browser = null;
    }
  }

  if (!browser) {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // 本番環境：@sparticuz/chromium を使用
      console.log("🚀 Puppeteer (with @sparticuz/chromium) を起動中...");
      try {
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
          protocolTimeout: 60000, // 60秒のタイムアウト
        });
        console.log("✅ @sparticuz/chromium ブラウザ起動完了");
        const browserVersion = await browser.version();
        console.log(`✅ 使用中のブラウザ: ${browserVersion}`);
        logMemoryUsage("ブラウザ起動後");
      } catch (error) {
        console.error("❌ @sparticuz/chromium 起動エラー:", error);
        return null;
      }
    } else {
      // 開発環境：通常のpuppeteer を使用
      console.log("🚀 Puppeteer (開発環境) を起動中...");
      try {
        browser = await puppeteer.launch({
          headless: true,
          ignoreHTTPSErrors: true,
          protocolTimeout: 60000, // 60秒のタイムアウト
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
          ],
        });
        console.log("✅ 開発環境ブラウザ起動完了");
        const browserVersion = await browser.version();
        console.log(`✅ 使用中のブラウザ: ${browserVersion}`);
        logMemoryUsage("ブラウザ起動後");
      } catch (error) {
        console.error("❌ 開発環境Puppeteer起動エラー:", error);
        return null;
      }
    }
  }
  return browser;
}

// スクレイピング処理
async function scrapeHeadings(url) {
  // PDFファイルの場合は特別処理
  if (url.toLowerCase().endsWith(".pdf") || url.includes(".pdf?")) {
    console.log(`📑 PDFファイル検出: ${url}`);
    return {
      success: false,
      data: {
        h1: "PDFコンテンツ",
        h2Items: [
          {
            text: "PDFファイルはHTML構造を持たないため、見出し構造を抽出できません",
            h3Items: [],
          },
        ],
        characterCount: 0,
      },
      error: "PDF file cannot be scraped for HTML structure",
    };
  }

  const browser = await initBrowser();

  // ブラウザの初期化に失敗した場合のフォールバック
  if (!browser) {
    console.warn(
      `⚠️ Puppeteerが利用できません。フォールバック処理を実行: ${url}`
    );
    return {
      success: false,
      data: {
        h1: "スクレイピング不可",
        h2Items: [
          {
            text: "Puppeteerが利用できないため、見出し構造を取得できませんでした",
            h3Items: [],
          },
        ],
        characterCount: 0,
      },
      error: "Puppeteer not available",
    };
  }

  // 🚀 新しいコンテキストを作成（メモリリーク対策）
  let context = null;
  let page = null;

  try {
    // 🚀 Render環境では通常のページ作成を使用（安定性重視）
    console.log(`🧠 新しいページを作成中...`);
    page = await browser.newPage();
    console.log(`📄 スクレイピング開始: ${url}`);

    // メモリ使用量を監視
    const memBefore = process.memoryUsage();
    const usedMBBefore = Math.round(memBefore.heapUsed / 1024 / 1024);
    console.log(`🧠 処理前メモリ: ${usedMBBefore}MB | 新コンテキスト作成`);

    // 🚀 リソースブロック機能を有効化（メモリ・通信量を大幅削減）
    try {
      await page.setRequestInterception(true);

      page.on("request", (request) => {
        try {
          const resourceType = request.resourceType();
          const blockedTypes = ["image", "stylesheet", "font", "media"];

          if (blockedTypes.includes(resourceType)) {
            // 不要なリソースをブロック
            request.abort();
          } else {
            // HTML、JavaScript、XHRのみ許可
            request.continue();
          }
        } catch (requestError) {
          console.log(
            `⚠️ リクエスト処理エラー（無視）: ${requestError.message}`
          );
          // エラーが発生した場合はリクエストを続行
          try {
            request.continue();
          } catch (continueError) {
            // 既に処理済みの場合は無視
          }
        }
      });

      console.log(`🛡️ リソースブロック有効: 画像・CSS・フォントをブロック`);
    } catch (interceptError) {
      console.log(
        `⚠️ リクエストインターセプション設定失敗（続行）: ${interceptError.message}`
      );
    }

    // ページにアクセス（タイムアウト時間を環境変数で制御）
    const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS) || 60000; // デフォルト60秒に短縮
    console.log(`⏰ タイムアウト設定: ${TIMEOUT_MS / 1000}秒`);

    // ページアクセスを安全に実行
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded", // networkidle2から変更（より安定）
        timeout: TIMEOUT_MS,
      });
      console.log(`✅ ページアクセス成功: ${url}`);
    } catch (gotoError) {
      // タイムアウトやネットワークエラーの場合は再試行
      if (
        gotoError.message.includes("timeout") ||
        gotoError.message.includes("net::")
      ) {
        console.log(`⚠️ 初回アクセス失敗、再試行中: ${gotoError.message}`);
        await page.goto(url, {
          waitUntil: "load", // より緩い条件で再試行
          timeout: 30000, // 30秒で再試行
        });
        console.log(`✅ 再試行でページアクセス成功: ${url}`);
      } else {
        throw gotoError; // その他のエラーは再投げ
      }
    }

    // ページ内でH1, H2, H3タグを取得
    const headings = await page.evaluate(() => {
      // H1を取得
      const h1Element = document.querySelector("h1");
      const h1 = h1Element ? h1Element.textContent.trim() : "";

      // H2とその配下のH3を取得
      const h2Elements = document.querySelectorAll("h2");
      const h2Items = [];

      h2Elements.forEach((h2, index) => {
        const h2Text = h2.textContent.trim();

        // このH2の後、次のH2までのH3を探す
        const h3Items = [];
        let nextElement = h2.nextElementSibling;

        while (nextElement && nextElement.tagName !== "H2") {
          if (nextElement.tagName === "H3") {
            h3Items.push(nextElement.textContent.trim());
          }

          // 子要素にH3がある場合も考慮
          const childH3s = nextElement.querySelectorAll("h3");
          childH3s.forEach((h3) => {
            h3Items.push(h3.textContent.trim());
          });

          nextElement = nextElement.nextElementSibling;
        }

        h2Items.push({
          text: h2Text,
          h3Items: h3Items,
        });
      });

      // 文字数も計算
      const bodyText = document.body.innerText || "";
      const characterCount = bodyText.length;

      return {
        h1,
        h2Items,
        characterCount,
        title: document.title,
      };
    });

    console.log(`✅ スクレイピング成功: ${url}`);
    console.log(`  - H1: ${headings.h1}`);
    console.log(`  - H2数: ${headings.h2Items.length}`);
    const totalH3Count = headings.h2Items.reduce(
      (sum, h2) => sum + h2.h3Items.length,
      0
    );
    console.log(`  - H3数: ${totalH3Count}`);
    console.log(`  - 文字数: ${headings.characterCount}`);

    return {
      success: true,
      data: headings,
    };
  } catch (error) {
    console.error(`❌ スクレイピングエラー: ${url}`, error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // 🚀 ページのクリーンアップ（メモリリーク対策）
    if (page) {
      try {
        console.log("🧹 ページクリーンアップ開始...");

        // ページレベルのクリーンアップ
        await page
          .evaluate(() => {
            window.stop(); // 進行中のリクエストを停止
          })
          .catch(() => {}); // エラーは無視

        // ページを閉じる
        await page.close();
        console.log("✅ ページクリーンアップ完了");

        // メモリ使用量をログ出力
        const memUsage = process.memoryUsage();
        const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        console.log(`🧠 メモリ使用量: ${usedMB}MB`);

        // Node.jsのガベージコレクションを強制実行
        if (global.gc) {
          global.gc();
          console.log("🗑️ ガベージコレクション実行");
        }
      } catch (closeError) {
        console.log("⚠️ ページクローズエラー（無視）:", closeError.message);
      }
    }
  }
}

// APIエンドポイント：単一URLのスクレイピング
app.post("/api/scrape", async (req, res) => {
  console.log("🔥 SCRAPE ENDPOINT HIT!");
  console.log("Request IP:", req.ip);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("Timestamp:", new Date().toISOString());

  const { url } = req.body;

  if (!url) {
    console.log("❌ No URL provided");
    return res.status(400).json({ error: "URLが必要です" });
  }

  console.log(`🎯 Starting scrape for URL: ${url}`);

  // URL検証
  const validation = isValidUrl(url);
  if (!validation.valid) {
    console.log(`❌ Invalid URL: ${validation.error}`);
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await scrapeHeadings(url);
    console.log(
      `✅ Scrape completed for: ${url}`,
      result.success ? "SUCCESS" : "FAILED"
    );
    res.json(result);
  } catch (error) {
    console.error(`❌ Scrape error for ${url}:`, error);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

// APIエンドポイント：複数URLの一括スクレイピング
app.post("/api/scrape-multiple", async (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "URLの配列が必要です" });
  }

  // URL数の上限チェック（DoS対策）
  if (urls.length > 50) {
    return res.status(400).json({ error: "一度に処理できるURLは50個までです" });
  }

  // 全URLの検証
  for (const url of urls) {
    const validation = isValidUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        error: `無効なURLが含まれています: ${url} - ${validation.error}`,
      });
    }
  }

  try {
    console.log(`📋 ${urls.length}件のURLをスクレイピング開始`);

    // 🚀 並列処理数を環境変数で制御（メモリ効率重視）
    const CONCURRENT_LIMIT = parseInt(process.env.CONCURRENT_LIMIT) || 3;
    console.log(`🔧 並列処理数: ${CONCURRENT_LIMIT}個（メモリ効率重視）`);

    // メモリ使用量を監視
    const memStart = process.memoryUsage();
    const startMB = Math.round(memStart.heapUsed / 1024 / 1024);
    console.log(`🧠 処理開始時メモリ: ${startMB}MB`);

    const results = [];

    // URLを並列処理用にバッチに分割
    const batches = [];
    for (let i = 0; i < urls.length; i += CONCURRENT_LIMIT) {
      batches.push(urls.slice(i, i + CONCURRENT_LIMIT));
    }

    console.log(`📦 ${batches.length}個のバッチで処理開始`);

    // バッチごとに並列処理
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `[バッチ ${batchIndex + 1}/${batches.length}] ${
          batch.length
        }個のURLを並列処理中...`
      );

      // バッチ内のURLを並列処理
      const batchPromises = batch.map(async (url, index) => {
        const globalIndex = batchIndex * CONCURRENT_LIMIT + index + 1;
        console.log(`  [${globalIndex}/${urls.length}] 処理中: ${url}`);

        // 🚀 重いサイトの事前検出とスキップ
        const heavySitePatterns = [
          /youtube\.com/i,
          /facebook\.com/i,
          /instagram\.com/i,
          /twitter\.com/i,
          /tiktok\.com/i,
          /netflix\.com/i,
          /amazon\.com.*\/dp\//i, // Amazon商品ページ
          /\.pdf$/i,
        ];

        const isHeavySite = heavySitePatterns.some((pattern) =>
          pattern.test(url)
        );
        if (isHeavySite) {
          console.log(`  ⚡ 重いサイトを検出、スキップ: ${url}`);
          return {
            url,
            h1: "",
            h2Items: [],
            characterCount: 0,
            error: "重いサイトのためスキップされました（502エラー対策）",
          };
        }

        // PDFファイルはスキップ
        if (url.toLowerCase().endsWith(".pdf")) {
          console.log(`  📑 PDFファイルをスキップ: ${url}`);
          return {
            url,
            h1: "",
            h2Items: [],
            characterCount: 0,
            error: "PDFファイルはスクレイピングできません",
          };
        }

        const result = await scrapeHeadings(url);
        if (result.success) {
          console.log(`  ✅ 成功: ${url}`);
          return {
            url,
            ...result.data,
          };
        } else {
          console.log(`  ⚠️ 失敗: ${url} - ${result.error}`);
          return {
            url,
            h1: "",
            h2Items: [],
            characterCount: 0,
            error: result.error,
          };
        }
      });

      // バッチ内の並列処理を実行
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 🧠 バッチ完了後のメモリ監視
      const memAfterBatch = process.memoryUsage();
      const batchMB = Math.round(memAfterBatch.heapUsed / 1024 / 1024);
      console.log(`📊 バッチ${batchIndex + 1}完了後メモリ: ${batchMB}MB`);

      // メモリ使用量が高い場合は追加の待機時間
      const BATCH_WAIT_MS = parseInt(process.env.BATCH_WAIT_MS) || 3000;
      const extraWaitMs = batchMB > 400 ? 2000 : 0; // 400MB超えたら追加2秒

      // バッチ間で待機（メモリ安定化とサーバー負荷軽減）
      if (batchIndex < batches.length - 1) {
        const totalWaitMs = BATCH_WAIT_MS + extraWaitMs;
        console.log(
          `⏳ 次のバッチまで${totalWaitMs / 1000}秒待機...${
            extraWaitMs > 0 ? " (高メモリ使用のため延長)" : ""
          }`
        );
        await new Promise((resolve) => setTimeout(resolve, totalWaitMs));

        // 強制ガベージコレクション
        if (global.gc) {
          global.gc();
          const memAfterGC = process.memoryUsage();
          const afterGCMB = Math.round(memAfterGC.heapUsed / 1024 / 1024);
          console.log(
            `🗑️ GC後メモリ: ${afterGCMB}MB (${batchMB - afterGCMB}MB削減)`
          );
        }
      }
    }

    // 🎯 処理完了時の総合レポート
    const memEnd = process.memoryUsage();
    const endMB = Math.round(memEnd.heapUsed / 1024 / 1024);
    const memoryDiff = endMB - startMB;

    console.log("✅ 全てのスクレイピング完了");
    console.log(`📊 メモリレポート:`);
    console.log(`   開始時: ${startMB}MB`);
    console.log(`   終了時: ${endMB}MB`);
    console.log(`   差分: ${memoryDiff > 0 ? "+" : ""}${memoryDiff}MB`);
    console.log(`   処理URL数: ${urls.length}個`);
    console.log(
      `   成功率: ${Math.round(
        (results.filter((r) => !r.error).length / results.length) * 100
      )}%`
    );

    res.json({
      success: true,
      results,
      memoryReport: {
        startMB,
        endMB,
        memoryDiff,
        processedUrls: urls.length,
        successRate: Math.round(
          (results.filter((r) => !r.error).length / results.length) * 100
        ),
      },
    });
  } catch (error) {
    console.error("❌ 一括スクレイピングエラー:", error);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

// ヘルスチェック
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "スクレイピングサーバーは正常に動作しています",
  });
});

// テスト用エンドポイント（ログ確認用）
app.post("/api/test", (req, res) => {
  console.log("🔥 TEST ENDPOINT HIT!");
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("Request IP:", req.ip);
  console.log("Request method:", req.method);
  console.log("Request path:", req.path);
  console.log("Timestamp:", new Date().toISOString());

  res.json({
    success: true,
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
    receivedData: req.body,
    headers: req.headers,
  });
});

// 記事完了通知エンドポイント（ブラウザ再起動用）
app.post("/api/article-completed", (req, res) => {
  console.log("📝 記事完了通知を受信");

  articlesCompleted++;
  console.log(`📊 完了記事数: ${articlesCompleted}/${RESTART_AFTER_ARTICLES}`);

  // 設定した記事数に達したらブラウザを再起動
  if (articlesCompleted >= RESTART_AFTER_ARTICLES) {
    console.log(`🔄 ${RESTART_AFTER_ARTICLES}記事完了、ブラウザを再起動します`);

    if (browser) {
      browser
        .close()
        .then(() => {
          console.log("✅ ブラウザを正常にクローズしました");
        })
        .catch((error) => {
          console.log("⚠️ ブラウザクローズエラー（無視）:", error.message);
        });
      browser = null;
    }

    // カウンターをリセット
    articlesCompleted = 0;

    // Node.jsのガベージコレクションを強制実行
    if (global.gc) {
      global.gc();
      console.log("🗑️ メモリガベージコレクション実行");
    }

    // メモリ使用量をログ出力
    const memUsage = process.memoryUsage();
    console.log("📊 メモリ使用量:", {
      rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
    });
  }

  res.json({
    success: true,
    articlesCompleted,
    nextRestartAt: RESTART_AFTER_ARTICLES,
    browserRestarted: articlesCompleted === 0,
  });
});

// 強制ブラウザ再起動エンドポイント
app.post("/api/force-restart-browser", async (req, res) => {
  console.log("🔄 強制ブラウザ再起動要求");
  logMemoryUsage("再起動前");

  if (browser) {
    try {
      await browser.close();
      console.log("✅ ブラウザを正常にクローズしました");
    } catch (error) {
      console.log("⚠️ ブラウザクローズエラー（無視）:", error.message);
    }
    browser = null;
  }

  // Node.jsのガベージコレクションを強制実行
  if (global.gc) {
    global.gc();
    console.log("🗑️ メモリガベージコレクション実行");
  }

  logMemoryUsage("再起動後");

  res.json({
    success: true,
    message: "ブラウザを強制再起動しました",
    timestamp: new Date().toISOString(),
  });
});

// Google Search APIエンドポイント
app.post("/api/google-search", async (req, res) => {
  const { query, numResults = 20 } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    console.error("Google Search API keys not configured");
    return res.status(500).json({ error: "Google Search API not configured" });
  }

  try {
    console.log(`🔍 Google Search for: ${query}`);
    const results = [];

    // 1回目のリクエスト（1-10位）
    // 日本語・日本地域の検索結果を優先
    const firstUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
      query
    )}&num=10&lr=lang_ja&gl=jp`;
    const firstResponse = await fetch(firstUrl);

    if (!firstResponse.ok) {
      const errorData = await firstResponse.json();
      console.error("Google Search API error:", errorData);
      return res.status(firstResponse.status).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Search service error"
            : errorData.error?.message || "Google Search API error",
      });
    }

    const firstData = await firstResponse.json();
    if (firstData.items) {
      results.push(...firstData.items);
    }

    // 20件必要な場合は2回目のリクエスト（11-20位）
    if (numResults > 10 && firstData.items?.length === 10) {
      const secondUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        query
      )}&num=10&start=11&lr=lang_ja&gl=jp`;
      const secondResponse = await fetch(secondUrl);

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        if (secondData.items) {
          results.push(...secondData.items);
        }
      }
    }

    console.log(`✅ Google Search completed: ${results.length} results`);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Google Search error:", error.message);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : "Failed to perform Google search",
    });
  }
});

// Google Drive実績データAPIエンドポイント
const companyDataHandler = require("./api/company-data.js");
app.get("/api/company-data", companyDataHandler);

// スプレッドシートモードAPIエンドポイント
const {
  getMarkedKeywords,
  getInternalLinkMap,
} = require("./api/spreadsheet-mode.js");
const { updateSpreadsheetCell } = require("./api/spreadsheet-update.js");
app.get("/api/spreadsheet-mode/keywords", getMarkedKeywords);
app.get("/api/spreadsheet-mode/internal-links", getInternalLinkMap);
app.post("/api/spreadsheet-mode/update", updateSpreadsheetCell);

// Slack通知プロキシエンドポイント（CORSを回避）
app.post("/api/slack-notify", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("❌ Slack Webhook URLが設定されていません");
    return res.status(500).json({ error: "Slack webhook URL not configured" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log("✅ Slack通知送信成功");
      res.json({ success: true });
    } else {
      console.error(
        "❌ Slack通知送信失敗:",
        response.status,
        response.statusText
      );
      res.status(500).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Notification service error"
            : "Failed to send Slack notification",
      });
    }
  } catch (error) {
    console.error("❌ Slack通知エラー:", error.message);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

// WordPress 設定取得エンドポイント
app.get("/api/wordpress/config", (req, res) => {
  console.log("📋 WordPress設定を取得中...");

  // WordPress設定を環境変数から取得
  const wpBaseUrl = process.env.WP_BASE_URL || process.env.VITE_WP_BASE_URL;
  const wpUsername = process.env.WP_USERNAME || process.env.VITE_WP_USERNAME;
  const wpDefaultPostStatus =
    process.env.WP_DEFAULT_POST_STATUS ||
    process.env.VITE_WP_DEFAULT_POST_STATUS ||
    "draft";

  console.log("✅ WordPress設定を返却:", {
    baseUrl: wpBaseUrl ? "設定済み" : "未設定",
    username: wpUsername ? "設定済み" : "未設定",
    defaultPostStatus: wpDefaultPostStatus,
  });

  res.json({
    baseUrl: wpBaseUrl || "",
    username: wpUsername || "",
    defaultPostStatus: wpDefaultPostStatus,
  });
});

// WordPress プロキシエンドポイント（画像アップロード）
app.post("/api/wordpress/upload-image", async (req, res) => {
  console.log("🔍 === WordPress画像アップロード デバッグ開始 ===");
  console.log("📥 リクエストデータ:");
  console.log("  - filename:", req.body.filename);
  console.log("  - title:", req.body.title);
  console.log("  - altText:", req.body.altText);
  console.log(
    "  - base64Image length:",
    req.body.base64Image ? req.body.base64Image.length : 0
  );
  console.log("  - リクエスト元IP:", req.ip);
  console.log("  - User-Agent:", req.headers["user-agent"]);

  const { base64Image, filename, title, altText } = req.body;

  if (!base64Image || !filename) {
    console.log("❌ 必須パラメータ不足");
    return res
      .status(400)
      .json({ error: "base64Image and filename are required" });
  }

  // WordPress設定を環境変数から取得
  const wpBaseUrl = process.env.WP_BASE_URL || process.env.VITE_WP_BASE_URL;
  const wpUsername = process.env.WP_USERNAME || process.env.VITE_WP_USERNAME;
  const wpAppPassword =
    process.env.WP_APP_PASSWORD || process.env.VITE_WP_APP_PASSWORD;

  console.log("🔧 WordPress設定確認:");
  console.log(
    "  - wpBaseUrl:",
    wpBaseUrl ? `${wpBaseUrl.substring(0, 20)}...` : "未設定"
  );
  console.log(
    "  - wpUsername:",
    wpUsername ? `${wpUsername.substring(0, 3)}***` : "未設定"
  );
  console.log(
    "  - wpAppPassword:",
    wpAppPassword ? `${wpAppPassword.substring(0, 4)}****` : "未設定"
  );

  if (!wpBaseUrl || !wpUsername || !wpAppPassword) {
    console.error("❌ WordPress設定が不完全です");
    return res
      .status(500)
      .json({ error: "WordPress configuration is incomplete" });
  }

  try {
    // Base64をBufferに変換
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    console.log("📊 画像データ変換:");
    console.log("  - 元のbase64長:", base64Image.length);
    console.log("  - 変換後buffer長:", buffer.length);
    console.log(
      "  - 推定ファイルサイズ:",
      Math.round(buffer.length / 1024),
      "KB"
    );

    // FormDataを作成（node-fetchはFormDataをサポートしていないため、手動で構築）
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: filename,
      contentType: "image/jpeg",
    });

    if (title) formData.append("title", title);
    if (altText) formData.append("alt_text", altText);

    // WordPress REST APIにアップロード
    const apiUrl = wpBaseUrl.replace(/\/+$/, "") + "/wp-json/wp/v2/media";
    const authHeader =
      "Basic " +
      Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

    console.log("🌐 WordPress API リクエスト詳細:");
    console.log("  - API URL:", apiUrl);
    console.log("  - Method: POST");
    console.log(
      "  - Auth Header:",
      authHeader ? `Basic ${authHeader.substring(6, 10)}****` : "なし"
    );
    console.log("  - FormData Headers:", formData.getHeaders());

    console.log("📤 WordPress APIにリクエスト送信中...");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log("📥 WordPress API レスポンス受信:");
    console.log("  - Status:", response.status);
    console.log("  - Status Text:", response.statusText);
    console.log(
      "  - Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2)
    );

    // レスポンスボディを取得（エラーの場合も含む）
    const responseText = await response.text();
    console.log("  - Response Body Length:", responseText.length);
    console.log(
      "  - Response Body:",
      responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.log("🔍 WordPress APIエラー詳細:");
        console.log("  - Error Code:", errorData.code);
        console.log("  - Error Message:", errorData.message);
        console.log("  - Error Data:", JSON.stringify(errorData.data, null, 2));

        // 特定のエラーコードに対する詳細情報
        if (errorData.code === "rest_cannot_create") {
          console.log(
            "💡 権限エラー: ユーザーにメディアアップロード権限がありません"
          );
        } else if (errorData.code === "rest_forbidden") {
          console.log(
            "💡 アクセス拒否: IP制限またはセキュリティプラグインの可能性"
          );
        } else if (errorData.code === "rest_upload_user_quota_exceeded") {
          console.log("💡 容量制限: ユーザーのアップロード容量を超過");
        }
      } catch (parseError) {
        console.log("⚠️ レスポンスのJSONパースに失敗:", parseError.message);
        errorData = { message: "Upload failed", raw_response: responseText };
      }

      console.error("❌ WordPress画像アップロード失敗:", errorData);
      return res.status(response.status).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Failed to upload image"
            : errorData.message || "Upload failed",
        debug_info:
          process.env.NODE_ENV !== "production"
            ? {
                wp_error_code: errorData.code,
                wp_error_message: errorData.message,
                wp_status: response.status,
                wp_status_text: response.statusText,
              }
            : undefined,
      });
    }

    // 成功時の処理
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ WordPress画像アップロード成功:");
      console.log("  - Media ID:", data.id);
      console.log("  - Source URL:", data.source_url);
      console.log("  - Title:", data.title?.rendered);
      console.log("  - Alt Text:", data.alt_text);
    } catch (parseError) {
      console.error("⚠️ 成功レスポンスのJSONパースに失敗:", parseError.message);
      return res.status(500).json({ error: "Invalid response from WordPress" });
    }

    console.log("🔍 === WordPress画像アップロード デバッグ終了 ===");
    res.json({ id: data.id, source_url: data.source_url });
  } catch (error) {
    console.error("❌ WordPress画像アップロードエラー:", error.message);
    console.error("❌ エラースタック:", error.stack);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

// WordPress プロキシエンドポイント（記事作成）
app.post("/api/wordpress/create-post", async (req, res) => {
  const { title, content, status, slug } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }

  // WordPress設定を環境変数から取得
  const wpBaseUrl = process.env.WP_BASE_URL || process.env.VITE_WP_BASE_URL;
  const wpUsername = process.env.WP_USERNAME || process.env.VITE_WP_USERNAME;
  const wpAppPassword =
    process.env.WP_APP_PASSWORD || process.env.VITE_WP_APP_PASSWORD;

  if (!wpBaseUrl || !wpUsername || !wpAppPassword) {
    console.error("❌ WordPress設定が不完全です");
    return res
      .status(500)
      .json({ error: "WordPress configuration is incomplete" });
  }

  try {
    const postData = {
      title,
      content,
      status: status || "draft",
    };

    if (slug) postData.slug = slug;

    // WordPress REST APIに投稿
    const apiUrl = wpBaseUrl.replace(/\/+$/, "") + "/wp-json/wp/v2/posts";
    const authHeader =
      "Basic " +
      Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Post creation failed" }));
      console.error("❌ WordPress記事作成失敗:", errorData);
      return res.status(response.status).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Failed to create post"
            : errorData.message || "Post creation failed",
      });
    }

    const data = await response.json();
    console.log("✅ WordPress記事作成成功:", data.id);
    res.json({ link: data.link, id: data.id });
  } catch (error) {
    console.error("❌ WordPress記事作成エラー:", error.message);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

// グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// プロセスエラーハンドリング
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// サーバー起動
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🎉 スクレイピングサーバー起動完了！
📡 URL: http://localhost:${PORT}
🌐 Environment: ${process.env.NODE_ENV || "development"}
� Startuトp Time: ${new Date().toISOString()}
📝 エンドポイント:
   - POST /api/scrape (単一URL)
   - POST /api/scrape-multiple (複数URL)
   - POST /api/google-search (Google検索)
   - GET /api/company-data (Google Drive実績データ)
   - POST /api/slack-notify (Slack通知プロキシ)
   - GET /api/wordpress/config (WordPress設定取得)
   - POST /api/wordpress/upload-image (WordPress画像アップロード)
   - POST /api/wordpress/create-post (WordPress記事作成)
   - POST /api/test (テスト用)
   - GET /api/health (ヘルスチェック)
  `);

  // Google Search API設定の確認（APIキーはマスク）
  if (GOOGLE_API_KEY && SEARCH_ENGINE_ID) {
    console.log("✅ Google Custom Search API: 設定済み");
    console.log("   - API Key: ****");
    console.log(`   - Search Engine ID: ${SEARCH_ENGINE_ID}`);
  } else {
    console.log("⚠️  Google Custom Search API: 未設定");
    if (!GOOGLE_API_KEY) console.log("   - GOOGLE_API_KEY が見つかりません");
    if (!SEARCH_ENGINE_ID)
      console.log("   - GOOGLE_SEARCH_ENGINE_ID が見つかりません");
  }

  // 認証設定の確認
  if (process.env.INTERNAL_API_KEY) {
    console.log("✅ 認証: 有効");
    console.log(
      `   - API Key: ${process.env.INTERNAL_API_KEY.substring(0, 4)}****`
    );
  } else {
    console.log("⚠️  認証: 無効（INTERNAL_API_KEYが未設定）");
  }

  console.log("🔥 SERVER IS READY TO RECEIVE REQUESTS!");
});

// 終了時の処理
process.on("SIGINT", async () => {
  console.log("\n👋 サーバーを終了します...");
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
