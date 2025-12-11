// Google Drive API セーフアクセステスト（クラッシュ回避版）
const { google } = require('googleapis');

async function testDriveSafe() {
  try {
    console.log('🔍 Starting safe Drive API test...');
    
    // ADC認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Auth OK');
    
    // Drive API初期化
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('✅ Drive client created');
    
    // 特定のフォルダID（AX CAMP実績データ）
    const FOLDER_ID = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // CSVファイルを検索（Optional Chainingを避ける）
    console.log('📂 Searching for CSV files in folder...');
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and (name contains '.csv' or mimeType='text/csv')`,
      fields: 'files(id,name,mimeType,size)',
      pageSize: 10
    });
    
    // 安全なデータアクセス（クラッシュ回避）
    const files = response.data.files || [];
    console.log(`📁 Found ${files.length} CSV files`);
    
    // 各ファイルの情報を安全に表示
    for (const file of files) {
      // Optional Chainingを使わず、段階的にチェック
      const fileName = file.name || 'Unknown';
      const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size';
      console.log(`  - ${fileName} (${fileSize})`);
    }
    
    // CSVファイルが見つかった場合、最初のファイルの内容を取得
    if (files.length > 0) {
      const csvFile = files[0];
      console.log(`\n📊 Fetching content of: ${csvFile.name}`);
      
      try {
        // CSVファイルの内容を取得（ストリーミングではなく一括）
        const fileContent = await drive.files.get({
          fileId: csvFile.id,
          alt: 'media'
        }, {
          responseType: 'text'
        });
        
        // 内容のサンプルを表示（最初の500文字のみ）
        const content = fileContent.data || '';
        const sample = content.substring(0, 500);
        console.log('\n📄 CSV Content Sample:');
        console.log(sample);
        console.log('...');
        console.log(`Total size: ${content.length} characters`);
        
        // 「AI秘書」に関する内容を検索
        if (content.includes('AI秘書')) {
          console.log('\n✨ Found "AI秘書" in the CSV!');
          // 該当部分を抽出（前後100文字）
          const index = content.indexOf('AI秘書');
          const start = Math.max(0, index - 100);
          const end = Math.min(content.length, index + 100);
          const snippet = content.substring(start, end);
          console.log('Context:', snippet);
        }
        
      } catch (fetchError) {
        console.error('⚠️ Error fetching file content:', fetchError.message);
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    // エラーの詳細を安全に表示
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach(err => {
        console.error('   -', err.message || err);
      });
    }
  }
}

// 実行
testDriveSafe();