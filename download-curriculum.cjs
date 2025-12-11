const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function downloadCurriculum() {
  try {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    const drive = google.drive({ version: 'v3', auth });

    const folderId = '1S1NSTYPEMGmFG3uxI6Duhb6bK5sU3WA-';
    const outputDir = 'curriculum-pdfs';

    console.log('📚 カリキュラムPDFのダウンロードを開始...\n');

    // v3シリーズのPDFファイルリストを取得
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'v3' and mimeType='application/pdf'`,
      fields: 'files(id, name)',
      orderBy: 'name'
    });

    const pdfFiles = response.data.files;
    console.log(`📊 ${pdfFiles.length}件のカリキュラムPDFを発見\n`);

    // 各PDFをダウンロード
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      console.log(`[${i + 1}/${pdfFiles.length}] 📥 ${file.name} をダウンロード中...`);

      try {
        const dest = fs.createWriteStream(path.join(outputDir, file.name));
        const res = await drive.files.get(
          { fileId: file.id, alt: 'media' },
          { responseType: 'stream' }
        );

        await new Promise((resolve, reject) => {
          res.data
            .on('end', () => {
              console.log(`   ✅ 完了: ${file.name}`);
              resolve();
            })
            .on('error', err => {
              console.error(`   ❌ エラー: ${file.name}`, err.message);
              reject(err);
            })
            .pipe(dest);
        });

        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`   ⚠️ スキップ: ${file.name} - ${err.message}`);
      }
    }

    console.log('\n✨ ダウンロード完了！');
    console.log(`📁 保存先: ${path.resolve(outputDir)}`);

  } catch (error) {
    console.error('エラー:', error.message);
  }
}

downloadCurriculum();