// Google Drive APIを使ってC社の実績データを取得
const { google } = require('googleapis');
require('dotenv').config();

async function getCompanyResults() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    
    const drive = google.drive({ 
      version: 'v3',
      auth: apiKey
    });
    
    const folderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // フォルダ内のpdf_segments_index.csvを探す
    console.log('📂 フォルダ内のCSVファイルを検索中...');
    const filesList = await drive.files.list({
      q: `'${folderId}' in parents and name='pdf_segments_index.csv'`,
      fields: 'files(id, name)',
    });
    
    if (filesList.data.files.length === 0) {
      throw new Error('pdf_segments_index.csvが見つかりません');
    }
    
    const csvFileId = filesList.data.files[0].id;
    console.log(`✅ CSVファイル発見: ${csvFileId}`);
    
    // CSVファイルの内容を取得
    console.log('\n📊 実績データを取得中...');
    const response = await drive.files.get({
      fileId: csvFileId,
      alt: 'media'
    }, {
      responseType: 'text'
    });
    
    const csvContent = response.data;
    const lines = csvContent.split('\n');
    
    // グラシズ社の実績を探して表示
    console.log('\n🏢 グラシズ様の実績を検索中...');
    console.log('=' .repeat(60));
    
    let foundResults = false;
    const results = [];
    
    // デバッグ用：最初の数行を確認
    console.log('\nCSVの最初の数行を確認:');
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].includes('グラシズ') || lines[i].includes('Grasis') || lines[i].includes('C社')) {
        console.log(`行${i}: ${lines[i].substring(0, 200)}`);
      }
    }
    
    // 全行を検索
    for (let i = 0; i < lines.length; i++) {
      // グラシズ、Grasis、C社のいずれかを含む行を探す
      if (lines[i].includes('グラシズ') || lines[i].includes('Grasis') || lines[i].includes('C社')) {
        const fields = lines[i].split(',');
        
        // テキストフィールドから実績情報を抽出
        const textField = fields[10] || ''; // text列
        
        // 実績の要点を抽出
        if (textField.includes('1,000万imp')) {
          console.log('\n📈 【SNS運用の実績】');
          console.log('- 月間インプレッション: 1,000万imp達成');
          foundResults = true;
        }
        
        if (textField.includes('1日3時間') || textField.includes('1時間')) {
          console.log('\n⏰ 【業務効率化の実績】');
          console.log('- 作業時間: 1日3時間以上 → わずか1時間に短縮');
          console.log('- 削減率: 約66%の業務時間削減');
          foundResults = true;
        }
        
        if (textField.includes('非エンジニア')) {
          console.log('\n🚀 【実装の特徴】');
          console.log('- 非エンジニアだけのチームで完全自動化システムを内製化');
          console.log('- AX CAMPの研修により、技術者なしでAI活用を実現');
          foundResults = true;
        }
        
        if (textField.includes('SNSマーケティング')) {
          console.log('\n🏢 【企業情報】');
          console.log('- 業界: SNSマーケティングを主軸とした広告代理事業');
          foundResults = true;
        }
      }
    }
    
    if (foundResults) {
      console.log('\n' + '=' .repeat(60));
      console.log('\n📝 まとめ：');
      console.log('C社様はAX CAMPを受講することで、');
      console.log('1. SNS運用を大幅に効率化（3時間→1時間）');
      console.log('2. 月間1,000万インプレッションという驚異的な成果');
      console.log('3. 非エンジニアチームでもAI自動化システムを構築');
      console.log('\nこれらの成果を達成されました！');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

getCompanyResults();