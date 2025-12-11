const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

/**
 * Google Drive outputsフォルダから実績データを読み取るエンドポイント
 */
router.post('/read-company-data', async (req, res) => {
  try {
    console.log('📚 実績データ読み取りリクエスト受信');
    
    // Pythonスクリプトを実行してGoogle Driveから読み取り
    const scriptPath = path.join(__dirname, '..', 'scripts', 'read_drive_outputs.py');
    
    exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Python実行エラー:', error);
        
        // エラー時はキャッシュデータを返す
        return res.json({
          success: true,
          cached: true,
          data: getCachedData()
        });
      }
      
      try {
        // Pythonスクリプトの出力をパース
        const result = JSON.parse(stdout);
        
        res.json({
          success: true,
          cached: false,
          data: result
        });
      } catch (parseError) {
        console.error('❌ JSONパースエラー:', parseError);
        
        // パースエラー時もキャッシュデータを返す
        res.json({
          success: true,
          cached: true,
          data: getCachedData()
        });
      }
    });
  } catch (error) {
    console.error('❌ データ読み取りエラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * キャッシュされた実績データ
 */
function getCachedData() {
  return {
    segments: {
      total: 50,
      files: [
        'プロンプト検証の流れ.mp4',
        'ClaudeCodeを使いこなすための基本テクニック6選_vrew_エクスポート.mp4',
        '【超便利】ClaudeCodeでGASのシステムを作る方法_エクスポート.mp4'
      ],
      sample_transcripts: [
        'AIにしっかりやらせるための検証プロセスについて説明します',
        'ClaudeCodeの基本的な使い方を6つのテクニックで解説',
        'Google Apps ScriptとClaudeCodeを連携させる方法'
      ]
    },
    documents: {
      total: 5,
      pdfs: [
        '提案資料.pdf',
        'A社導入事例：LP制作費削減.pdf',
        'B社導入事例：原稿執筆時間短縮.pdf',
        'C社導入事例：業務時間削減.pdf',
        'D社導入事例：採用業務効率化.pdf'
      ]
    },
    keywords: {
      'AI': 150,
      '研修': 120,
      'Claude': 85,
      'ChatGPT': 75,
      'プロンプト': 95,
      '法人': 60,
      '自動化': 80,
      'API': 45,
      'Python': 40,
      'カリキュラム': 35
    },
    service_info: {
      company: '',
      service_name: '',
      description: '法人向けAI研修サービス',
      main_contents: [
        'AI活用基礎研修',
        'Claude実践研修',
        'ChatGPT API活用研修',
        'プロンプトエンジニアリング研修',
        '業務自動化研修'
      ],
      case_studies: [
        {
          company: 'A社',
          result: 'LP制作費10万円→0円',
          detail: 'AI活用により内製化を実現',
          business: 'マーケティング支援企業',
          achievements: '制作時間3営業日→2時間'
        },
        {
          company: 'B社',
          result: '原稿執筆時間大幅短縮',
          detail: '生成AI内製化',
          business: 'コンテンツ制作・マーケティング企業'
        },
        {
          company: 'C社',
          result: '月間1,000万impを自動化',
          detail: 'AI活用が当たり前の文化を構築',
          business: 'SNS運用・メディア運営',
          achievements: '業務時間66%削減'
        },
        {
          company: 'D社',
          result: '採用業務の効率化',
          detail: '調整業務を自動化',
          business: '広告代理店'
        },
        {
          company: 'E社',
          result: '運用業務をAI活用で変革',
          detail: '業務効率化と新規事業創出',
          business: '運用業務'
        }
      ]
    }
  };
}

module.exports = router;