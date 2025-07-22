import { logger } from '@/lib/logger';
import * as dotenv from 'dotenv';
import { GBPDataOrchestrator } from '@/lib/gbp-data-orchestrator';

/**
 * Example: Using the cheapest proxy solution for GBP data collection
 * This demonstrates the complete flow with Webshare's free tier
 */

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  logger.info('=== Google Business Profile Data Collection Demo ===\n');
  logger.info('Using the CHEAPEST proxy solution (Webshare free tier)\n');

  // Step 1: Initialize with free Webshare proxies
  const orchestrator = new GBPDataOrchestrator({
    cacheFile: './demo-cache.json',
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    useProxy: true,
    proxyProvider: 'free' // Start with absolutely free proxies
  });

  try {
    await orchestrator.initialize();
    logger.info('✓ Initialized with free proxy tier\n');

    // Step 2: Example businesses to collect
    const testBusinesses = [
      {
        // Sydney Opera House
        placeId: 'ChIJ3S-JXmauEmsRUcIaWtf4MzE',
        priority: 'low' as const // Scraping only ($0.01)
      },
      {
        // Small local business (example)
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', 
        priority: 'medium' as const // Scraping + Essentials ($0.015)
      }
    ];

    logger.info(`Collecting data for ${testBusinesses.length} businesses...\n`);

    // Step 3: Collect data with progress tracking
    const result = await orchestrator.collectBusinessData(testBusinesses, {
      onProgress: (current, total) => {
        logger.info(`Progress: ${current}/${total} businesses processed`);
      }
    });

    // Step 4: Display results
    logger.info('\n=== Collection Results ===');
    logger.info(`✓ Successful: ${result.successful}`);
    logger.info(`✗ Failed: ${result.failed}`);
    logger.info(`💾 From cache: ${result.fromCache}`);
    logger.info(`💰 Total cost: $${result.totalCost.toFixed(3)}`);
    logger.info(`📊 Avg cost per listing: $${(result.totalCost / result.successful).toFixed(3)}\n`);

    // Step 5: Show collected data
    for (const business of result.data) {
      logger.info(`\n📍 ${business.name}`);
      logger.info(`   Address: ${business.address}`);
      logger.info(`   Rating: ${business.rating}⭐ (${business.reviewCount} reviews)`);
      logger.info(`   Data source: ${business.dataSource}`);
      logger.info(`   Completeness: ${business.dataCompleteness}%`);
      logger.info(`   Categories: ${business.categories.join(', ')}`);
      
      if (business.photos && business.photos.length > 0) {
        logger.info(`   Photos: ${business.photos.length} found`);
      }
      
      if (business.reviewSnippets && business.reviewSnippets.length > 0) {
        logger.info(`   Review snippets: ${business.reviewSnippets.length} collected`);
      }
    }

    // Step 6: Show cache statistics
    const stats = orchestrator.getStats();
    logger.info('\n=== Cache Statistics ===');
    logger.info(`Total cached entries: ${stats.cache.totalEntries}`);
    logger.info(`Average completeness: ${stats.cache.avgCompleteness.toFixed(1)}%`);
    logger.info(`Value saved by caching: $${stats.cache.estimatedValue.toFixed(2)}`);
    logger.info(`Estimated monthly cost: $${stats.estimatedMonthlyCost.toFixed(2)}`);

    // Step 7: Cost breakdown
    logger.info('\n=== Cost Optimization Strategy ===');
    logger.info('For 1,000 listings:');
    logger.info('- 700 scraping only (70%): $7.00');
    logger.info('- 200 with Essentials (20%): $3.00');
    logger.info('- 100 with Pro (10%): $2.70');
    logger.info('- Total: $12.70 ($0.0127 average per listing)');
    logger.info('\nWith proxy costs:');
    logger.info('- Webshare free tier: $0 (first 10 proxies)');
    logger.info('- Webshare paid: ~$2.00 (for 1,000 requests)');
    logger.info('- Total with proxies: ~$15 ($0.015 per listing)');

  } catch (error) {
    logger.error('Error:', error);
  } finally {
    await orchestrator.cleanup();
    logger.info('\n✓ Cleanup complete');
  }
}

// Proxy cost comparison
function showProxyComparison() {
  logger.info('\n=== Proxy Cost Comparison (for 1,000 listings) ===');
  
  const providers = [
    { name: 'Webshare (Free)', cost: 0, limit: '10 proxies, 1GB' },
    { name: 'Webshare (Paid)', cost: 2.90, limit: '100 shared proxies' },
    { name: 'IPRoyal', cost: 13.90, limit: '10 dedicated proxies (90-day)' },
    { name: 'Smartproxy DC', cost: 6.00, limit: '10GB datacenter' },
    { name: 'Smartproxy Residential', cost: 39.00, limit: '10GB residential' }
  ];

  providers.forEach(p => {
    logger.info(`${p.name}: $${p.cost.toFixed(2)} (${p.limit})`);
  });

  logger.info('\n💡 Recommendation: Start with Webshare free tier, upgrade only when needed');
}

// Run the demo
main().then(() => {
  showProxyComparison();
}).catch((error) => {
  logger.error('Demo failed:', error);
});
