// カリキュラムデータサービスの動作テスト
const fs = require('fs');

// JSONファイルを読み込み
const curriculumData = JSON.parse(fs.readFileSync('data/ax-camp-curriculum.json', 'utf8'));

console.log('📚 AX CAMPカリキュラムデータ テスト');
console.log('=====================================\n');

// 基本情報の確認
console.log('📊 基本情報:');
console.log(`  バージョン: ${curriculumData.ax_camp_curriculum.version}`);
console.log(`  章数: ${curriculumData.ax_camp_curriculum.chapters.length}章`);
console.log('');

// 各章のタイトルと内容量を表示
console.log('📖 収録章:');
curriculumData.ax_camp_curriculum.chapters.forEach(chapter => {
  console.log(`  第${chapter.chapter_id}章: ${chapter.title}`);
  console.log(`    - ページ数: ${chapter.page_count || 'N/A'}`);
  console.log(`    - 主要セクション: ${chapter.main_sections ? chapter.main_sections.length : 0}個`);
  console.log(`    - 実例: ${chapter.examples ? chapter.examples.length : 0}カテゴリ`);
  console.log(`    - 実践Tips: ${chapter.practical_tips ? chapter.practical_tips.length : 0}個`);
});

console.log('\n🔍 キーワード検索テスト:');

// 検索機能のシミュレーション
function findRelevantChapter(keyword) {
  const lowerKeyword = keyword.toLowerCase();

  for (const chapter of curriculumData.ax_camp_curriculum.chapters) {
    // タイトルマッチ
    if (chapter.title.toLowerCase().includes(lowerKeyword)) {
      return chapter;
    }

    // キーコンセプトマッチ
    if (chapter.key_concepts) {
      for (const [concept] of Object.entries(chapter.key_concepts)) {
        if (concept.toLowerCase().includes(lowerKeyword)) {
          return chapter;
        }
      }
    }
  }

  return null;
}

// テストキーワード
const testKeywords = [
  'プロンプト',
  'AI活用',
  'ハルシネーション',
  'エージェント',
  '7つの要素'
];

testKeywords.forEach(keyword => {
  const result = findRelevantChapter(keyword);
  if (result) {
    console.log(`  ✅ "${keyword}" → 第${result.chapter_id}章: ${result.title}`);

    // 関連するキーコンセプトを表示
    if (result.key_concepts) {
      const concepts = Object.keys(result.key_concepts).slice(0, 3);
      console.log(`     関連概念: ${concepts.join(', ')}`);
    }
  } else {
    console.log(`  ❌ "${keyword}" → 該当なし`);
  }
});

console.log('\n✨ テスト完了！');
console.log('カリキュラムデータは正常に読み込み可能です。');
console.log('\n💡 使用方法:');
console.log('  - writingAgentV3: キーワードに応じてカリキュラム情報を自動参照');
console.log('  - writingCheckerV3: カリキュラムとの整合性チェック');
console.log('  - AxCampAgent: AX CAMP固有の情報検証');
console.log('  - articleRevisionService: カリキュラムを考慮した修正提案');