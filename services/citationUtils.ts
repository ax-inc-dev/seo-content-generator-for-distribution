/**
 * 出典リンク生成ユーティリティ
 *
 * URL優先順位:
 * - note.com/onte > media.a-x.inc
 * - note URL は必ず aタグで埋め込み（ベタ貼り禁止）
 * - media URL は出典として使う場合はaタグ、内部リンクとしてのベタ貼りは別途保護
 */

/**
 * 出典リンクをHTML形式で生成
 *
 * @param url - 出典URL
 * @param title - 出典タイトル
 * @returns HTML形式の出典リンク
 *
 * @example
 * ```ts
 * buildCitationLink('https://note.com/onte/n/abc123', '事例インタビュー')
 * // => '（出典：<a href="https://note.com/onte/n/abc123" target="_blank" rel="noopener noreferrer">事例インタビュー</a>）'
 * ```
 */
export function buildCitationLink(url: string, title: string): string {
  // note URL は aタグ形式（ベタ貼り禁止）
  if (url.includes("note.com/onte")) {
    return `（出典：<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>）`;
  }

  // media URL もaタグ形式（出典として使う場合）
  if (url.includes("media.a-x.inc")) {
    return `（出典：<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>）`;
  }

  // その他の外部URL
  return `（出典：<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>）`;
}

/**
 * URL優先順位に従って最適なURLを選択
 *
 * @param urls - URL配列
 * @returns 優先順位に従って選択されたURL
 *
 * @example
 * ```ts
 * selectPrioritizedUrl([
 *   'https://media.a-x.inc/article1',
 *   'https://note.com/onte/n/abc123'
 * ])
 * // => 'https://note.com/onte/n/abc123'
 * ```
 */
export function selectPrioritizedUrl(urls: string[]): string {
  if (!urls || urls.length === 0) {
    return "";
  }

  // note.com/onte を最優先
  const noteUrl = urls.find((url) => url.includes("note.com/onte"));
  if (noteUrl) return noteUrl;

  // フォールバック: media.a-x.inc
  const mediaUrl = urls.find((url) => url.includes("media.a-x.inc"));
  if (mediaUrl) return mediaUrl;

  // それ以外は最初のURL
  return urls[0];
}

/**
 * URLの種類を判定
 *
 * @param url - 判定対象URL
 * @returns URLの種類
 */
export function getUrlType(url: string): "note" | "media" | "external" {
  if (url.includes("note.com/onte")) {
    return "note";
  }
  if (url.includes("media.a-x.inc")) {
    return "media";
  }
  return "external";
}

/**
 * 複数の出典候補から最適な出典を生成
 *
 * @param citations - 出典候補配列 { url: string, title: string }[]
 * @returns HTML形式の出典リンク
 */
export function buildOptimalCitation(
  citations: Array<{ url: string; title: string }>
): string {
  if (!citations || citations.length === 0) {
    return "";
  }

  // URL優先順位に従って選択
  const urls = citations.map((c) => c.url);
  const selectedUrl = selectPrioritizedUrl(urls);

  // 選択されたURLに対応するタイトルを取得
  const selectedCitation = citations.find((c) => c.url === selectedUrl);
  if (!selectedCitation) {
    return "";
  }

  // DIAGNOSTIC_MODE: 選択ログ
  if (process.env.DIAGNOSTIC_MODE) {
    console.log(`[citationUtils] 出典選択:`, {
      candidates: citations.length,
      selected: selectedUrl,
      type: getUrlType(selectedUrl),
      title: selectedCitation.title,
    });
  }

  return buildCitationLink(selectedUrl, selectedCitation.title);
}
