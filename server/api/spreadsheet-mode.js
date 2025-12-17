/**
 * スプレッドシートモードAPI
 * 「■」マークのあるキーワードを取得
 * Google API Key認証対応版（本番環境対応）
 */

const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "";

/**
 * スプレッドシートから「■」マークのあるキーワードを取得
 */
async function getMarkedKeywords(req, res) {
  try {
    console.log("📊 スプレッドシートモード: キーワード取得開始");

    // デバッグ: 環境変数の確認
    console.log("🔍 環境変数デバッグ:");
    console.log(
      "  GOOGLE_APPLICATION_CREDENTIALS_JSON:",
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    console.log("  GOOGLE_API_KEY:", !!process.env.GOOGLE_API_KEY);
    console.log("  NODE_ENV:", process.env.NODE_ENV);

    // ADC認証（環境変数対応）
    let auth;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Render環境: 環境変数から直接認証情報を使用
      const credentials = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      );
      auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets.readonly",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });
      console.log("🔐 ADC認証（環境変数から認証情報を読み込み）");
    } else {
      // ローカル環境: 通常のADC認証
      auth = new google.auth.GoogleAuth({
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets.readonly",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });
      console.log("🔐 ADC認証（ローカル環境）");
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // シート1のB列とD列を取得（最大500行）
    const range = "シート1!B1:D500";
    console.log("📋 スプレッドシートからデータを取得中...");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "スプレッドシートにデータが見つかりませんでした",
      });
    }

    // 「■」マークの検索
    const markedItems = [];

    for (let i = 0; i < rows.length; i++) {
      const dColumn = rows[i][2]; // D列
      const bColumn = rows[i][0]; // B列（KW）

      // 空白を完全除去、全角・半角の■両方に対応
      const normalizedD = dColumn ? dColumn.replace(/\s+/g, "") : "";

      if (
        normalizedD === "■" ||
        normalizedD === "●" ||
        normalizedD.includes("■") ||
        normalizedD.includes("●")
      ) {
        // B列が空の場合はスキップ
        if (!bColumn || bColumn.trim() === "") {
          console.log(
            `⚠️ 行${i + 1}: 「■」はあるがB列（KW）が空のためスキップ`
          );
          continue;
        }

        markedItems.push({
          row: i + 1,
          keyword: bColumn.trim(),
          originalMarker: dColumn,
        });

        console.log(`✅ 行${i + 1}: 「■」を発見 - KW: ${bColumn.trim()}`);
      }
    }

    // エラーハンドリング
    if (markedItems.length === 0) {
      return res.status(404).json({
        success: false,
        error:
          "「■」マークが見つかりませんでした。スプレッドシートのD列に「■」を入力してください。",
      });
    }

    // B列全体が空かチェック
    const hasAnyKeyword = rows.some((row) => row[0] && row[0].trim() !== "");
    if (!hasAnyKeyword) {
      return res.status(400).json({
        success: false,
        error: "B列にキーワードが入力されていません",
      });
    }

    console.log(`📊 合計 ${markedItems.length} 個のキーワードを取得しました`);

    res.json({
      success: true,
      count: markedItems.length,
      keywords: markedItems,
    });
  } catch (error) {
    console.error("❌ スプレッドシートモードエラー:", error.message);

    // ADC認証エラーの場合は自動で再認証を促す
    if (
      error.message.includes("invalid_grant") ||
      error.message.includes("invalid_rapt") ||
      error.message.includes("reauth") ||
      error.message.includes("insufficient authentication scopes")
    ) {
      console.log(
        "🔐 ADC認証が期限切れ、またはスコープ不足です。再認証を実行してください:"
      );
      console.log(
        "   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/drive"
      );

      return res.status(401).json({
        success: false,
        error: "Google認証が期限切れ、またはスコープ不足です",
        action: "ADC_REAUTH_REQUIRED",
        command:
          "gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/drive",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * スプレッドシートからB列（キーワード）とM列（公開予定URL）のマッピングを取得
 * 内部リンク挿入用
 */
async function getInternalLinkMap(req, res) {
  try {
    console.log("🔗 内部リンクマップ取得開始");

    // デバッグ: 環境変数の確認
    console.log("🔍 環境変数デバッグ:");
    console.log(
      "  GOOGLE_APPLICATION_CREDENTIALS_JSON:",
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );

    // ADC認証（環境変数対応）
    let auth;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Render環境: 環境変数から直接認証情報を使用
      const credentials = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      );
      auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets.readonly",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });
      console.log("🔐 ADC認証（環境変数から認証情報を読み込み）");
    } else {
      // ローカル環境: 通常のADC認証
      auth = new google.auth.GoogleAuth({
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets.readonly",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });
      console.log("🔐 ADC認証（ローカル環境）");
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // シート1のB列とM列を取得（最大500行）
    const range = "シート1!B1:M500";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "スプレッドシートにデータが見つかりませんでした",
      });
    }

    // B列（キーワード）とM列（URL）のマッピングを構築
    const internalLinkMap = [];

    for (let i = 0; i < rows.length; i++) {
      const bColumn = rows[i][0]; // B列（KW）
      const mColumn = rows[i][11]; // M列（URL） - 0-indexed なので 11

      // B列とM列が両方存在する場合のみ追加
      if (
        bColumn &&
        bColumn.trim() !== "" &&
        mColumn &&
        mColumn.trim() !== ""
      ) {
        internalLinkMap.push({
          row: i + 1,
          keyword: bColumn.trim(),
          url: mColumn.trim(),
        });

        console.log(`✅ 行${i + 1}: ${bColumn.trim()} → ${mColumn.trim()}`);
      }
    }

    console.log(
      `🔗 合計 ${internalLinkMap.length} 個の内部リンクマッピングを取得しました`
    );

    res.json({
      success: true,
      count: internalLinkMap.length,
      linkMap: internalLinkMap,
    });
  } catch (error) {
    console.error("❌ 内部リンクマップ取得エラー:", error.message);

    // ADC認証エラーの場合は自動で再認証を促す
    if (
      error.message.includes("invalid_grant") ||
      error.message.includes("invalid_rapt") ||
      error.message.includes("reauth") ||
      error.message.includes("insufficient authentication scopes")
    ) {
      console.log(
        "🔐 ADC認証が期限切れ、またはスコープ不足です。再認証を実行してください:"
      );
      console.log(
        "   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/drive"
      );

      return res.status(401).json({
        success: false,
        error: "Google認証が期限切れ、またはスコープ不足です",
        action: "ADC_REAUTH_REQUIRED",
        command:
          "gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/drive",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = { getMarkedKeywords, getInternalLinkMap };
