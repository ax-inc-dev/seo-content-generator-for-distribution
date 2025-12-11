// Google Drive APIを使ってグラシズ社の実績データを検索
const { google } = require('googleapis');
require('dotenv').config();

async function searchGrasis() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    
    const drive = google.drive({ 
      version: 'v3',
      auth: apiKey
    });
    
    const folderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // フォルダ内のファイルを全て取得
    console.log('📂 フォルダ内のファイル一覧を取得中...');
    const filesList = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100
    });
    
    console.log('\n利用可能なファイル:');
    filesList.data.files.forEach(file => {
      console.log(`  - ${file.name} (${file.id})`);
    });
    
    // 各CSVファイルを検索
    for (const file of filesList.data.files) {
      if (file.mimeType === 'text/csv' || file.name.includes('.csv')) {
        console.log(`\n📊 検索中: ${file.name}`);
        
        try {
          const response = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          }, {
            responseType: 'text'
          });
          
          const content = response.data;
          const lines = content.split('\n');
          
          // グラシズ関連の情報を検索
          for (let i = 0; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            if (lowerLine.includes('グラシズ') || 
                lowerLine.includes('grasis') || 
                lowerLine.includes('ぐらしず')) {
              
              console.log('\n🎯 グラシズ関連の情報を発見！');
              console.log(`ファイル: ${file.name}`);
              console.log(`行番号: ${i + 1}`);
              console.log(`内容: ${lines[i].substring(0, 500)}`);
              
              // 前後の行も確認
              if (i > 0) {
                console.log(`前の行: ${lines[i-1].substring(0, 300)}`);
              }
              if (i < lines.length - 1) {
                console.log(`次の行: ${lines[i+1].substring(0, 300)}`);
              }
            }
          }
        } catch (error) {
          console.log(`  ⚠️ ${file.name}の読み取りエラー:`, error.message);
        }
      }
    }
    
    // 見つからない場合、C社以外の会社を探す
    console.log('\n\n📋 その他のAX CAMP受講企業を検索中...');
    
    // pdf_segments_index.csvを重点的に検索
    const pdfSegmentsFile = filesList.data.files.find(f => f.name === 'pdf_segments_index.csv');
    if (pdfSegmentsFile) {
      const response = await drive.files.get({
        fileId: pdfSegmentsFile.id,
        alt: 'media'
      }, {
        responseType: 'text'
      });
      
      const content = response.data;
      const lines = content.split('\n');
      
      // AX CAMP関連の実績を全て探す
      const companies = new Set();
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('AX CAMP') || lines[i].includes('導入') || lines[i].includes('実績')) {
          // 会社名パターンを探す
          const companyPatterns = [
            /([A-Z]社)/g,
            /(株式会社[^\s,]+)/g,
            /([ぁ-ん]+社)/g
          ];
          
          for (const pattern of companyPatterns) {
            const matches = lines[i].match(pattern);
            if (matches) {
              matches.forEach(company => {
                if (company !== 'C社' && company !== '株式会社AX') {
                  companies.add(company);
                }
              });
            }
          }
        }
      }
      
      if (companies.size > 0) {
        console.log('\n発見した他の受講企業:');
        companies.forEach(company => {
          console.log(`  - ${company}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchGrasis();