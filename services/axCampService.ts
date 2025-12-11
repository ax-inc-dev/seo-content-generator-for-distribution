// AX CAMPサービス情報を提供するサービス

import axCampData from '../data/ax-camp-service-info.json';
import { COMPANY_MASTER, getAllCompanies, formatCompanyResultAsMarkdown, type CompanyInfo } from './companyMasterData';

export interface AxCampInfo {
  company: {
    name: string;
    service_name: string;
    ceo: string;
    website: string;
  };
  services: {
    main_service: string;
    description: string;
    target: string;
    categories: Array<{
      name: string;
      contents: string[];
    }>;
  };
  features: string[];
  case_studies: Array<{
    company: string;
    industry?: string;
    result: string;
    detail: string;
    note_url?: string;
  }>;
  training_materials: Array<{
    title: string;
    type: string;
    duration?: string;
    version?: string;
  }>;
  keywords: string[];
  unique_selling_points: string[];
}

/**
 * AX CAMPの情報を取得
 */
export function getAxCampInfo(): AxCampInfo {
  return axCampData as AxCampInfo;
}

/**
 * AX CAMPの事例を取得
 */
export function getAxCampCaseStudies() {
  return axCampData.case_studies;
}

/**
 * AX CAMPのサービスカテゴリを取得
 */
export function getAxCampServiceCategories() {
  return axCampData.services.categories;
}

/**
 * 構成案にAX CAMPの情報を含めるためのコンテキストを生成
 */
export function generateAxCampContext(keyword: string): string {
  const info = getAxCampInfo();
  
  // キーワードに関連する情報を抽出
  const isAiTraining = keyword.includes('AI') || keyword.includes('研修');
  const isChatGpt = keyword.toLowerCase().includes('chatgpt');
  const isClaude = keyword.toLowerCase().includes('claude');
  
  let context = `
【自社サービス情報】
会社名: ${info.company.name}
サービス名: ${info.company.service_name}
主要サービス: ${info.services.main_service}

【提供可能な研修内容】
`;

  // キーワードに応じて関連するカテゴリを優先表示
  info.services.categories.forEach(category => {
    if (isAiTraining || 
        (isChatGpt && category.contents.some(c => c.includes('ChatGPT'))) ||
        (isClaude && category.contents.some(c => c.includes('Claude')))) {
      context += `\n${category.name}:\n`;
      category.contents.forEach(content => {
        context += `  - ${content}\n`;
      });
    }
  });

  context += `
【導入実績】
`;

  // companyMasterDataから企業実績を取得
  const companies = getAllCompanies();
  const selectedCaseStudies = selectRelevantCompaniesFromMaster(companies, keyword);
  selectedCaseStudies.forEach(company => {
    context += `- ${company.fullName}（${company.industry}）: ${company.results.before}→${company.results.after}`;
    if (company.results.improvement) {
      context += `（${company.results.improvement}）`;
    }
    if (company.noteUrl) {
      context += ` [詳細: ${company.noteUrl}]`;
    }
    context += '\n';
  });

  // AX社自身の実績を追加
  if (axCampData.achievements) {
    context += `
【AX社自身の実績】
- ${axCampData.achievements.instructor || '自社業務時間を83%削減した実績'}
- ${axCampData.achievements.consulting || '30社以上のAI顧問実績'}
- ${axCampData.achievements.speed || '約2週間で投資回収可能'}
`;
  }

  context += `
【サービスの特徴】
`;

  info.features.slice(0, 3).forEach(feature => {
    context += `- ${feature}\n`;
  });

  return context;
}

/**
 * キーワードに基づいて関連性の高い企業事例を選択（companyMasterDataから）
 */
function selectRelevantCompaniesFromMaster(companies: CompanyInfo[], keyword: string): CompanyInfo[] {
  const keywordLower = keyword.toLowerCase();

  // スコアリングによる関連性評価
  const scoredCompanies = companies.map(company => {
    let score = 0;

    // 業界関連性
    if (company.industry) {
      if (keywordLower.includes('広告') && company.industry.includes('広告')) score += 3;
      if (keywordLower.includes('マーケ') && company.industry.includes('マーケ')) score += 3;
      if (keywordLower.includes('メディア') && company.industry.includes('メディア')) score += 3;
      if (keywordLower.includes('sns') && company.industry.includes('SNS')) score += 3;
      if (keywordLower.includes('web') && company.industry.includes('Web')) score += 3;
    }

    // 成果関連性
    const resultsText = `${company.results.before} ${company.results.after} ${company.results.improvement || ''} ${company.details}`;
    if (keywordLower.includes('効率') && resultsText.includes('時間')) score += 2;
    if (keywordLower.includes('自動') && resultsText.includes('自動')) score += 2;
    if (keywordLower.includes('削減') && resultsText.includes('削減')) score += 2;
    if (keywordLower.includes('内製') && company.details.includes('内製')) score += 2;

    // AI関連キーワード
    if ((keywordLower.includes('ai') || keywordLower.includes('生成')) &&
        company.details.includes('AI')) score += 1;

    // 数値成果がある場合は基本スコアを付与
    if (company.results.improvement && company.results.improvement.match(/\d+/)) score += 1;

    return { ...company, score };
  });

  // スコアでソートし、上位3件を選択
  // 同スコアの場合は元の順序を保持
  scoredCompanies.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return companies.indexOf(a) - companies.indexOf(b);
  });

  // スコアプロパティを除去して返す
  return scoredCompanies.slice(0, 3).map(({ score, ...company }) => company);
}

/**
 * 記事の最後に挿入するCTA用のテキストを生成
 */
export function generateAxCampCTA(): string {
  const info = getAxCampInfo();
  
  return `
<h2>${info.company.service_name}のご案内</h2>
<p>${info.services.description}</p>
<p><strong>導入実績：</strong></p>
<ul>
${info.case_studies.slice(0, 2).map(study => 
  `<li>${study.company}様: ${study.result}</li>`
).join('\n')}
</ul>
<p>詳しくは<a href="${info.company.website}" target="_blank" rel="noopener">${info.company.service_name}公式サイト</a>をご覧ください。</p>
`;
}

/**
 * メタディスクリプション用のサービス訴求文を生成
 */
export function generateAxCampMetaDescription(): string {
  const info = getAxCampInfo();
  const topCase = info.case_studies[0];
  
  return `${info.company.service_name}は${info.services.main_service}です。${topCase.company}様では${topCase.result}を実現。実践的な研修で御社のDXを推進します。`;
}