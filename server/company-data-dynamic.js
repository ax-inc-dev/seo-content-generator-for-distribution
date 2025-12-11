const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

/**
 * Google Driveから動的に会社実績データを取得するエンドポイント
 * 優先順位：
 * 1. Google Drive (pdf_segments.csv)
 * 2. キャッシュデータ（フォールバック）
 */
router.get('/api/company-data-live', async (req, res) => {
  try {
    console.log('📊 会社実績データ取得リクエスト受信（動的版）');
    
    // Google Driveからデータ取得を試みる
    const driveData = await fetchFromGoogleDrive();
    
    if (driveData) {
      console.log('✅ Google Driveから最新データ取得成功');
      res.json({
        success: true,
        source: 'google-drive',
        timestamp: new Date().toISOString(),
        data: driveData
      });
    } else {
      console.log('⚠️ Google Drive取得失敗、キャッシュデータを使用');
      res.json({
        success: true,
        source: 'cache',
        timestamp: new Date().toISOString(),
        data: getCachedCompanyData()
      });
    }
  } catch (error) {
    console.error('❌ データ取得エラー:', error);
    // エラー時もキャッシュデータを返す
    res.json({
      success: true,
      source: 'cache-fallback',
      error: error.message,
      data: getCachedCompanyData()
    });
  }
});

/**
 * Google Driveからpdf_segments.csvを取得して解析
 */
async function fetchFromGoogleDrive() {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'fetch-company-data.py');
    
    exec(`python3 ${scriptPath}`, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Python実行エラー:', error);
        resolve(null);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        resolve(null);
      }
    });
  });
}

/**
 * キャッシュされた会社実績データ（フォールバック用）
 */
function getCachedCompanyData() {
  return {
    companies: [
      {
        name: 'A社',
        industry: 'マーケティング支援企業',
        results: {
          before: 'LP制作外注費10万円',
          after: '外注費0円',
          timeReduction: '制作時間3営業日→2時間'
        },
        details: 'AI活用により内製化を実現'
      },
      {
        name: 'B社',
        industry: 'コンテンツ制作・マーケティング企業',
        results: {
          before: '原稿執筆に長時間',
          after: '大幅短縮',
          improvement: '高速化'
        },
        details: '生成AI内製化'
      },
      {
        name: 'C社',
        industry: 'SNS運用・メディア運営',
        results: {
          before: '1日3時間の運用作業',
          after: '1時間に短縮（66%削減）',
          achievement: '月間1,000万impを自動化'
        },
        details: 'SNS自動化システムを内製化'
      },
      {
        name: 'D社',
        industry: '広告代理店',
        results: {
          before: '採用業務の負荷',
          after: 'AI活用で効率化',
          timeReduction: '調整業務を自動化'
        },
        details: 'AI導入による採用業務効率化'
      },
      {
        name: 'E社',
        industry: '運用業務',
        results: {
          before: '運用業務',
          after: 'AIとの対話で効率化',
          achievement: '新規事業創出も実現'
        },
        details: 'AI活用による業務効率化と新規事業創出'
      }
    ],
    summary: {
      totalCompanies: 5,
      averageTimeReduction: '70%以上',
      keyAchievements: [
        '外注費削減（10万円→0円）',
        '作業時間大幅短縮',
        '採用業務の効率化',
        'インプレッション自動化（月1,000万imp）',
        '新規事業創出'
      ]
    },
    lastUpdated: new Date().toISOString()
  };
}

module.exports = router;