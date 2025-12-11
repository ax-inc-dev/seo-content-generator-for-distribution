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
        name: 'グラシズ社',
        industry: 'マーケティング支援企業',
        results: {
          before: 'LPライティング外注費10万円',
          after: '外注費0円',
          timeReduction: '制作時間3営業日→2時間'
        },
        ceo: '土谷武史',
        details: 'AIへの教育に注力し、内製化を実現'
      },
      {
        name: 'Route66社',
        industry: 'コンテンツ制作・マーケティング企業',
        results: {
          before: '原稿執筆24時間',
          after: '10秒で完了',
          improvement: '14,400倍の高速化'
        },
        ceo: '細川大',
        details: 'マーケ現場の生成AI内製化'
      },
      {
        name: 'WISDOM社',
        industry: 'SNS広告・ショート動画広告代理店',
        results: {
          before: '採用予定2名分の業務負荷',
          after: 'AIが完全代替',
          timeReduction: '毎日2時間の調整業務を自動化'
        },
        ceo: '安藤宏将',
        platforms: ['TikTok', 'Google', 'Meta']
      },
      {
        name: 'C社',
        industry: 'テキスト系SNS運用・メディア運営',
        results: {
          before: '1日3時間の運用作業',
          after: '1時間に短縮（66%削減）',
          achievement: '月間1,000万impを自動化'
        },
        leader: 'N氏（事業責任者）',
        details: '非エンジニアチームでSNS完全自動化システムを内製化'
      },
      {
        name: 'Foxx社',
        industry: '運用業務',
        results: {
          before: '月75時間の運用業務',
          after: 'AIとの対話で効率化',
          achievement: '新規事業創出も実現'
        },
        details: 'AI活用による業務効率化、副次的効果として新規事業創出'
      }
    ],
    summary: {
      totalCompanies: 5,
      averageTimeReduction: '70%以上',
      keyAchievements: [
        '外注費削減（10万円→0円）',
        '作業時間短縮（24時間→10秒）',
        '人材採用不要（2名分の業務をAI代替）',
        'インプレッション自動化（月1,000万imp）',
        '新規事業創出（Foxx社）'
      ]
    },
    lastUpdated: '2025-09-09T14:09:30.497Z'
  };
}

module.exports = router;