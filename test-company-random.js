// 企業事例のランダム選択をテスト
import { companyDataService } from './services/companyDataService.js';

async function testRandomSelection() {
  console.log('🧪 企業事例のランダム選択テスト開始\n');
  console.log('=' .repeat(60));

  // フォールバックデータを使ってテスト
  const testKeywords = ['AI', 'LP制作', '自動化', 'SNS', 'マーケティング'];

  for (const keyword of testKeywords) {
    console.log(`\n📌 キーワード: "${keyword}"`);
    console.log('-'.repeat(40));

    // 3回実行して異なる結果が出るか確認
    for (let i = 1; i <= 3; i++) {
      try {
        const data = await companyDataService.fetchCompanyData();
        const selected = companyDataService.searchRelevantData(keyword, data);

        console.log(`\n試行 ${i}:`);
        if (selected.length > 0) {
          const companies = selected.map(c => c.company);
          const industries = selected.map(c => c.industry || '不明');
          const resultTypes = selected.map(c => {
            const delta = c.result?.delta?.toLowerCase() || '';
            if (delta.includes('円') || delta.includes('コスト')) return 'コスト削減';
            if (delta.includes('時間') || delta.includes('%削減')) return '時間短縮';
            if (delta.includes('imp') || delta.includes('自動化')) return '規模拡大';
            if (delta.includes('採用') || delta.includes('人')) return '人材代替';
            if (delta.includes('新規') || delta.includes('創出')) return '新規創出';
            return '不明';
          });

          console.log(`  選択企業: ${companies.join(', ')}`);
          console.log(`  業界: ${industries.join(', ')}`);
          console.log(`  成果タイプ: ${resultTypes.join(', ')}`);
        } else {
          console.log('  関連データなし');
        }
      } catch (error) {
        console.error(`  エラー: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ テスト完了');
  console.log('\n💡 期待される結果:');
  console.log('  - 同じキーワードでも異なる企業が選ばれることがある');
  console.log('  - 業界が分散している（マーケティング、SNS・動画、IT・サービスなど）');
  console.log('  - 成果タイプが分散している（コスト削減、時間短縮、規模拡大など）');
}

// テスト実行
testRandomSelection().catch(console.error);