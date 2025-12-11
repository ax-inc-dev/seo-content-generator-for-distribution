// Company Data API テストスクリプト
// ADC認証とAPI keyフォールバックの動作確認

const http = require('http');

async function testCompanyDataAPI() {
  console.log('🧪 Company Data API テスト開始');
  console.log('================================\n');
  
  try {
    // APIエンドポイントにリクエスト
    console.log('📡 GET /api/company-data を呼び出し中...');
    
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
    
    if (data.success) {
      console.log('✅ APIレスポンス成功！');
      console.log('🔐 認証方法:', data.authMethod || 'unknown');
      console.log('📊 CSVデータサイズ:', data.csvContent.length, '文字');
      
      // AI秘書の記述を確認
      if (data.csvContent.includes('AI秘書')) {
        console.log('✨ "AI秘書"の記述を確認！');
        const lines = data.csvContent.split('\n');
        const aiLines = lines.filter(line => line.includes('AI秘書'));
        console.log(`   ${aiLines.length}箇所で言及されています`);
      }
      
      // 実績企業の確認
      const companies = ['グラシズ', 'Route66', 'WISDOM', 'C社'];
      console.log('\n📈 実績企業の確認:');
      companies.forEach(company => {
        if (data.csvContent.includes(company)) {
          console.log(`   ✓ ${company} のデータあり`);
        }
      });
      
    } else {
      console.error('❌ APIエラー:', data.error);
    }
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    console.log('\n💡 対処法:');
    console.log('   1. スクレイピングサーバーが起動しているか確認: npm run server');
    console.log('   2. ADC認証の設定: gcloud auth application-default login');
    console.log('   3. 環境変数の確認: GOOGLE_API_KEY または VITE_GOOGLE_API_KEY');
  }
  
  console.log('\n================================');
  console.log('🏁 テスト完了');
}

// サーバーが起動していることを確認してから実行
console.log('⏳ サーバー起動を待機中（3秒）...\n');
setTimeout(() => {
  testCompanyDataAPI();
}, 3000);