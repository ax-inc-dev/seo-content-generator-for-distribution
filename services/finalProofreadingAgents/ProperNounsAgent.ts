// 固有名詞校閲エージェント
import { BaseProofreadingAgent } from './BaseAgent';
import type { Issue, Suggestion } from './types';
import { COMPANY_MASTER } from '../companyMasterData';
import latestAIModels from '../../data/latestAIModels.json';

export class ProperNounsAgent extends BaseProofreadingAgent {
  constructor() {
    super(
      '固有名詞校閲エージェント',
      'proper-nouns',
      'gpt-5-mini' // Web検索を使うため中規模モデル
    );
  }
  
  // AIモデル名の最新性をチェック
  private checkAIModelNames(content: string): Issue[] {
    const issues: Issue[] = [];

    // 古いモデル名が使われていないかチェック
    for (const oldModel of latestAIModels.deprecatedTerms.doNotUse) {
      const regex = new RegExp(`\\b${oldModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);

      if (matches) {
        const newModel = latestAIModels.replacementRules[oldModel as keyof typeof latestAIModels.replacementRules];
        if (newModel) {
          issues.push({
            type: 'factual-error',
            severity: 'critical',
            location: `AIモデル名の言及`,
            description: `古いAIモデル名「${oldModel}」が使用されています。${latestAIModels.currentDate.displayText}時点の最新モデルに更新してください。`,
            original: oldModel,
            suggestion: newModel,
            confidence: 100
          });
        }
      }
    }

    return issues;
  }

  // AX CAMP関連企業の誤情報をチェック
  private checkAxCampCompanies(content: string): Issue[] {
    const issues: Issue[] = [];

    // COMPANY_MASTERから動的に全企業をチェック
    for (const [key, companyInfo] of Object.entries(COMPANY_MASTER)) {
      const companyName = key;

      // 1. 会社形態の誤りをチェック（株式会社/合同会社/有限会社など）
      if (content.includes(companyName)) {
        // 正しい会社形態を抽出
        const correctForm = this.extractCompanyForm(companyInfo.fullName);
        const incorrectForms = this.getIncorrectForms(correctForm);

        // 間違った会社形態で記載されていないかチェック
        for (const incorrectForm of incorrectForms) {
          const incorrectPattern = new RegExp(`${incorrectForm}${companyName}`, 'g');
          const matches = content.match(incorrectPattern);

          if (matches) {
            issues.push({
              type: 'factual-error',
              severity: 'critical',
              location: `${companyName}の会社形態`,
              description: `正式名称は「${companyInfo.fullName}」です`,
              original: `${incorrectForm}${companyName}`,
              suggestion: companyInfo.fullName,
              confidence: 100
            });
          }
        }

        // 2. 業界・事業内容の誤りをチェック（既存のロジック）
        if (companyName === 'グラシズ' && content.match(/グラシズ.{0,20}(コンサル|Web制作|ウェブ制作)/)) {
          issues.push({
            type: 'factual-error',
            severity: 'critical',
            location: 'グラシズの事業内容',
            description: 'グラシズはリスティング広告運用企業です。コンサルティングやWeb制作は行っていません',
            original: 'コンサルティング/Web制作',
            suggestion: companyInfo.industry,
            confidence: 100
          });
        }

        if (companyName === 'C社' && content.match(/C社.{0,20}(メディア運営)/)) {
          issues.push({
            type: 'factual-error',
            severity: 'major',
            location: 'C社の事業内容',
            description: `C社は${companyInfo.industry}を行う企業です`,
            original: 'メディア運営',
            suggestion: companyInfo.industry,
            confidence: 100
          });
        }
      }
    }

    return issues;
  }

  // 会社形態を抽出するヘルパーメソッド
  private extractCompanyForm(fullName: string): string {
    if (fullName.includes('株式会社')) return '株式会社';
    if (fullName.includes('合同会社')) return '合同会社';
    if (fullName.includes('有限会社')) return '有限会社';
    if (fullName.includes('一般社団法人')) return '一般社団法人';
    if (fullName.includes('LLC')) return 'LLC';
    return '';
  }

  // 間違った会社形態のリストを取得
  private getIncorrectForms(correctForm: string): string[] {
    const allForms = ['株式会社', '合同会社', '有限会社', '一般社団法人'];
    return allForms.filter(form => form !== correctForm);
  }

  protected async performCheck(content: string, context?: any): Promise<{
    score: number;
    issues: Issue[];
    suggestions: Suggestion[];
    confidence: number;
  }> {
    // まず内部データでAX CAMP関連企業をチェック
    const axCampIssues = this.checkAxCampCompanies(content);
    const aiModelIssues = this.checkAIModelNames(content);

    // AX CAMP関連企業の正確な情報を準備
    const axCampCompanies = Object.entries(COMPANY_MASTER).map(([key, info]) =>
      `- ${info.fullName}（${info.displayName}）: ${info.industry}`
    ).join('\n');

    const prompt = `
あなたは固有名詞の正確性を検証する専門家です。
以下の記事から固有名詞（企業名、製品名、人物名、地名等）を抽出し、その正確性を検証してください。

【記事内容】
${content}

【検証項目】
1. 企業名・団体名の正式名称
2. 製品名・サービス名の表記
3. 人物名・役職の正確性
4. 地名・施設名の正確性
5. ブランド名・商標の適切な使用
6. AIモデル名の最新性（${latestAIModels.currentDate.displayText}時点）

【AIモデル名の確認】
${latestAIModels.currentDate.displayText}時点で実在する最新AIモデル：
${latestAIModels.categories.llm.latest.map(m =>
  `- ${m.model}（${m.company}、${m.releaseDate}リリース済み）`
).join('\n')}
${latestAIModels.categories.reasoning.latest.map(m =>
  `- ${m.model}（${m.company}、${m.releaseDate}リリース済み）`
).join('\n')}

これらは全て実在する最新モデルです。記事内でこれらが使用されていても「未リリース」「存在しない」と指摘しないでください。

古いモデル名（使用禁止）：
${latestAIModels.deprecatedTerms.doNotUse.slice(0, 10).map(m => `- ${m}`).join('\n')}

推奨される置き換え：
${Object.entries(latestAIModels.replacementRules).slice(0, 5).map(([old, newer]) => `- ${old} → ${newer}`).join('\n')}

【AX CAMP関連企業の正確な情報（これらは内部データを優先）】
${axCampCompanies}

【特に注意】
- "AX CAMP"、"株式会社AX"は自社ブランドなので外部検証不要
- 上記のAX CAMP関連企業については、記載の業界情報が正確です（Web検索結果より優先）
- 特にグラシズは「リスティング広告運用企業」であり、コンサルティングや Web制作は行っていません

【出力形式】
{
  "score": 0-100の評価点,
  "confidence": 0-100の確信度,
  "issues": [
    {
      "type": "factual-error" | "brand-error",
      "severity": "critical" | "major" | "minor",
      "location": "【H2見出し名】セクション内の「具体的な文章を20-30文字程度引用」の部分",
      "description": "問題の説明",
      "original": "元の表記",
      "suggestion": "正しい表記",
      "confidence": 0-100
    }
  ],
  "suggestions": [
    {
      "type": "improvement",
      "description": "改善提案",
      "implementation": "具体的な実装方法",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

    try {
      // Web検索を有効にして最新情報を確認（AX CAMP関連企業以外）
      const response = await this.callGPT5(prompt, true);
      const gptResult = this.parseResponse(response);

      // 内部チェックの結果を統合
      const allIssues = [...axCampIssues, ...aiModelIssues, ...gptResult.issues];

      // AX CAMP関連企業やAIモデルの誤情報があった場合、スコアを減点
      const internalIssuesCount = axCampIssues.length + aiModelIssues.length;
      const score = internalIssuesCount > 0
        ? Math.max(0, gptResult.score - (internalIssuesCount * 10))
        : gptResult.score;

      return {
        score,
        issues: allIssues,
        suggestions: gptResult.suggestions,
        confidence: Math.max(gptResult.confidence, internalIssuesCount > 0 ? 95 : 50)
      };
    } catch (error) {
      console.error('固有名詞チェックエラー:', error);
      // エラー時でも内部チェックの結果は返す
      const allInternalIssues = [...axCampIssues, ...aiModelIssues];
      return {
        score: allInternalIssues.length > 0 ? 60 : 75,
        issues: allInternalIssues,
        suggestions: [],
        confidence: 50
      };
    }
  }
}