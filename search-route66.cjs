// Google Drive APIを使ってRoute66社の実績データを検索
const { google } = require('googleapis');
require('dotenv').config();

async function searchRoute66() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    
    const drive = google.drive({ 
      version: 'v3',
      auth: apiKey
    });
    
    const folderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // pdf_segments_index.csvを取得
    console.log('📂 Route66様の実績を検索中...');
    const filesList = await drive.files.list({
      q: `'${folderId}' in parents and name='pdf_segments_index.csv'`,
      fields: 'files(id, name)',
    });
    
    if (filesList.data.files.length === 0) {
      throw new Error('pdf_segments_index.csvが見つかりません');
    }
    
    const csvFileId = filesList.data.files[0].id;
    
    // CSVファイルの内容を取得
    const response = await drive.files.get({
      fileId: csvFileId,
      alt: 'media'
    }, {
      responseType: 'text'
    });
    
    const content = response.data;
    const lines = content.split('\n');
    
    console.log('=' .repeat(60));
    console.log('\n🚗 Route66様の実績を検索中...\n');
    
    const route66Results = [];
    
    // Route66関連の情報を検索
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('route66') || 
          lowerLine.includes('route 66') ||
          lowerLine.includes('ルート66') ||
          lowerLine.includes('ルート６６')) {
        
        console.log(`🎯 Route66関連の情報を発見！（行 ${i + 1}）`);
        
        // CSVの列を分割
        const fields = line.split(',');
        const textField = fields[10] || ''; // text列
        
        // 実績情報を抽出
        route66Results.push({
          line: i + 1,
          content: textField.substring(0, 500),
          fullLine: line
        });
        
        // 詳細情報を表示
        if (textField) {
          console.log('内容:', textField.substring(0, 300));
          
          // 前後の行も確認
          if (i > 0 && lines[i-1]) {
            const prevFields = lines[i-1].split(',');
            if (prevFields[10] && prevFields[10].length > 10) {
              console.log('前の文脈:', prevFields[10].substring(0, 200));
            }
          }
          if (i < lines.length - 1 && lines[i+1]) {
            const nextFields = lines[i+1].split(',');
            if (nextFields[10] && nextFields[10].length > 10) {
              console.log('次の文脈:', nextFields[10].substring(0, 200));
            }
          }
        }
        console.log('-'.repeat(50));
      }
    }
    
    // Route66が見つからない場合、他の企業名パターンを探す
    if (route66Results.length === 0) {
      console.log('\n⚠️ Route66の直接的な記載が見つかりませんでした。');
      console.log('他の企業名パターンを検索中...\n');
      
      // M社、E社、A社などの匿名化された企業を探す
      const anonymousCompanies = new Map();
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 匿名化された企業のパターン
        const patterns = [
          /([A-Z]社)/g,
          /(株式会社[^\s,]+)/g,
          /WISDOM社/g,
        ];
        
        for (const pattern of patterns) {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(company => {
              if (!company.includes('株式会社AX') && !company.includes('C社') && !company.includes('グラシズ')) {
                if (!anonymousCompanies.has(company)) {
                  anonymousCompanies.set(company, []);
                }
                
                const fields = line.split(',');
                const textField = fields[10] || '';
                if (textField && textField.length > 50) {
                  anonymousCompanies.get(company).push({
                    line: i + 1,
                    content: textField.substring(0, 300)
                  });
                }
              }
            });
          }
        }
      }
      
      // 発見した企業を表示
      console.log('\n📋 他のAX CAMP受講企業:');
      console.log('=' .repeat(60));
      
      for (const [company, occurrences] of anonymousCompanies.entries()) {
        if (occurrences.length > 0) {
          console.log(`\n🏢 ${company}`);
          
          // 最初の実績情報を表示
          const first = occurrences[0];
          console.log(`  行 ${first.line}: ${first.content}`);
          
          // 実績のキーワードを探す
          const keywords = ['時間', '削減', '自動化', '効率', '成果', '向上', '改善'];
          keywords.forEach(keyword => {
            if (first.content.includes(keyword)) {
              console.log(`  → "${keyword}"に関する成果あり`);
            }
          });
        }
      }
    } else {
      // Route66の実績をまとめて表示
      console.log('\n\n📊 Route66様の実績まとめ:');
      console.log('=' .repeat(60));
      
      route66Results.forEach(result => {
        console.log(`\n行 ${result.line}:`);
        console.log(result.content);
      });
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchRoute66();