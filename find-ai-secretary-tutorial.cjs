// AI秘書の作り方の詳細情報を探す
const http = require('http');

async function findAISecretaryTutorial() {
  console.log('🔍 AI秘書の作り方を検索中...\n');
  
  try {
    // APIから統合データを取得
    const data = await new Promise((resolve, reject) => {
      http.get('http://localhost:3001/api/company-data', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('JSONパースエラー'));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    if (!data.success) {
      console.error('❌ データ取得失敗:', data.error);
      return;
    }
    
    console.log('✅ データ取得成功');
    console.log('🔐 認証方法:', data.authMethod);
    console.log('📊 データソース:', data.dataSource);
    console.log('📏 データサイズ:', data.csvContent.length, '文字\n');
    
    const csvContent = data.csvContent;
    
    // AI秘書関連の行を探す
    const lines = csvContent.split('\n');
    const aiSecretaryLines = [];
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('ai秘書') || 
          lowerLine.includes('【徹底解説】') ||
          lowerLine.includes('作り方')) {
        aiSecretaryLines.push({
          lineNumber: index + 1,
          content: line
        });
      }
    });
    
    console.log(`📝 AI秘書関連の記述: ${aiSecretaryLines.length}件\n`);
    
    // 詳細を表示
    aiSecretaryLines.forEach((item, i) => {
      console.log(`━━━ 記述 ${i + 1} (行${item.lineNumber}) ━━━`);
      
      // CSVフィールドを解析
      const fields = item.content.split(',');
      
      // ファイル名を探す
      fields.forEach(field => {
        if (field.includes('AI秘書') || field.includes('作り方')) {
          console.log('📄 ファイル名:', field);
        }
      });
      
      // 内容の一部を表示
      console.log('📝 内容:', item.content.substring(0, 300));
      console.log('');
    });
    
    // 特に重要な情報を強調
    const tutorialLine = aiSecretaryLines.find(item => 
      item.content.includes('【徹底解説】AI秘書の作り方')
    );
    
    if (tutorialLine) {
      console.log('⭐⭐⭐ 重要な発見 ⭐⭐⭐');
      console.log('動画ファイル: 【徹底解説】AI秘書の作り方-_エクスポート.mp4');
      console.log('場所: video_segments.csv');
      console.log('\n💡 この動画にAI秘書の作り方の詳細が含まれています！');
      
      // CSVの該当行を詳しく解析
      const fields = tutorialLine.content.split(',');
      console.log('\n📊 詳細情報:');
      fields.forEach((field, i) => {
        if (field && field.trim()) {
          console.log(`  フィールド${i}: ${field.trim()}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('\n💡 対処法:');
    console.log('   1. サーバーが起動しているか確認: npm run server');
    console.log('   2. ADC認証が設定されているか確認');
  }
}

// 実行
console.log('⏳ サーバー起動を待機中（2秒）...\n');
setTimeout(() => {
  findAISecretaryTutorial();
}, 2000);