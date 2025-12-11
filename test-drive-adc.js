const { google } = require('googleapis');

async function testDriveAccess() {
  try {
    console.log('🔍 Testing Google Drive API with ADC...');
    
    // ADCを使用して認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Authentication successful');
    
    // Drive APIクライアントを初期化
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    // テスト用フォルダID（既存のもの）
    const FOLDER_ID = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    console.log(`📂 Accessing folder: ${FOLDER_ID}`);
    
    // フォルダ内のファイルをリスト
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: 'files(id, name, mimeType)',
      pageSize: 10
    });
    
    console.log('\n📁 Files in folder:');
    response.data.files.forEach(file => {
      console.log(`  - ${file.name} (${file.mimeType})`);
    });
    
    // CSVファイルを探す
    const csvFiles = response.data.files.filter(f => 
      f.name.includes('.csv') || f.mimeType === 'text/csv'
    );
    
    if (csvFiles.length > 0) {
      console.log('\n📊 Found CSV file:', csvFiles[0].name);
      
      // CSVファイルの内容を取得
      const fileResponse = await drive.files.get({
        fileId: csvFiles[0].id,
        alt: 'media'
      }, {
        responseType: 'text'
      });
      
      console.log('✅ Successfully retrieved CSV content');
      console.log(`   Size: ${fileResponse.data.length} characters`);
    }
    
    console.log('\n🎉 Google Drive API test successful with ADC!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 403) {
      console.error('   Permission denied. Make sure Drive API is enabled in your project.');
    }
  }
}

testDriveAccess();
