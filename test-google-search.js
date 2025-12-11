// Google Custom Search APIのテスト
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

console.log('🔍 Google Custom Search API Configuration Test\n');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('Search Engine ID:', SEARCH_ENGINE_ID || 'NOT SET');

if (!API_KEY || !SEARCH_ENGINE_ID) {
  console.error('\n❌ Missing configuration. Please check your .env file.');
  process.exit(1);
}

async function testGoogleSearch() {
  const query = 'SEO対策';
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=3`;
  
  console.log('\n📡 Testing search for:', query);
  console.log('URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('\n❌ API Error:', response.status);
      console.error('Error details:', JSON.stringify(data, null, 2));
      
      if (data.error?.message) {
        console.error('\n問題の可能性:');
        if (data.error.message.includes('API key not valid')) {
          console.error('- APIキーが無効です');
        }
        if (data.error.message.includes('cx')) {
          console.error('- 検索エンジンIDが無効です');
          console.error('- 正しい形式: 数字とコロン含む (例: 017576662512468239146:omuauf_lfve)');
        }
        if (data.error.message.includes('Custom Search API has not been used')) {
          console.error('- Custom Search APIが有効化されていません');
          console.error('- https://console.cloud.google.com でAPIを有効化してください');
        }
      }
      return;
    }
    
    console.log('\n✅ API Connection Successful!');
    console.log(`Found ${data.items?.length || 0} results\n`);
    
    if (data.items && data.items.length > 0) {
      console.log('Search Results:');
      data.items.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   URL: ${item.link}`);
        console.log(`   ${item.snippet}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.error('\n考えられる原因:');
    console.error('1. ネットワークエラー');
    console.error('2. APIキーまたは検索エンジンIDの形式が正しくない');
  }
}

testGoogleSearch();