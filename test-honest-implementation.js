import { generateCompetitorResearch } from './services/competitorResearchHybrid.js';

async function testHonestImplementation() {
  console.log('🧪 Testing honest implementation...\n');
  
  try {
    const result = await generateCompetitorResearch('SEO対策とは');
    
    console.log('✅ Research completed');
    console.log('Keyword:', result.keyword);
    console.log('Articles found:', result.validArticles.length);
    console.log('Common topics:', result.commonTopics);
    
    console.log('\nFirst article:');
    if (result.validArticles[0]) {
      const article = result.validArticles[0];
      console.log('- Title:', article.title);
      console.log('- Site:', article.url);
      console.log('- Summary:', article.summary);
      console.log('- Character count:', article.characterCount || 'Not available');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHonestImplementation();