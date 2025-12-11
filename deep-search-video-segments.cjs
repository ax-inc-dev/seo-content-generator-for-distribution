// video_segments.csv を詳しく調査
const { google } = require('googleapis');

async function deepSearchVideoSegments() {
  console.log('🎥 video_segments.csv の詳細調査開始...\n');
  
  try {
    // ADC認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    const rootFolderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // video_segments.csv を取得
    console.log('📄 video_segments.csv を取得中...');
    
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and name='video_segments.csv'`,
      fields: 'files(id, name)',
      pageSize: 1
    });
    
    const files = response.data.files || [];
    if (files.length === 0) {
      console.log('❌ video_segments.csv が見つかりません');
      return;
    }
    
    const fileId = files[0].id;
    
    // ファイル内容を取得
    const fileContent = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'text'
    });
    
    const csvContent = fileContent.data;
    console.log(`✅ 取得成功！サイズ: ${csvContent.length} 文字\n`);
    
    // 全ての行を確認
    const lines = csvContent.split('\n');
    console.log(`📊 総行数: ${lines.length}\n`);
    
    // ヘッダー行を確認
    if (lines.length > 0) {
      console.log('📝 ヘッダー（カラム名）:');
      console.log(lines[0]);
      console.log('\n');
    }
    
    // AI秘書関連の行を全て探す
    console.log('🔍 AI秘書に関する全ての記述を検索...\n');
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('ai秘書') || 
          line.toLowerCase().includes('秘書') ||
          (line.includes('徹底解説') && line.includes('作り方'))) {
        
        console.log(`━━━ 行 ${index + 1} ━━━`);
        
        // CSVフィールドを解析（カンマで分割）
        const fields = line.split(',');
        
        // 各フィールドを表示
        fields.forEach((field, i) => {
          if (field && field.trim() && field.trim() !== '""' && field.trim() !== "''") {
            // textフィールド（実際の内容）を探す
            if (field.length > 100 || field.includes('。') || field.includes('、')) {
              console.log(`\n📖 テキスト内容（フィールド${i}）:`);
              console.log(field);
            } else if (field.includes('.mp4') || field.includes('AI秘書')) {
              console.log(`フィールド${i}: ${field}`);
            }
          }
        });
        
        console.log('\n---完全な行データ---');
        console.log(line);
        console.log('\n================================\n');
      }
    });
    
    // 「作り方」を含む行も別途検索
    console.log('🔍 「作り方」を含む行を追加検索...\n');
    let foundCount = 0;
    
    lines.forEach((line, index) => {
      if (line.includes('作り方') && !line.includes('AI秘書')) {
        foundCount++;
        if (foundCount <= 5) {  // 最初の5件のみ表示
          console.log(`行 ${index + 1}: ${line.substring(0, 200)}...`);
        }
      }
    });
    
    console.log(`\n📊 「作り方」を含む行: 合計 ${foundCount} 件`);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

deepSearchVideoSegments();