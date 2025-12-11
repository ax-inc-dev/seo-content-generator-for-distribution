// JSONパース修正のテストスクリプト

// テスト用のJSONデータ（コメント付き）
const testJsonWithComments = `
{
  "keyword": "SEO対策",
  "analyzedAt": "2025-01-01T00:00:00Z",
  "totalArticlesScanned": 20,
  "excludedCount": 10,
  "commonTopics": ["キーワード選定", "コンテンツ最適化", "内部リンク"], // 共通トピック
  "recommendedWordCount": {
    "min": 3000,
    "max": 7000,
    "optimal": 5000
  },
  "validArticles": [
    {
      "rank": 1,
      "url": "https://example.com/seo-guide",
      "title": "SEO対策の基本ガイド",
      "summary": "SEO対策の基本的な考え方と実践方法を解説", // 記事の要約
      "characterCount": 5000,
      "isArticle": true,
      "headingStructure": {
        "h1": "SEO対策とは",
        "h2Items": [
          {
            "text": "基本概念",
            "h3Items": ["定義", "重要性"]
          }
        ]
      }
    }
  ]
}
`;

// JSONクリーニング関数
function cleanJsonString(str) {
  // コメントを除去（文字列内のものは除外）
  // まず、文字列を一時的に置換
  const stringTokens = [];
  let tokenIndex = 0;
  
  // 文字列を一時的にトークンに置換
  str = str.replace(/"([^"\\]|\\.)*"/g, (match) => {
    const token = `__STRING_${tokenIndex}__`;
    stringTokens[tokenIndex] = match;
    tokenIndex++;
    return token;
  });
  
  // コメントを除去
  str = str.replace(/\/\*[\s\S]*?\*\//g, ''); // /* ... */ 形式のコメント
  str = str.replace(/\/\/.*$/gm, ''); // // 形式のコメント
  
  // 文字列を元に戻す
  stringTokens.forEach((string, index) => {
    str = str.replace(`__STRING_${index}__`, string);
  });
  
  // 末尾のカンマを除去
  str = str.replace(/,(\s*[}\]])/g, '$1');
  
  return str.trim();
}

// テスト実行
console.log('🧪 Testing JSON cleaning function...\n');

console.log('1️⃣ Original JSON with comments:');
console.log(testJsonWithComments.substring(0, 200) + '...\n');

console.log('2️⃣ Cleaning JSON...');
const cleanedJson = cleanJsonString(testJsonWithComments);

console.log('3️⃣ Cleaned JSON preview:');
console.log(cleanedJson.substring(0, 200) + '...\n');

console.log('4️⃣ Attempting to parse cleaned JSON...');
try {
  const parsed = JSON.parse(cleanedJson);
  console.log('✅ JSON parsed successfully!');
  console.log('Parsed data preview:', {
    keyword: parsed.keyword,
    totalArticlesScanned: parsed.totalArticlesScanned,
    articlesCount: parsed.validArticles?.length
  });
} catch (error) {
  console.error('❌ JSON parse failed:', error.message);
  console.error('Failed JSON:', cleanedJson.substring(0, 500));
}

console.log('\n✨ Test complete!');