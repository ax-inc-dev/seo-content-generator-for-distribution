import { generateCompetitorResearch } from './services/competitorResearchWithWebFetch.js';

async function test15Sites() {
  console.log('🧪 Testing 15-site analysis with progress tracking...\n');
  
  const startTime = Date.now();
  
  try {
    const result = await generateCompetitorResearch('SEO対策', (current, total) => {
      console.log(`📊 Progress: ${current}/${total} sites analyzed`);
    });
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n✅ Analysis completed!');
    console.log(`⏱️ Total time: ${duration} seconds`);
    console.log(`📝 Keyword: ${result.keyword}`);
    console.log(`📄 Articles analyzed: ${result.validArticles.length}`);
    
    // Count successful fetches
    const successCount = result.validArticles.filter(a => a.characterCount > 0).length;
    console.log(`✅ Successful fetches: ${successCount}/${result.validArticles.length}`);
    console.log(`📊 Success rate: ${Math.round(successCount / result.validArticles.length * 100)}%`);
    
    // Show character counts for successful fetches
    console.log('\n📊 Character counts for successful fetches:');
    result.validArticles.forEach((article, index) => {
      if (article.characterCount > 0) {
        console.log(`  ${index + 1}位: ${article.characterCount.toLocaleString()} 文字`);
      }
    });
    
    console.log(`\n💡 Recommended character count: ${result.recommendedWordCount.optimal.toLocaleString()} 文字`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test15Sites();