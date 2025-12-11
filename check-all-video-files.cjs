// 全てのvideo関連ファイルをチェック
const { google } = require('googleapis');

async function checkAllVideoFiles() {
  console.log('🎥 全てのvideo関連ファイルを調査...\n');
  
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    const rootFolderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // video関連のファイルを全て取得
    console.log('📁 video関連ファイルを検索中...');
    
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and (name contains 'video' or name contains 'Video' or name contains '.mp4')`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 100
    });
    
    const files = response.data.files || [];
    console.log(`✅ ${files.length} 個のvideo関連ファイル発見\n`);
    
    // 各ファイルの情報を表示
    for (const file of files) {
      console.log(`📄 ${file.name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Type: ${file.mimeType}`);
      console.log(`   Size: ${file.size ? Math.round(file.size / 1024) + 'KB' : 'N/A'}`);
      
      // CSVやテキストファイルの場合は内容を確認
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || 
          file.name.endsWith('.parquet') || file.name.endsWith('.json')) {
        
        console.log('   📖 内容を確認中...');
        
        try {
          const fileContent = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          }, {
            responseType: 'text'
          });
          
          const content = fileContent.data;
          
          // AI秘書の記述を探す
          if (content.includes('AI秘書') || content.includes('秘書')) {
            console.log('   ✨ AI秘書の記述を発見！');
            
            // 該当部分を抽出
            const index = content.indexOf('AI秘書');
            if (index !== -1) {
              const start = Math.max(0, index - 100);
              const end = Math.min(content.length, index + 300);
              const excerpt = content.substring(start, end);
              console.log('   抜粋:');
              console.log('   ' + excerpt.replace(/\n/g, '\n   '));
            }
          }
          
          // 「作り方」の記述も探す
          if (content.includes('作り方')) {
            const makeIndex = content.indexOf('作り方');
            if (makeIndex !== -1) {
              console.log('   📝 「作り方」の記述も発見！');
              const start = Math.max(0, makeIndex - 100);
              const end = Math.min(content.length, makeIndex + 300);
              const excerpt = content.substring(start, end);
              console.log('   ' + excerpt.substring(0, 200) + '...');
            }
          }
          
        } catch (err) {
          console.log(`   ⚠️ 読み取り不可: ${err.message}`);
        }
      }
      
      console.log('');
    }
    
    // segments_index.csv も確認
    console.log('\n📊 segments_index.csv を確認...');
    
    const segmentsResponse = await drive.files.list({
      q: `'${rootFolderId}' in parents and name='segments_index.csv'`,
      fields: 'files(id, name)',
      pageSize: 1
    });
    
    if (segmentsResponse.data.files && segmentsResponse.data.files.length > 0) {
      const segmentsFile = segmentsResponse.data.files[0];
      console.log(`✅ segments_index.csv 発見 (ID: ${segmentsFile.id})`);
      
      const fileContent = await drive.files.get({
        fileId: segmentsFile.id,
        alt: 'media'
      }, {
        responseType: 'text'
      });
      
      const content = fileContent.data;
      const lines = content.split('\n');
      
      // AI秘書関連の行を探す
      lines.forEach((line, i) => {
        if (line.includes('AI秘書') || line.includes('徹底解説')) {
          console.log(`\n行${i + 1}: ${line.substring(0, 300)}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkAllVideoFiles();