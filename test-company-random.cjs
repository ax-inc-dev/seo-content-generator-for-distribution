// 企業事例のランダム選択をテスト（ブラウザでテスト用）
// ブラウザのコンソールで実行する用のスクリプト

const testScript = `
async function testRandomSelection() {
  console.log('🧪 企業事例のランダム選択テスト開始');
  console.log('='.repeat(60));

  // サービスをimport
  const { companyDataService } = await import('./services/companyDataService.ts');

  const testKeywords = ['AI', 'LP制作', '自動化', 'SNS', 'マーケティング'];

  for (const keyword of testKeywords) {
    console.log(\`\\n📌 キーワード: "\${keyword}"\`);
    console.log('-'.repeat(40));

    // 3回実行して異なる結果が出るか確認
    for (let i = 1; i <= 3; i++) {
      try {
        const data = await companyDataService.fetchCompanyData();
        const selected = companyDataService.searchRelevantData(keyword, data);

        console.log(\`\\n試行 \${i}:\`);
        if (selected.length > 0) {
          const companies = selected.map(c => c.company);
          console.log(\`  選択企業: \${companies.join(', ')}\`);

          // 業界の多様性を確認
          const industries = new Set(selected.map(c => {
            const ind = c.industry?.toLowerCase() || '';
            if (ind.includes('マーケティング') || ind.includes('広告運用')) return 'マーケティング';
            if (ind.includes('sns') || ind.includes('動画')) return 'SNS・動画';
            if (ind.includes('it') || ind.includes('サービス')) return 'IT・サービス';
            return 'その他';
          }));
          console.log(\`  業界カテゴリ: \${[...industries].join(', ')}\`);

          // 成果タイプの多様性を確認
          const resultTypes = new Set(selected.map(c => {
            const delta = c.result?.delta?.toLowerCase() || '';
            if (delta.includes('円') || delta.includes('コスト')) return 'コスト削減';
            if (delta.includes('時間') || delta.includes('%削減')) return '時間短縮';
            if (delta.includes('imp') || delta.includes('自動化')) return '規模拡大';
            if (delta.includes('採用') || delta.includes('人')) return '人材代替';
            if (delta.includes('新規') || delta.includes('創出')) return '新規創出';
            return '不明';
          }));
          console.log(\`  成果タイプ: \${[...resultTypes].join(', ')}\`);
        } else {
          console.log('  関連データなし');
        }
      } catch (error) {
        console.error(\`  エラー: \${error.message}\`);
      }
    }
  }

  console.log('\\n' + '='.repeat(60));
  console.log('✅ テスト完了');
  console.log('\\n💡 期待される結果:');
  console.log('  - 同じキーワードでも異なる企業が選ばれることがある');
  console.log('  - 業界が分散している（マーケティング、SNS・動画、IT・サービスなど）');
  console.log('  - 成果タイプが分散している（コスト削減、時間短縮、規模拡大など）');
}

// 実行
testRandomSelection();
`;

console.log(`
=================================================
ブラウザコンソールで以下を実行してください：
=================================================
`);
console.log(testScript);
console.log(`
=================================================
上記のスクリプトをコピーしてブラウザのコンソールで実行してください。
実行方法：
1. http://localhost:5176 を開く
2. F12でデベロッパーツールを開く
3. Consoleタブに移動
4. 上記のスクリプトを貼り付けて実行
=================================================
`);