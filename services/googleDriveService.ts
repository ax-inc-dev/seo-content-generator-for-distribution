// Google Driveからデータを取得するサービス
// 現在は静的JSONファイルを使用しているが、将来的にはAPIで動的取得可能

import axCampData from '../data/ax-camp-service-info.json';

export interface DriveCompanyData {
  company: string;
  industry: string;
  result: string;
  detail: string;
  additionalInfo?: {
    challenges?: string[];
    solutions?: string[];
    keywords?: string[];
  };
}

/**
 * Google Driveから企業の詳細情報を取得
 * 注：現在は静的ファイルから取得しているが、
 * 将来的にはGoogle Drive APIを使用して動的に取得する
 */
export async function fetchCompanyDetailsFromDrive(): Promise<DriveCompanyData[]> {
  try {
    // 将来的にここでGoogle Drive APIを呼び出す
    // const driveData = await callGoogleDriveAPI();
    
    // 現在は静的ファイルから取得
    const companies = axCampData.case_studies.map(study => ({
      company: study.company,
      industry: study.industry || '企業',
      result: study.result,
      detail: study.detail,
      additionalInfo: {
        challenges: [],
        solutions: [],
        keywords: []
      }
    }));

    // 追加の詳細情報を付加
    companies.forEach(company => {
      if (company.company === 'グラシズ社') {
        company.additionalInfo = {
          challenges: ['LPライティングの外注コストが高い', '制作期間が長い'],
          solutions: ['AI活用による内製化', 'ChatGPT/Claudeを使った制作フロー構築'],
          keywords: ['LP制作', 'リスティング広告', 'ライティング', '外注削減']
        };
      } else if (company.company === 'Route66社') {
        company.additionalInfo = {
          challenges: ['原稿執筆に24時間かかっていた', 'マーケティングコンテンツの制作が遅い'],
          solutions: ['生成AIの活用', 'プロンプトエンジニアリング導入'],
          keywords: ['原稿執筆', 'コンテンツ制作', 'マーケティング']
        };
      } else if (company.company === 'WISDOM社') {
        company.additionalInfo = {
          challenges: ['役者・カメラマンの日程調整に膨大なリソース', '採用予定2名分の業務負荷'],
          solutions: ['AI自動化システムの構築', 'Google Apps Scriptによる業務効率化'],
          keywords: ['SNS広告', 'ショート動画', '日程調整', '業務自動化']
        };
      } else if (company.company === 'C社') {
        company.additionalInfo = {
          challenges: ['月間1,000万impの運用負荷', 'メディア運営の工数が膨大'],
          solutions: ['AI活用文化の構築', '運用自動化システムの導入'],
          keywords: ['メディア運営', 'imp', '広告運用', '自動化']
        };
      }
    });

    return companies;
  } catch (error) {
    console.error('Google Driveデータの取得エラー:', error);
    // エラー時は基本データを返す
    return axCampData.case_studies as DriveCompanyData[];
  }
}

/**
 * キーワードに基づいて関連する企業事例を取得
 */
export async function getRelevantCaseStudies(keyword: string): Promise<DriveCompanyData[]> {
  const allCompanies = await fetchCompanyDetailsFromDrive();
  
  // キーワードに関連する企業を優先順位付け
  const relevantCompanies = allCompanies.filter(company => {
    const allText = `${company.industry} ${company.result} ${company.detail} ${company.additionalInfo?.keywords?.join(' ') || ''}`.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // キーワードとの関連性をチェック
    return allText.includes(keywordLower) || 
           keywordLower.includes('ai') || 
           keywordLower.includes('研修') ||
           keywordLower.includes('自動化');
  });

  // 関連企業がない場合は全企業を返す
  return relevantCompanies.length > 0 ? relevantCompanies : allCompanies;
}

/**
 * 構成生成用のコンテキストを生成（Drive データを活用）
 */
export async function generateEnhancedAxCampContext(keyword: string): Promise<string> {
  const companies = await getRelevantCaseStudies(keyword);
  
  let context = `
【AX CAMP サービス情報】
サービス名: AX CAMP
提供: 株式会社AX
主要サービス: 法人向けAI研修サービス

【導入実績（詳細）】
`;

  companies.slice(0, 3).forEach(company => {
    context += `
◆ ${company.company}（${company.industry}）
  成果: ${company.result}
  詳細: ${company.detail}`;
    
    if (company.additionalInfo?.challenges && company.additionalInfo.challenges.length > 0) {
      context += `
  課題: ${company.additionalInfo.challenges[0]}`;
    }
    if (company.additionalInfo?.solutions && company.additionalInfo.solutions.length > 0) {
      context += `
  解決策: ${company.additionalInfo.solutions[0]}`;
    }
  });

  return context;
}