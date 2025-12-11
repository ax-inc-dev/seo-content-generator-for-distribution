/**
 * AX CAMP クライアント企業マスターデータ
 *
 * このファイルが唯一の真実の源（Single Source of Truth）です。
 * すべての企業情報はここから参照してください。
 *
 * データ元: /data/ax-camp-service-info.json
 * Note記事: https://note.com/onte/ 配下の各記事
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

export const COMPANY_MASTER: Record<string, CompanyInfo> = {
  'グラシズ': {
    fullName: '株式会社グラシズ',
    displayName: 'グラシズ社',
    industry: 'リスティング広告運用企業',
    ceo: '土谷武史',
    results: {
      before: 'LPライティング外注費10万円/月',
      after: 'LP制作費0円',
      timeReduction: '制作時間3営業日→2時間',
      improvement: 'LP制作の内製化を実現、制作時間93%削減'
    },
    details: 'AIへの教育に注力し、内製化を実現',
    noteUrl: 'https://note.com/onte/n/n5e82ea313e40'
  },
  'Route66': {
    fullName: 'Route66株式会社',
    displayName: 'Route66社',
    industry: 'マーケティング支援企業',
    ceo: '細川大',
    results: {
      before: '原稿執筆24時間',
      after: '10秒で完了',
      improvement: '99.99%削減（14,400倍の高速化）'
    },
    details: 'マーケ現場の生成AI内製化を実現',
    noteUrl: 'https://note.com/onte/n/nccf1988c6058'
  },
  'WISDOM': {
    fullName: 'WISDOM合同会社',
    displayName: 'WISDOM社',
    industry: 'SNS広告・ショート動画制作企業',
    ceo: '安藤宏将',
    results: {
      before: '採用予定2名分の業務負荷',
      after: 'AIが完全代替',
      timeReduction: '毎日2時間の調整業務を自動化'
    },
    details: '毎日2時間の調整業務を自動化',
    noteUrl: 'https://note.com/onte/n/na6a8522a7b0c'
  },
  'C社': {
    fullName: 'C社',
    displayName: 'C社',
    industry: 'SNSマーケティング・広告代理事業',
    results: {
      before: '1日3時間の運用作業',
      after: '1時間に短縮',
      improvement: '66%削減',
      achievement: 'テキスト系SNSの月間1,000万インプレッション'
    },
    details: 'AI活用が当たり前の文化を構築、非エンジニアチームでSNS完全自動化システムを内製化',
    noteUrl: 'https://note.com/onte/n/n04fb767b7023'
  },
  'Foxx': {
    fullName: '株式会社Foxx',
    displayName: 'Foxx社',
    industry: '広告運用業務',
    ceo: '杉永竜之助',
    results: {
      before: '運用業務月75時間',
      after: 'AI活用による新規事業創出',
      achievement: '運用業務月75時間の中で、AI活用により新規事業創出'
    },
    details: '運用業務月75時間の中で、AI活用により新規事業創出を実現',
    noteUrl: 'https://note.com/onte/n/n705671a6ad8c'
  },
  'Inmark': {
    fullName: '株式会社Inmark',
    displayName: 'Inmark社',
    industry: 'Web広告運用代行（美容医療・健康食品系に強み）',
    ceo: '渡邊莉久',
    results: {
      before: '毎日1時間以上の広告チェック業務',
      after: '2週間でゼロに',
      timeReduction: 'チェック業務100%自動化',
      achievement: 'Google広告の数値を15分に1回自動通知するBot開発'
    },
    details: 'AI開発未経験から2週間で実装、成長の好循環を実現',
    noteUrl: 'https://note.com/onte/n/nfdf77bb84294'
  },
  'エムスタイルジャパン': {
    fullName: 'エムスタイルジャパン株式会社',
    displayName: 'エムスタイルジャパン社',
    industry: '美容健康食品・化粧品製造販売',
    ceo: '稲冨',
    results: {
      before: 'コールセンター確認業務月16時間、手作業の広告レポート作成',
      after: '月100時間以上の業務削減達成',
      timeReduction: 'コールセンター業務月16時間→ほぼ0時間',
      improvement: '非エンジニアがGASで自動化を実現、AIは当たり前文化を醸成',
      achievement: '通話履歴確認の自動化で月16時間削減、全社で月100時間以上の業務削減'
    },
    details: 'ツバメの巣を原料とした美容健康食品のD2C企業。GASを活用した業務自動化で月100時間以上削減',
    noteUrl: 'https://note.com/onte/n/nda9a9b34ec36'
  }
};

/**
 * 企業名から正式な業界情報を取得
 */
export function getCompanyIndustry(companyName: string): string | undefined {
  // 様々な表記に対応
  const normalizedName = companyName
    .replace(/株式会社|社|様|さん/g, '')
    .trim();

  for (const [key, info] of Object.entries(COMPANY_MASTER)) {
    if (key === normalizedName ||
        info.fullName.includes(normalizedName) ||
        info.displayName.includes(normalizedName)) {
      return info.industry;
    }
  }

  return undefined;
}

/**
 * 企業名から完全な情報を取得
 */
export function getCompanyInfo(companyName: string): CompanyInfo | undefined {
  const normalizedName = companyName
    .replace(/株式会社|社|様|さん/g, '')
    .trim();

  for (const [key, info] of Object.entries(COMPANY_MASTER)) {
    if (key === normalizedName ||
        info.fullName.includes(normalizedName) ||
        info.displayName.includes(normalizedName)) {
      return info;
    }
  }

  return undefined;
}

/**
 * すべての企業情報を取得
 */
export function getAllCompanies(): CompanyInfo[] {
  return Object.values(COMPANY_MASTER);
}

/**
 * 実績データをマークダウン形式で取得
 */
export function formatCompanyResultAsMarkdown(companyName: string): string | null {
  const info = getCompanyInfo(companyName);
  if (!info) return null;

  let markdown = `### ${info.displayName}様の事例\n\n`;
  markdown += `**業界**: ${info.industry}\n\n`;
  if (info.ceo) {
    markdown += `**代表**: ${info.ceo}様\n\n`;
  }
  markdown += `**成果**: <b>${info.results.before}→${info.results.after}</b>\n`;
  if (info.results.improvement) {
    markdown += `（${info.results.improvement}）\n`;
  }
  if (info.results.achievement) {
    markdown += `**実績**: ${info.results.achievement}\n`;
  }
  markdown += `\n**詳細**: ${info.details}\n`;
  markdown += `\n*参考: [${info.displayName}様の事例詳細](${info.noteUrl})*`;

  return markdown;
}