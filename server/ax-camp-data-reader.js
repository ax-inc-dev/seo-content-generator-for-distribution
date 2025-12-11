const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

/**
 * Google Drive outputsフォルダからAX CAMPデータを読み取るエンドポイント
 */
router.post('/read-ax-camp-data', async (req, res) => {
  try {
    console.log('📚 AX CAMPデータ読み取りリクエスト受信');
    
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
 * キャッシュされたAX CAMPデータ
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
      total: 7,
      pdfs: [
        'AX CAMPご提案資料_ver.3_2pv.pdf',
        '1本10万円のLPライティング外注費がゼロに！グラシズ社が「AIへの教育」に力を入れる理由とは？｜ぶんた@株式会社AX CEO.pdf',
        '原稿執筆が24時間→10秒に！Route66社が実現したマーケ現場の生成AI内製化｜ぶんた@株式会社AX CEO.pdf',
        '採用予定2名分の業務をAIが代替！WISDOM社、毎日2時間の調整業務を自動化｜ぶんた@株式会社AX CEO.pdf',
        '月間1,000万impを自動化！C社でAI活用が当たり前の文化になった背景とは？｜ぶんた@株式会社AX CEO.pdf'
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
      company: '株式会社AX',
      service_name: 'AX CAMP',
      description: '法人向けAI研修サービス',
      main_contents: [
        'AI活用基礎研修',
        'ClaudeCode実践研修',
        'ChatGPT API活用研修',
        'プロンプトエンジニアリング研修',
        '業務自動化研修'
      ],
      case_studies: [
        {
          company: 'グラシズ社',
          result: 'LPライティング外注費10万円→0円',
          detail: 'AIへの教育に注力し、内製化を実現',
          business: 'マーケティング支援企業（LPライティング等）',
          achievements: '制作時間3営業日→2時間',
          ceo: '土谷武史',
          challenge: 'スキルの属人化と慢性的なリソース不足'
        },
        {
          company: 'Route66社',
          result: '原稿執筆時間24時間→10秒',
          detail: 'マーケ現場の生成AI内製化',
          business: 'コンテンツ制作・マーケティング企業',
          ceo: '細川大',
          focus: '業務の仕組み化と再現性のある成果創出'
        },
        {
          company: 'WISDOM社',
          result: '採用予定2名分の業務をAI代替',
          detail: '毎日2時間の調整業務を自動化',
          business: 'SNS広告とショート動画を強みに、制作・出稿・運用を担う広告代理店',
          platforms: ['TikTok', 'Google', 'Meta'],
          focus: '広告効果を最大化するためのクリエイティブ制作',
          ceo: '安藤宏将'
        },
        {
          company: 'C社',
          result: '月間1,000万impを自動化',
          detail: 'AI活用が当たり前の文化を構築',
          business: 'テキスト系SNS運用・メディア運営',
          achievements: '1日3時間→1時間に業務短縮（66%削減）',
          leader: 'N氏（事業責任者）',
          highlight: '非エンジニアチームでSNS完全自動化システムを内製化'
        },
        {
          company: 'Foxx社',
          result: '月75時間の運用業務をAIとの対話で変革',
          detail: '新規事業創出も実現',
          business: '運用業務',
          achievements: 'AIとの対話による業務効率化',
          highlight: '運用効率化の副次的効果として新規事業創出を実現'
        }
      ]
    }
  };
}

module.exports = router;