# Complete GBP Data Collection Setup Guide

## 🚀 Quick Start (Cheapest Option)

```bash
# 1. Install dependencies
npm install playwright puppeteer-extra puppeteer-extra-plugin-stealth

# 2. Set up environment variables (start with FREE tier)
echo "PROXY_PROVIDER=free" >> .env.local
echo "USE_PROXY=true" >> .env.local
echo "GOOGLE_PLACES_API_KEY=your_key_here" >> .env.local

# 3. Test your setup
npm run test:proxy-setup

# 4. Start collecting data!
npm run collect:business ChIJN1t_tDeuEmsRUsoyG83frY4
```

## 💰 Proxy Provider Comparison (2025 Pricing)

### Free Options (For Testing Only)
| Provider | Reliability | Speed | Best For |
|----------|------------|-------|----------|
| ProxyScrape | ~30% | Slow | Quick tests |
| Spys.one | ~25% | Very slow | Emergency fallback |
| FreeProxy.world | ~35% | Variable | Small batches |

⚠️ **Warning**: Free proxies are frequently banned by Google and have very low success rates.

### Cheapest Paid Options

#### 1. **Geonode** 🏆 NEW - Absolute Cheapest
- **Price**: $0.03/IP/month (minimum 100 IPs = $3)
- **Reliability**: 85%
- **Setup**:
  ```bash
  PROXY_PROVIDER=geonode
  GEONODE_USERNAME=your_username
  GEONODE_PASSWORD=your_password
  ```
- **Best for**: Medium-scale operations (100-5,000 listings)

#### 2. **Webshare** - Best Free Tier
- **Price**: FREE (10 proxies) then $0.05/IP
- **Reliability**: 92%
- **Setup**:
  ```bash
  # Free tier (no API key needed)
  PROXY_PROVIDER=webshare
  
  # Paid tier
  WEBSHARE_API_KEY=your_api_key
  ```
- **Best for**: Starting out, testing, small businesses

#### 3. **Proxy-Cheap** - Good Middle Ground
- **Price**: $0.06-$0.10/IP (volume discounts)
- **Reliability**: 88%
- **Features**: SOCKS5 support, stable IPs
- **Best for**: Consistent medium-scale scraping

#### 4. **IPRoyal** - Premium Budget Option
- **Price**: $1.39/IP (90-day) or $1.75/IP (30-day)
- **Type**: Dedicated IPs (not shared)
- **Best for**: Long-term projects needing stability

## 📊 Cost Breakdown for Real-World Scenarios

### Scenario 1: Small Business (100 listings)
```
Strategy: Webshare Free Tier + Scraping Only
- Proxy cost: $0 (free tier)
- Scraping: 100 × $0.01 = $1.00
- Total: $1.00 ($0.01 per listing)
```

### Scenario 2: Agency (1,000 listings)
```
Strategy: Geonode + Mixed Approach
- Proxy cost: $3.00 (100 IPs minimum)
- Scraping: 700 × $0.01 = $7.00
- Essentials: 200 × $0.005 = $1.00
- Pro: 100 × $0.017 = $1.70
- Total: $12.70 ($0.0127 per listing)
```

### Scenario 3: Enterprise (10,000 listings)
```
Strategy: Webshare Paid + Optimized Collection
- Proxy cost: ~$20 (400 IPs)
- Scraping: 7,000 × $0.01 = $70
- Essentials: 2,000 × $0.005 = $10
- Pro: 1,000 × $0.017 = $17
- Total: $117 ($0.0117 per listing)
```

## 🛠️ Implementation Steps

### Step 1: Choose Your Proxy Strategy

```javascript
// For <100 listings: Use free tier
const config = {
  provider: 'webshare', // Uses free 10 proxies
  useProxy: true
};

// For 100-1,000 listings: Use Geonode
const config = {
  provider: 'geonode',
  credentials: {
    username: process.env.GEONODE_USERNAME,
    password: process.env.GEONODE_PASSWORD
  }
};

// For 1,000+ listings: Use Webshare paid
const config = {
  provider: 'webshare',
  credentials: {
    username: 'api',
    password: process.env.WEBSHARE_API_KEY
  }
};
```

### Step 2: Set Up Your Environment

Create `.env.local`:
```bash
# Google APIs
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_PLACES_API_KEY=your_places_api_key

# Proxy Configuration (start with free)
PROXY_PROVIDER=webshare
USE_PROXY=true

# Optional: Paid proxy credentials
# WEBSHARE_API_KEY=your_key
# GEONODE_USERNAME=your_username
# GEONODE_PASSWORD=your_password

# Collection Settings
MAX_CONCURRENCY=3
CACHE_FILE=./gbp-cache.json
```

### Step 3: Test Your Setup

```bash
# Run the test script
npm run test:proxy-setup

# Expected output:
# ✓ Found free proxy: 103.149.162.195:80
# ✓ Direct access works
# ✓ Estimated cost: $0.01 per listing
```

### Step 4: Start Collecting Data

```javascript
import { GBPDataOrchestrator } from './services/data-orchestrator';

const orchestrator = new GBPDataOrchestrator({
  useProxy: true,
  proxyProvider: 'webshare' // Start with free tier
});

await orchestrator.initialize();

const result = await orchestrator.collectBusinessData([
  { placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', priority: 'low' }
]);

console.log(`Cost: $${result.totalCost}`); // ~$0.01
```

## 🎯 Optimization Tips

### 1. Cache Everything
- Cache reduces costs by 80%+
- Set refresh schedules: Weekly for top listings, monthly for others
- Store cache in persistent storage (Redis/PostgreSQL)

### 2. Prioritize by Value
```javascript
// Only use expensive APIs for high-value listings
const priority = listing.reviewCount > 100 ? 'high' :
                listing.reviewCount > 50 ? 'medium' : 
                'low';
```

### 3. Batch Processing
```javascript
// Process in batches to manage costs
const BATCH_SIZE = 100;
for (let i = 0; i < listings.length; i += BATCH_SIZE) {
  const batch = listings.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
  
  // Monitor costs
  if (totalCost > monthlyBudget * 0.8) {
    console.warn('Approaching budget limit!');
  }
}
```

### 4. Proxy Rotation Strategy
```javascript
// Implement smart rotation with cooldowns
const rotation = ProxyOptimizer.createRotationStrategy(proxies);
const proxy = rotation.getNext();

// If proxy fails, mark it and get another
if (failed) {
  rotation.markFailed(proxy);
  proxy = rotation.getNext();
}
```

## 📈 Scaling Guide

### 0-100 Listings/month
- **Proxy**: Webshare free tier
- **Strategy**: Scraping only
- **Cost**: ~$1
- **Time**: 5-10 minutes

### 100-1,000 Listings/month
- **Proxy**: Geonode ($3/month)
- **Strategy**: Scraping + selective Essentials
- **Cost**: ~$15
- **Time**: 1-2 hours

### 1,000-10,000 Listings/month
- **Proxy**: Webshare paid ($20-50)
- **Strategy**: Full stack with caching
- **Cost**: ~$100-150
- **Time**: 8-12 hours

### 10,000+ Listings/month
- **Proxy**: Custom solution or enterprise deal
- **Strategy**: Distributed collection with queue
- **Cost**: Negotiate bulk rates
- **Time**: Continuous processing

## 🚨 Common Issues & Solutions

### "All proxies failed"
```javascript
// Solution 1: Implement exponential backoff
await wait(Math.pow(2, retryCount) * 1000);

// Solution 2: Switch to residential proxies temporarily
if (datacenterFails > 5) {
  switchToResidential();
}
```

### "Rate limit exceeded"
```javascript
// Add delays between requests
const delay = priority === 'high' ? 500 : 2000;
await new Promise(resolve => setTimeout(resolve, delay));
```

### "Low data completeness"
```javascript
// Escalate to higher-tier APIs
if (completeness < 70 && isHighValue) {
  useEssentials = true;
}
if (completeness < 80 && reviewCount > 100) {
  usePro = true;
}
```

## 🔍 Monitoring & Analytics

### Track Your Costs
```javascript
// Log every collection
await prisma.dataCollection.create({
  data: {
    placeId,
    source: result.dataSource,
    cost: result.cost,
    completeness: result.dataCompleteness,
    timestamp: new Date()
  }
});

// Generate monthly report
const monthlyStats = await prisma.dataCollection.aggregate({
  where: { 
    timestamp: { gte: startOfMonth }
  },
  _sum: { cost: true },
  _avg: { completeness: true }
});
```

### Set Up Alerts
```javascript
// Budget alerts
if (monthlySpend > budget * 0.8) {
  sendAlert('Approaching 80% of monthly budget');
}

// Quality alerts
if (avgCompleteness < 70) {
  sendAlert('Data quality below threshold');
}
```

## 🎉 Next Steps

1. **Start Free**: Begin with Webshare's free tier
2. **Test Small**: Collect 10 businesses to verify setup
3. **Monitor Costs**: Track spending carefully
4. **Scale Gradually**: Upgrade proxies as needed
5. **Optimize Continuously**: Refine your strategy based on results

## 📞 Support Resources

- **Webshare**: https://proxy.webshare.io/docs
- **Geonode**: https://geonode.com/docs
- **Google Places API**: https://developers.google.com/maps/documentation/places
- **Community**: Join our Discord for tips and troubleshooting

Remember: Start small, test thoroughly, and scale based on actual needs. The cheapest solution that works is the best solution! 🚀
