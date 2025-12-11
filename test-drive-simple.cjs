// シンプルなGoogle Drive APIテスト
const { google } = require('googleapis');

async function testDriveAccess() {
  try {
    console.log('🔍 Starting simple Drive API test...');
    
    // ADC認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Auth OK');
    
    // Drive API初期化
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('✅ Drive client created');
    
    // ファイルリスト取得（軽量版）
    const response = await drive.files.list({
      pageSize: 3,  // 3件のみ
      fields: 'files(name)'  // 名前だけ
    });
    
    console.log('📁 Files found:', response.data.files.length);
    response.data.files.forEach(f => console.log(`  - ${f.name}`));
    
    console.log('✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDriveAccess();
