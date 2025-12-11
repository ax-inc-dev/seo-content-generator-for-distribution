// 最終校閲エージェント本番テスト
// TypeScriptファイルを直接importできないので、動的importを使用
const loadAgent = async () => {
  try {
    // TypeScriptの動的コンパイルを試みる
    const module = await import('./services/finalProofreadingAgent.ts');
    return module.FinalProofreadingAgent;
  } catch (error) {
    console.error('TypeScriptファイルの読み込みエラー:', error.message);
    // フォールバック: tsxで実行するか、事前にビルドが必要
    throw new Error('TypeScriptファイルを直接実行するには、tsx または ts-node が必要です');
  }
};
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルを読み込み
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 最終校閲エージェント本番テスト開始\n');

// テスト用の記事（意図的に間違いを含む）
const testArticle = `
<h2>GPT-6とは？最新のAI技術を解説</h2>
<p>OpenAIが2024年12月にリリースしたGPT-6は、前世代のGPT-4と比較して10倍の性能向上を実現しました。</p>

<h3>主な特徴</h3>
<ul>
  <li>コンテキストウィンドウ: 1,000,000トークン</li>
  <li>推論速度: GPT-4の20倍</li>
  <li>価格: $0.001/1Kトークン</li>
</ul>

<h3>AX CAMPの導入事例</h3>
<p>株式会社AXが提供するAX CAMPでは、GPT-6を活用して以下の成果を実現しています：</p>
<ul>
  <li>グラシズ社: LP制作費10万円→0円</li>
  <li>Route66社: 原稿執筆24時間→10秒</li>
  <li>WISDOM社: AI導入で採用5名分の業務をAI代替</li>
</ul>

<h2>まとめ</h2>
<p>GPT-6は2025年の最新AI技術として、多くの企業で活用が進んでいます。</p>
`;

async function testFinalProofreading() {
  try {
    // 1. エージェントのインスタンス作成
    console.log('===== 1. エージェント初期化 =====');
    const FinalProofreadingAgent = await loadAgent();
    const agent = new FinalProofreadingAgent('MINI'); // まずはMINIモデルでテスト
    console.log('✅ エージェント初期化完了\n');
    
    // 2. ファクトチェックのみ実行（軽量テスト）
    console.log('===== 2. ファクトチェック機能テスト =====');
    console.log('📝 テスト文章:');
    console.log('「OpenAIが2024年12月にリリースしたGPT-6」（意図的な間違い）');
    console.log('「WISDOM社: AI導入で採用5名分の業務をAI代替」（実際は2名）\n');
    
    const factCheckResults = await agent.factCheckOnly(
      'OpenAIが2024年12月にリリースしたGPT-6は、前世代のGPT-4と比較して10倍の性能向上を実現しました。',
      true // Web検索を有効化
    );
    
    console.log('📊 ファクトチェック結果:');
    factCheckResults.forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.claim}`);
      console.log(`  判定: ${result.verdict}`);
      console.log(`  信頼度: ${result.confidence}%`);
      if (result.sources.length > 0) {
        console.log(`  ソース: ${result.sources.join(', ')}`);
      }
      if (result.correction) {
        console.log(`  修正案: ${result.correction}`);
      }
    });
    
    // 3. 完全な校閲実行（オプション）
    console.log('\n\n===== 3. 完全校閲テスト（簡易版） =====');
    const proofreadRequest = {
      article: testArticle,
      keyword: 'GPT-5 AI',
      enableWebSearch: true,
      targetScore: 80
    };
    
    console.log('⏳ 校閲実行中（Web検索あり）...');
    const startTime = Date.now();
    
    const result = await agent.proofread(proofreadRequest);
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ 校閲完了（${elapsedTime}秒）\n`);
    
    // 結果表示
    console.log('📈 スコア:');
    console.log(`  総合: ${result.overallScore}/100`);
    console.log(`  SEO: ${result.scores.seo}/100`);
    console.log(`  正確性: ${result.scores.accuracy}/100`);
    console.log(`  読みやすさ: ${result.scores.readability}/100`);
    
    if (result.factCheckResults && result.factCheckResults.length > 0) {
      console.log('\n🔍 検出された問題:');
      result.factCheckResults.forEach((item, i) => {
        if (item.verdict !== 'verified') {
          console.log(`  ${i + 1}. ${item.claim}`);
          console.log(`     → ${item.verdict}: ${item.correction || '要確認'}`);
        }
      });
    }
    
    if (result.changeLog && result.changeLog.length > 0) {
      console.log('\n📝 変更ログ:');
      result.changeLog.forEach((change, i) => {
        console.log(`  ${i + 1}. [${change.importance}] ${change.type}`);
        console.log(`     元: ${change.original.substring(0, 50)}...`);
        console.log(`     新: ${change.corrected.substring(0, 50)}...`);
      });
    }
    
    // 修正後の記事があれば一部表示
    if (result.finalArticle) {
      console.log('\n✏️ 修正後の記事（冒頭部分）:');
      console.log(result.finalArticle.substring(0, 300) + '...');
    }
    
  } catch (error) {
    console.error('\n❌ テストエラー:', error.message);
    
    if (error.message.includes('APIキー')) {
      console.log('\n💡 ヒント: .envファイルにOPENAI_API_KEYが設定されているか確認してください。');
    }
    
    if (error.status === 400) {
      console.log('\n⚠️  API仕様の問題:');
      console.log('  - temperatureは1.0のみ対応の可能性');
      console.log('  - max_tokensではなくmax_completion_tokensを使用');
    }
    
    if (error.status === 404) {
      console.log('\n⚠️  モデルが見つかりません:');
      console.log('  - GPT-5が利用可能か確認');
      console.log('  - モデル名が正しいか確認');
    }
  }
}

// テスト実行
console.log('🚀 開始時刻:', new Date().toLocaleString('ja-JP'));
console.log('================================\n');

testFinalProofreading().then(() => {
  console.log('\n================================');
  console.log('🏁 完了時刻:', new Date().toLocaleString('ja-JP'));
}).catch(console.error);