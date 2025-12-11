// 自動認証テスト
const driveAuth = require('./services/driveAutoAuth.cjs');

async function testAutoAuth() {
  console.log('🚀 自動認証テスト開始');
  console.log('================================\n');
  
  try {
    // 1回目のアクセス（初回認証）
    console.log('📊 1回目: CSVファイル取得中...');
    const content1 = await driveAuth.getCSVFile();
    console.log('✅ 取得成功！サイズ:', content1.length, '文字\n');
    
    // 2回目のアクセス（キャッシュ使用）
    console.log('📊 2回目: CSVファイル取得中（キャッシュ使用）...');
    const content2 = await driveAuth.getCSVFile();
    console.log('✅ 取得成功！サイズ:', content2.length, '文字\n');
    
    // AI秘書の内容を検索
    if (content1.includes('AI秘書')) {
      console.log('✨ "AI秘書"の記述を発見！');
      const lines = content1.split('\n');
      const aiSecretaryLines = lines.filter(line => line.includes('AI秘書'));
      console.log(`   ${aiSecretaryLines.length}箇所で言及されています\n`);
    }
    
    console.log('================================');
    console.log('🎉 自動認証テスト成功！');
    console.log('\n📌 この仕組みの特徴:');
    console.log('   • 認証が自動的に更新される（50分ごと）');
    console.log('   • エラー時に自動的に再認証を試みる');
    console.log('   • サーバー起動中は常にアクセス可能');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error('\n💡 対処法:');
    console.error('   1. ./scripts/setup-drive-access.sh を実行');
    console.error('   2. または手動で: gcloud auth application-default login');
  }
}

// 実行
testAutoAuth();