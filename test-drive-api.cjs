// Google Drive APIを使って実績データを取得するテストスクリプト
const { google } = require('googleapis');
require('dotenv').config();

async function testDriveAccess() {
  try {
    console.log('🚀 Google Drive APIテスト開始');
    
    // APIキーを使った認証
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    console.log('APIキー確認:', apiKey ? `${apiKey.substring(0, 10)}...` : 'なし');
    
    if (!apiKey) {
      throw new Error('Google APIキーが設定されていません');
    }
    
    // Drive APIクライアントを初期化
    const drive = google.drive({ 
      version: 'v3',
      auth: apiKey  // APIキーで認証
    });
    
    const fileId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // ファイル情報を取得
    console.log('\n📁 ファイル/フォルダ情報を取得中...');
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size'
    });
    
    console.log('ファイル情報:', fileInfo.data);
    
    // ファイルのコンテンツを取得（CSVファイルの場合）
    if (fileInfo.data.mimeType === 'text/csv' || fileInfo.data.mimeType === 'application/vnd.ms-excel') {
      console.log('\n📊 CSVコンテンツを取得中...');
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'text'
      });
      
      const csvContent = response.data;
      
      // CSVから実績を抽出
      const lines = csvContent.split('\n');
      console.log(`\n✅ ${lines.length}行のデータを取得しました`);
      
      // C社の実績を探す
      console.log('\n🔍 C社の実績を検索中...');
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        if (lines[i].includes('C社')) {
          console.log(`\n行 ${i + 1}: ${lines[i].substring(0, 200)}...`);
        }
      }
    }
    
    // フォルダの場合、中のファイルを一覧表示
    if (fileInfo.data.mimeType === 'application/vnd.google-apps.folder') {
      console.log('\n📂 フォルダ内のファイル一覧を取得中...');
      const filesList = await drive.files.list({
        q: `'${fileId}' in parents`,
        fields: 'files(id, name, mimeType)',
        pageSize: 10
      });
      
      console.log('フォルダ内のファイル:');
      filesList.data.files.forEach(file => {
        console.log(`  - ${file.name} (${file.mimeType})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error('エラータイプ:', error.code || error.name);
    console.error('エラーメッセージ:', error.message);
    
    if (error.response) {
      console.error('レスポンス:', error.response.data);
    }
    
    // よくあるエラーの対処法
    if (error.code === 403) {
      console.log('\n💡 解決方法:');
      console.log('1. Google Cloud ConsoleでDrive APIが有効になっているか確認');
      console.log('2. APIキーの制限でDrive APIが許可されているか確認');
      console.log('3. ファイル/フォルダが「リンクを知っている全員」に共有されているか確認');
    }
  }
}

// 実行
testDriveAccess();