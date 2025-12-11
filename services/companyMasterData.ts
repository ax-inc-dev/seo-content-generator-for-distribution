/**
 * 企業マスターデータ（汎用スタブ版）
 *
 * 既存のインポートとの互換性を維持するための空実装
 */

export interface CompanyInfo {
  fullName: string;
  displayName: string;
  industry: string;
  ceo?: string;
  results: {
    before: string;
    after: string;
    timeReduction?: string;
    improvement?: string;
    achievement?: string;
  };
  details: string;
  noteUrl: string;
}

// 空のマスターデータ
export const COMPANY_MASTER: Record<string, CompanyInfo> = {};

/**
 * 企業名から業界情報を取得（汎用スタブ）
 */
export function getCompanyIndustry(companyName: string): string | undefined {
  return undefined;
}

/**
 * 企業名から完全な情報を取得（汎用スタブ）
 */
export function getCompanyInfo(companyName: string): CompanyInfo | undefined {
  return undefined;
}

/**
 * すべての企業情報を取得（汎用スタブ）
 */
export function getAllCompanies(): CompanyInfo[] {
  return [];
}

/**
 * 実績データをマークダウン形式で取得（汎用スタブ）
 */
export function formatCompanyResultAsMarkdown(companyName: string): string | null {
  return null;
}
