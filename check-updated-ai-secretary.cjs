// 更新されたAI秘書のデータを確認
const driveAuth = require('./services/driveAutoAuth.cjs');

async function checkUpdatedAISecretary() {
  console.log('🔄 更新されたデータを確認中...\n');
  console.log('時刻:', new Date().toLocaleString('ja-JP'), '\n');
  
  try {
    // 最新のデータを取得（キャッシュをクリア）
    driveAuth.drive = null;
    driveAuth.lastAuthTime = null;
    
    console.log('📚 PDF + Video 統合データを取得中...\n');
    const allContent = await driveAuth.getAllSegments();
    
    console.log('✅ データ取得成功');
    console.log('📏 総データサイズ:', allContent.length, '文字\n');
    
    // AI秘書関連の全ての行を探す
    const lines = allContent.split('\n');
    const aiSecretaryLines = [];
    
    lines.forEach((line, index) => {
      if (line.includes('AI秘書') || 
          line.includes('【徹底解説】') ||
          line.includes('作り方')) {
        aiSecretaryLines.push({
          lineNumber: index + 1,
          content: line
        });
      }
    });
    
    console.log(`🎯 AI秘書関連の記述: ${aiSecretaryLines.length}件発見\n`);
    
    // 特に重要な「【徹底解説】AI秘書の作り方」を探す
    const tutorialLines = aiSecretaryLines.filter(item => 
      item.content.includes('【徹底解説】AI秘書の作り方')
    );
    
    if (tutorialLines.length > 0) {
      console.log('⭐⭐⭐ AI秘書の作り方 - 詳細データ発見！ ⭐⭐⭐\n');
      
      tutorialLines.forEach((item, i) => {
        console.log(`━━━ エントリ ${i + 1} (行${item.lineNumber}) ━━━\n`);
        
        // CSVフィールドを詳しく解析
        const fields = item.content.split(',');
        
        // transcript フィールドを探す（通常10番目あたり）
        let transcriptField = null;
        let textField = null;
        
        fields.forEach((field, idx) => {
          // 長いテキストフィールドを探す
          if (field.length > 200) {
            console.log(`📝 詳細テキスト発見（フィールド${idx}）:`);
            console.log('---内容---');
            // エスケープされた改行を実際の改行に変換
            const formattedText = field
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"');
            console.log(formattedText);
            console.log('---終了---\n');
            
            if (idx === 9) transcriptField = field;
            if (idx === 21) textField = field;
          }
        });
        
        // 主要フィールドの表示
        console.log('📊 主要フィールド:');
        if (fields[2]) console.log('  ファイル名:', fields[2]);
        if (fields[3]) console.log('  タイトル:', fields[3]);
        if (fields[9] && fields[9] !== '[未処理]' && fields[9].length > 50) {
          console.log('  transcript:', fields[9].substring(0, 500) + '...');
        }
        if (fields[10]) console.log('  サマリー:', fields[10]);
        
        // text フィールド（21番目）も確認
        if (fields[21] && fields[21].length > 50) {
          console.log('\n📖 テキストフィールド内容:');
          const cleanText = fields[21]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/^\"|\"$/g, '');
          console.log(cleanText.substring(0, 1000));
          if (cleanText.length > 1000) {
            console.log('\n... (続きあり、合計', cleanText.length, '文字)');
          }
        }
        
        console.log('\n================================\n');
      });
      
      // 処理状態の確認
      const unprocessed = tutorialLines.filter(item => 
        item.content.includes('[未処理')
      );
      
      if (unprocessed.length === 0) {
        console.log('✨ 全てのAI秘書データが処理済みです！');
      } else {
        console.log(`⚠️ ${unprocessed.length}件が未処理状態です`);
      }
      
    } else {
      console.log('⚠️ 【徹底解説】AI秘書の作り方 が見つかりませんでした');
    }
    
    // その他のAI秘書関連情報も表示
    console.log('\n📌 その他のAI秘書関連情報:\n');
    
    const otherLines = aiSecretaryLines.filter(item => 
      !item.content.includes('【徹底解説】') && 
      item.content.includes('AI秘書')
    );
    
    otherLines.slice(0, 3).forEach((item, i) => {
      console.log(`${i + 1}. 行${item.lineNumber}:`);
      console.log('   ', item.content.substring(0, 200));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error('詳細:', error);
  }
}

checkUpdatedAISecretary();