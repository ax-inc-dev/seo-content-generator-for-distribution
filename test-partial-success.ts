// 部分成功機能のテスト
import { MultiAgentOrchestrator } from './services/finalProofreadingAgents/MultiAgentOrchestrator';

// モックエージェントを作成
class MockSourceAgent {
  name = '出典検索エージェント';
  type = 'source-enhancement' as const;
  model = 'gpt-5-mini' as const;
  
  private partialResults = {
    completedItems: 7,
    totalItems: 10,
    issues: [
      {
        type: 'missing-source' as const,
        severity: 'major' as const,
        location: 'テストセクション',
        description: 'テスト出典1',
        original: '元の文章',
        confidence: 80
      }
    ],
    suggestions: [],
    verified_urls: [
      { url: 'https://example.com/1', status: 'ok', title: 'テスト1' },
      { url: 'https://example.com/2', status: 'ok', title: 'テスト2' }
    ]
  };
  
  getPartialResults() {
    return this.partialResults;
  }
  
  async execute(content: string, context?: any) {
    // 20秒かかるシミュレーション（実際にはタイムアウトする）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          agentName: this.name,
          agentType: this.type,
          executionTime: 20000,
          score: 100,
          issues: [],
          suggestions: [],
          confidence: 100,
          status: 'success' as const
        });
      }, 20000);
    });
  }
}

async function testPartialSuccess() {
  console.log('🧪 部分成功機能のテスト開始');
  
  // 短いタイムアウトでテスト（3秒）
  const orchestrator = new MultiAgentOrchestrator({
    timeout: 3000,
    parallel: false
  });
  
  const mockAgent = new MockSourceAgent();
  const testContent = 'テスト記事の内容';
  
  // プライベートメソッドを直接呼び出すため、anyにキャスト
  const orch = orchestrator as any;
  
  console.log('⏳ 3秒のタイムアウトでエージェント実行...');
  
  try {
    // 出典検索エージェント専用のexecuteWithPartialResultを呼び出す
    const result = await orch.executeWithPartialResult(mockAgent, testContent, {}, 3000);
    
    console.log('\n📊 実行結果:');
    console.log('- ステータス:', result.status);
    
    if (result.status === 'partial-success') {
      console.log('✅ 部分成功として処理されました！');
      console.log('- 完了アイテム:', result.partialData?.completedItems);
      console.log('- 総アイテム:', result.partialData?.totalItems);
      console.log('- メッセージ:', result.partialData?.message);
      console.log('- スコア:', result.score);
      console.log('- 取得URL数:', result.verified_urls?.length || 0);
    } else if (result.status === 'timeout') {
      console.log('❌ タイムアウトとして処理されました（部分結果なし）');
    } else {
      console.log('🎉 完全成功！');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

// テスト実行
testPartialSuccess().then(() => {
  console.log('\n✅ テスト完了');
  process.exit(0);
}).catch(error => {
  console.error('❌ テストエラー:', error);
  process.exit(1);
});