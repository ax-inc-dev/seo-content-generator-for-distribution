// AX CAMPサービス情報を提供するサービス（汎用スタブ版）
// 既存のインポートとの互換性を維持するための空実装

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
 * サービス情報を取得（汎用スタブ）
 */
export function getAxCampInfo(): AxCampInfo {
  return {
    company: {
      name: '',
      service_name: '',
      ceo: '',
      website: '',
    },
    services: {
      main_service: '',
      description: '',
      target: '',
      categories: [],
    },
    features: [],
    case_studies: [],
    training_materials: [],
    keywords: [],
    unique_selling_points: [],
  };
}

/**
 * 事例を取得（汎用スタブ）
 */
export function getAxCampCaseStudies() {
  return [];
}

/**
 * サービスカテゴリを取得（汎用スタブ）
 */
export function getAxCampServiceCategories() {
  return [];
}

/**
 * コンテキストを生成（汎用スタブ）
 */
export function generateAxCampContext(keyword: string): string {
  return '';
}

/**
 * CTA用のテキストを生成（汎用スタブ）
 */
export function generateAxCampCTA(): string {
  return '';
}

/**
 * メタディスクリプション用の訴求文を生成（汎用スタブ）
 */
export function generateAxCampMetaDescription(): string {
  return '';
}

// 後方互換性のための再エクスポート
export { COMPANY_MASTER, getAllCompanies, formatCompanyResultAsMarkdown, type CompanyInfo };
