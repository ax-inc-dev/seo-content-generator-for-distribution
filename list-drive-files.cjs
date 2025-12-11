const { google } = require('googleapis');
const driveAutoAuth = require('./services/driveAutoAuth.cjs');

async function listDriveFiles() {
  try {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    const drive = google.drive({ version: 'v3', auth });

    // フォルダ内のファイル一覧を取得
    const response = await drive.files.list({
      q: "'1Rf4X5PxJj1en4NcpYIUmF-98jTSJv3dR' in parents",
      fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 30
    });

    console.log('📁 Google Drive内のファイル一覧（最新順）');
    console.log('=' .repeat(60));

    const knownFiles = ['pdf_segments_index.csv', 'video_segments.csv'];
    const newFiles = [];
    const allFiles = [];

    response.data.files.forEach((file) => {
      const size = file.size ? (parseInt(file.size) / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
      const modDate = new Date(file.modifiedTime);
      const formattedDate = modDate.toLocaleDateString('ja-JP') + ' ' +
                           modDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      const fileInfo = {
        name: file.name,
        type: file.mimeType,
        date: formattedDate,
        size: size,
        isNew: !knownFiles.includes(file.name)
      };

      allFiles.push(fileInfo);
      if (fileInfo.isNew) {
        newFiles.push(fileInfo);
      }
    });

    // 新しいファイルを先に表示
    if (newFiles.length > 0) {
      console.log('\n🆕 新しく追加されたファイル:');
      console.log('-'.repeat(60));
      newFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   タイプ: ${file.type}`);
        console.log(`   更新日: ${file.date}`);
        console.log(`   サイズ: ${file.size}`);
        console.log('');
      });
    }

    console.log('\n📄 すべてのファイル:');
    console.log('-'.repeat(60));
    allFiles.forEach((file, index) => {
      const mark = file.isNew ? '🆕 ' : '   ';
      console.log(`${mark}${index + 1}. ${file.name}`);
      console.log(`      更新日: ${file.date}`);
      console.log(`      サイズ: ${file.size}`);
    });

    console.log('\n📊 統計:');
    console.log(`- 総ファイル数: ${allFiles.length}`);
    console.log(`- 新規ファイル: ${newFiles.length}`);
    console.log(`- 既知ファイル: ${allFiles.length - newFiles.length}`);

  } catch (error) {
    console.error('エラー:', error.message);
    if (error.code === 404) {
      console.error('フォルダが見つかりません。フォルダIDを確認してください。');
    }
  }
}

listDriveFiles();