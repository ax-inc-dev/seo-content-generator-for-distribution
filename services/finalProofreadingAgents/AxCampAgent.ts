// AX CAMP専門エージェント
import { BaseProofreadingAgent } from './BaseAgent';
import { curriculumDataService } from '../curriculumDataService';
import type { Issue, Suggestion } from './types';

export class AxCampAgent extends BaseProofreadingAgent {
  constructor() {
    super(
      'AX CAMP専門エージェント',
      'ax-camp',
      'gpt-5-nano' // 自社情報なので高速処理
    );
  }
  
  protected async performCheck(content: string, context?: any): Promise<{
    score: number;
    issues: Issue[];
    suggestions: Suggestion[];
    confidence: number;
  }> {
    const prompt = `
あなたはAX CAMP関連情報の正確性と一貫性を確保する専門家です。
以下の記事からAX CAMP関連の記述を検証してください。

【記事内容】
${content}

【正しいAX CAMP情報】
- 会社名: 株式会社AX
- サービス名: AX CAMP（エーエックスキャンプ）
- サービス内容: AI活用研修、AI導入支援、実践型トレーニング
- 特徴: 非エンジニアでもAI活用可能、実践型研修、成果保証

【実績企業と成果（正確な数値）】
1. グラシズ様
   - 業界: リスティング広告運用企業
   - 成果: LP制作費10万円/月→0円（内製化）
   - 制作時間: 3営業日→2時間（93%削減）

2. Route66様
   - 業界: マーケティング支援企業
   - 成果: 原稿執筆時間24時間→10秒（99.99%削減）

3. C社様
   - 業界: メディア運営企業
   - 成果: 月間1,000万impを自動化
   - 業務時間: 1日3時間以上→わずか1時間（66%削減）

4. WISDOM様
   - 業界: SNS広告・ショート動画制作企業
   - 成果: AI導入で採用2名分の業務をAI代替

5. Foxx様
   - 業界: 広告運用業務
   - 成果: 新規事業創出を実現

【検証項目】
1. AX CAMP実績データの正確性
2. サービス内容の最新性
3. 料金・プラン情報の確認
4. 自社情報の一貫性確保
5. ブランド表記の統一性

【出力形式】
{
  "score": 0-100の評価点,
  "confidence": 0-100の確信度,
  "issues": [
    {
      "type": "brand-error" | "factual-error",
      "severity": "critical" | "major" | "minor",
      "location": "【H2見出し名】セクション内の「具体的な文章を20-30文字程度引用」の部分",
      "description": "問題の説明",
      "original": "元の記述",
      "suggestion": "正しい記述",
      "confidence": 0-100
    }
  ],
  "suggestions": [
    {
      "type": "brand-consistency",
      "description": "ブランド一貫性の改善提案",
      "implementation": "具体的な実装方法",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

    try {
      const response = await this.callGPT5(prompt, false);
      return this.parseResponse(response);
    } catch (error) {
      console.error('AX CAMPチェックエラー:', error);
      return {
        score: 90,
        issues: [],
        suggestions: [],
        confidence: 85
      };
    }
  }
}