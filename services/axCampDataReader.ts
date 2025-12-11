// データ読み取りサービス（汎用スタブ版）

/**
 * データを読み取る（スタブ実装）
 */
export async function readAxCampDataFromDrive(): Promise<any> {
  console.log('📚 データ読み取り（スタブ）');
  return getCachedData();
}

/**
 * キャッシュデータを取得（フォールバック用）
 */
function getCachedData() {
  return {
    segments: [],
    documents: [],
    keywords: {
      'AI研修': 50,
      'Claude': 30,
      'ChatGPT': 25,
      'プロンプト': 45,
      '法人': 20,
      '自動化': 35
    }
  };
}

/**
 * 特定ファイルを読み取る（スタブ実装）
 */
export async function readSpecificFile(fileName: string): Promise<any> {
  console.log(`📄 ファイル読み取り（スタブ）: ${fileName}`);
  return null;
}

/**
 * サービス情報を抽出（スタブ実装）
 */
export async function extractAxCampServiceInfo(): Promise<any> {
  return {
    company: '',
    service: '',
    mainTopics: ['AI研修', 'Claude', 'ChatGPT', 'プロンプト', '自動化'],
    caseStudies: [
      'A社: LP制作費削減',
      'B社: 原稿執筆時間短縮',
      'C社: 業務自動化',
    ],
    keywords: []
  };
}
