// video_segments.csv を確認してAI秘書の作り方を探す
const { google } = require('googleapis');

async function checkVideoSegments() {
  console.log('🎥 Video関連ファイルからAI秘書の情報を探索中...\n');
  
  try {
    // ADC認証
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    const rootFolderId = '1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR';
    
    // video_segments.csv を取得
    console.log('📄 video_segments.csv を検索中...');
    
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and name='video_segments.csv'`,
      fields: 'files(id, name)',
      pageSize: 1
    });
    
    const files = response.data.files || [];
    
    if (files.length === 0) {
      console.log('⚠️ video_segments.csv が見つかりません');
      return;
    }
    
    const fileId = files[0].id;
    console.log(`✅ video_segments.csv を発見 (ID: ${fileId})\n`);
    
    // ファイル内容を取得
    console.log('📊 ファイル内容を取得中...');
    const fileContent = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'text'
    });
    
    const csvContent = fileContent.data;
    console.log(`✅ 取得成功！サイズ: ${csvContent.length} 文字\n`);
    
    // AI秘書関連の内容を検索
    console.log('🔍 AI秘書関連の記述を検索中...\n');
    
    const searchTerms = [
      'AI秘書', '秘書', 'アシスタント',
      '作り方', '構築', '実装', '開発',
      'プロンプト', 'API', 'GPT', 'Claude',
      '自動化', 'ツール', 'システム'
    ];
    
    const lines = csvContent.split('\n');
    const relevantLines = [];
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('ai秘書') || 
          lowerLine.includes('秘書') ||
          lowerLine.includes('作り方') ||
          lowerLine.includes('アシスタント')) {
        relevantLines.push({ index: index + 1, content: line });
      }
    });
    
    if (relevantLines.length > 0) {
      console.log(`✨ ${relevantLines.length}件の関連記述を発見！\n`);
      
      relevantLines.slice(0, 10).forEach((item, i) => {
        console.log(`━━━ 記述 ${i + 1} (行${item.index}) ━━━`);
        console.log(item.content.substring(0, 500));
        console.log('');
      });
      
      // 詳細な内容を抽出
      console.log('\n📝 AI秘書の作り方に関する詳細情報:');
      console.log('================================\n');
      
      relevantLines.forEach(item => {
        if (item.content.includes('作り方') || 
            item.content.includes('構築') || 
            item.content.includes('実装')) {
          console.log('【具体的な手順】');
          console.log(item.content);
          console.log('\n---\n');
        }
      });
      
    } else {
      console.log('⚠️ AI秘書に関する記述が見つかりませんでした');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.response) {
      console.error('詳細:', error.response.data);
    }
  }
}

checkVideoSegments();