// AI秘書の詳細を検索
const driveAuth = require('./services/driveAutoAuth.cjs');

async function searchAISecretary() {
  console.log('🔍 AI秘書関連の情報を検索中...\n');
  
  try {
    const csvContent = await driveAuth.getCSVFile();
    
    // 検索キーワード
    const keywords = [
      'AI秘書', '秘書', 'アシスタント', 
      '作り方', '構築', '実装', '開発',
      'プロンプト', 'GPT', 'Claude', 'Gemini',
      '自動化', 'ツール', 'API', 'システム'
    ];
    
    console.log('📊 CSVデータサイズ:', csvContent.length, '文字\n');
    
    // 各キーワードで検索
    keywords.forEach(keyword => {
      if (csvContent.includes(keyword)) {
        console.log(`✅ 「${keyword}」を発見`);
        
        // 該当箇所の前後を表示
        const index = csvContent.indexOf(keyword);
        const start = Math.max(0, index - 200);
        const end = Math.min(csvContent.length, index + 300);
        const context = csvContent.substring(start, end);
        
        console.log('   コンテキスト:');
        console.log('   ' + context.replace(/\n/g, '\n   '));
        console.log('\n---\n');
      }
    });
    
    // 行単位でも検索
    console.log('📝 行単位の検索結果:\n');
    const lines = csvContent.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('AI秘書') || line.includes('秘書')) {
        console.log(`行${i + 1}:`, line.substring(0, 500));
        console.log('\n');
      }
    });
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchAISecretary();