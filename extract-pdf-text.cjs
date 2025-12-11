const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

async function extractPdfText() {
  const pdfDir = 'curriculum-pdfs';
  const outputDir = 'curriculum-text';

  try {
    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });

    // PDFファイル一覧を取得
    const files = await fs.readdir(pdfDir);
    const pdfFiles = files
      .filter(file => file.endsWith('.pdf') && file.startsWith('v3'))
      .sort();

    console.log(`📚 ${pdfFiles.length}件のPDFからテキスト抽出を開始...\n`);

    const allChapters = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      console.log(`[${i + 1}/${pdfFiles.length}] 📖 ${pdfFile} を処理中...`);

      try {
        // PDFファイルを読み込み
        const pdfPath = path.join(pdfDir, pdfFile);
        const dataBuffer = await fs.readFile(pdfPath);

        // PDFからテキスト抽出
        const data = await pdf(dataBuffer);

        // ファイル名から章番号とタイトルを抽出
        const match = pdfFile.match(/v3\.(\d+)-(.+)\.pdf/);
        if (!match) continue;

        const chapterNum = parseInt(match[1]);
        const chapterTitle = match[2];

        // テキストデータを構造化
        const chapterData = {
          chapter: chapterNum,
          title: chapterTitle,
          fileName: pdfFile,
          pageCount: data.numpages,
          textContent: data.text,
          extractedAt: new Date().toISOString()
        };

        // 個別のテキストファイルとして保存
        const textFileName = `chapter${chapterNum.toString().padStart(2, '0')}_${chapterTitle}.txt`;
        await fs.writeFile(
          path.join(outputDir, textFileName),
          data.text,
          'utf8'
        );

        console.log(`   ✅ テキスト抽出完了: ${data.numpages}ページ, ${data.text.length}文字`);

        // 全体データに追加
        allChapters.push(chapterData);

      } catch (err) {
        console.error(`   ❌ エラー: ${err.message}`);

        // エラーの場合も記録
        const match = pdfFile.match(/v3\.(\d+)-(.+)\.pdf/);
        if (match) {
          allChapters.push({
            chapter: parseInt(match[1]),
            title: match[2],
            fileName: pdfFile,
            error: err.message,
            extractedAt: new Date().toISOString()
          });
        }
      }
    }

    // 章番号順にソート
    allChapters.sort((a, b) => a.chapter - b.chapter);

    // 統合JSONファイルとして保存
    await fs.writeFile(
      path.join(outputDir, 'all-chapters.json'),
      JSON.stringify(allChapters, null, 2),
      'utf8'
    );

    console.log('\n✨ テキスト抽出完了！');
    console.log(`📁 保存先: ${path.resolve(outputDir)}`);

    // 統計情報を表示
    const successCount = allChapters.filter(c => !c.error).length;
    const totalChars = allChapters.reduce((sum, c) => sum + (c.textContent ? c.textContent.length : 0), 0);

    console.log('\n📊 統計情報:');
    console.log(`- 成功: ${successCount}/${pdfFiles.length}章`);
    console.log(`- 総文字数: ${totalChars.toLocaleString()}文字`);

    return allChapters;

  } catch (error) {
    console.error('エラー:', error.message);
    throw error;
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  extractPdfText().catch(console.error);
}

module.exports = extractPdfText;