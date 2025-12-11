// Google Driveのフォルダ構造を探索
const { google } = require('googleapis');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function exploreDrive() {
  console.log('🔍 Google Driveのフォルダ構造を探索中...\n');
  
  try {
    // ADC認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    // ルートフォルダのIDから探索開始
    const rootFolderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    console.log('📁 ルートフォルダのコンテンツ:');
    console.log('================================\n');
    
    // フォルダ内のすべてのファイル・フォルダを取得
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 100
    });
    
    const items = response.data.files || [];
    
    // フォルダとファイルを分類
    const folders = [];
    const files = [];
    
    items.forEach(item => {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        folders.push(item);
      } else {
        files.push(item);
      }
    });
    
    // フォルダを表示
    if (folders.length > 0) {
      console.log('📁 フォルダ:');
      folders.forEach(folder => {
        console.log(`   - ${folder.name} (ID: ${folder.id})`);
      });
      console.log('');
    }
    
    // ファイルを表示
    if (files.length > 0) {
      console.log('📄 ファイル:');
      files.forEach(file => {
        const size = file.size ? `${Math.round(file.size / 1024)}KB` : 'N/A';
        console.log(`   - ${file.name} (${size})`);
      });
      console.log('');
    }
    
    // videoフォルダを探す
    const videoFolder = folders.find(f => 
      f.name.toLowerCase().includes('video') || 
      f.name.toLowerCase().includes('動画')
    );
    
    if (videoFolder) {
      console.log('🎥 Videoフォルダを発見！');
      console.log(`   フォルダ名: ${videoFolder.name}`);
      console.log(`   フォルダID: ${videoFolder.id}\n`);
      
      // videoフォルダの中身を確認
      console.log('📹 Videoフォルダの内容:');
      console.log('================================\n');
      
      const videoResponse = await drive.files.list({
        q: `'${videoFolder.id}' in parents`,
        fields: 'files(id, name, mimeType, size)',
        pageSize: 100
      });
      
      const videoItems = videoResponse.data.files || [];
      
      videoItems.forEach(item => {
        const size = item.size ? `${Math.round(item.size / 1024)}KB` : 'N/A';
        console.log(`   - ${item.name}`);
        console.log(`     タイプ: ${item.mimeType}`);
        console.log(`     サイズ: ${size}`);
        console.log(`     ID: ${item.id}\n`);
        
        // AI秘書関連のファイルをハイライト
        if (item.name.includes('AI秘書') || item.name.includes('秘書')) {
          console.log(`   ⭐ AI秘書関連ファイル発見！`);
        }
      });
      
      // CSVファイルがあれば内容を確認
      const csvFiles = videoItems.filter(item => 
        item.name.endsWith('.csv') || 
        item.mimeType === 'text/csv'
      );
      
      if (csvFiles.length > 0) {
        console.log('\n📊 CSVファイル発見:');
        for (const csvFile of csvFiles) {
          console.log(`\n   📄 ${csvFile.name} の内容を取得中...`);
          
          try {
            const fileContent = await drive.files.get({
              fileId: csvFile.id,
              alt: 'media'
            }, {
              responseType: 'text'
            });
            
            const content = fileContent.data;
            console.log(`   サイズ: ${content.length} 文字`);
            
            // AI秘書の記述を探す
            if (content.includes('AI秘書')) {
              console.log('   ✨ AI秘書の記述を発見！');
              const lines = content.split('\n');
              const aiSecretaryLines = lines.filter(line => 
                line.includes('AI秘書') || 
                line.includes('作り方') ||
                line.includes('構築方法')
              );
              
              console.log(`   関連行数: ${aiSecretaryLines.length}`);
              aiSecretaryLines.slice(0, 3).forEach((line, i) => {
                console.log(`\n   --- 記述 ${i+1} ---`);
                console.log(`   ${line.substring(0, 300)}`);
              });
            }
          } catch (error) {
            console.log(`   ❌ 読み取りエラー: ${error.message}`);
          }
        }
      }
      
    } else {
      console.log('⚠️ videoフォルダが見つかりませんでした');
      console.log('   利用可能なフォルダ:');
      folders.forEach(f => console.log(`   - ${f.name}`));
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error('\n詳細:', error);
  }
}

exploreDrive();