# 🔌 API Integration Guide

This guide shows you how to connect real APIs for liquidation data, funding rates, and multi-exchange aggregation.

---

## 📊 Currently Mocked APIs

These are currently simulated and need real API connections:

1. **Liquidation Data** - `fetchLiquidationData()` in `lib/websocket.js`
2. **Funding Rates** - `fetchFundingRate()` in `lib/websocket.js`
3. **Aggregator Data** - `fetchAggregatorData()` in `lib/websocket.js`
4. **Chart Data** - `fetchChartData()` in `components/TradingChart.js`

---

## 1. 🔥 Liquidation Data Integration

### Recommended Services

**Option A: Coinglass API** (Recommended)
```javascript
// Free tier available
// https://coinglass.com/api

async function fetchLiquidationData(ticker) {
  const response = await fetch(
    `https://open-api.coinglass.com/public/v2/liquidation_chart?symbol=${ticker}USDT&time_type=24h`,
    {
      headers: {
        'coinglassSecret': process.env.COINGLASS_API_KEY
      }
    }
  );
  
  const data = await response.json();
  
  return {
    longLiquidations: data.data.longLiquidationUsd || 0,
    shortLiquidations: data.data.shortLiquidationUsd || 0,
    totalLiquidated: data.data.totalLiquidationUsd || 0,
    liquidationClusters: data.data.list || [],
    nearbyLiquidations: {
      above: data.data.upLiquidations || [],
      below: data.data.downLiquidations || [],
    },
  };
}
```

**Option B: Glassnode API**
```javascript
// Requires paid subscription
// https://glassnode.com/

async function fetchLiquidationData(ticker) {
  const response = await fetch(
    `https://api.glassnode.com/v1/metrics/derivatives/futures_liquidated_volume_long_sum?a=${ticker}&api_key=${process.env.GLASSNODE_API_KEY}`
  );
  
  const longLiquidations = await response.json();
  
  // Fetch shorts separately
  const response2 = await fetch(
    `https://api.glassnode.com/v1/metrics/derivatives/futures_liquidated_volume_short_sum?a=${ticker}&api_key=${process.env.GLASSNODE_API_KEY}`
  );
  
  const shortLiquidations = await response2.json();
  
  return {
    longLiquidations: longLiquidations.v,
    shortLiquidations: shortLiquidations.v,
    totalLiquidated: longLiquidations.v + shortLiquidations.v,
  };
}
```

---

## 2. 💰 Funding Rates Integration

### Binance Futures API (Free)

```javascript
async function fetchFundingRate(ticker) {
  const response = await fetch(
    `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${ticker}USDT&limit=1`
  );
  
  const data = await response.json();
  
  if (data.length > 0) {
    return parseFloat(data[0].fundingRate);
  }
  
  return 0;
}
```

### Bybit API

```javascript
async function fetchFundingRateBybit(ticker) {
  const response = await fetch(
    `https://api.bybit.com/v5/market/funding/history?symbol=${ticker}USDT&limit=1`
  );
  
  const data = await response.json();
  
  if (data.result && data.result.list.length > 0) {
    return parseFloat(data.result.list[0].fundingRate);
  }
  
  return 0;
}
```

### Aggregated Funding (Multiple Exchanges)

```javascript
async function fetchFundingRate(ticker) {
  const [binance, bybit, okx] = await Promise.all([
    fetchBinanceFunding(ticker),
    fetchBybitFunding(ticker),
    fetchOKXFunding(ticker),
  ]);
  
  // Average funding across exchanges
  const rates = [binance, bybit, okx].filter(r => r !== null);
  const avgFunding = rates.reduce((a, b) => a + b, 0) / rates.length;
  
  return avgFunding;
}
```

---

## 3. 🔄 Multi-Exchange Aggregation

### Option A: Build Your Own

```javascript
async function fetchAggregatorData(ticker) {
  const [binance, coinbase, kraken, uniswap] = await Promise.all([
    fetchBinancePrice(ticker),
    fetchCoinbasePrice(ticker),
    fetchKrakenPrice(ticker),
    fetchUniswapPrice(ticker),
  ]);
  
  const prices = [binance, coinbase, kraken, uniswap].filter(Boolean);
  const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  
  const bestBuy = prices.reduce((min, p) => p.price < min.price ? p : min);
  const bestSell = prices.reduce((max, p) => p.price > max.price ? p : max);
  
  return {
    exchanges: {
      binance: { price: binance.price, volume: binance.volume, available: true },
      coinbase: { price: coinbase.price, volume: coinbase.volume, available: true },
      kraken: { price: kraken.price, volume: kraken.volume, available: true },
    },
    aggregatedPrice: avgPrice,
    priceDiscrepancy: ((bestSell.price - bestBuy.price) / bestBuy.price) * 100,
    bestBuy: bestBuy,
    bestSell: bestSell,
  };
}
```

### Option B: Use Existing Service

**CoinGecko Pro API**
```javascript
async function fetchAggregatorData(ticker) {
  const response = await fetch(
    `https://pro-api.coingecko.com/api/v3/coins/${ticker}/tickers?exchange_ids=binance,coinbase,kraken`,
    {
      headers: {
        'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
      }
    }
  );
  
  const data = await response.json();
  
  // Process tickers data
  return processTickerData(data.tickers);
}
```

**1inch API** (for DEX aggregation)
```javascript
async function fetchDEXPrices(ticker) {
  const response = await fetch(
    `https://api.1inch.dev/price/v1.1/1/${ticker}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`
      }
    }
  );
  
  const data = await response.json();
  
  return {
    uniswap: data[ticker].price,
    sushiswap: data[ticker].price,
    // ... other DEXes
  };
}
```

---

## 4. 📈 Real TradingView Chart Data

### Binance Klines API (Free)

```javascript
async function fetchChartData(ticker, timeframe) {
  // Convert timeframe to Binance format
  const intervalMap = {
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
  };
  
  const interval = intervalMap[timeframe] || '1h';
  
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${ticker}USDT&interval=${interval}&limit=100`
  );
  
  const data = await response.json();
  
  const candles = data.map(k => ({
    time: k[0] / 1000, // Convert to seconds
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));
  
  const volumes = data.map(k => ({
    time: k[0] / 1000,
    value: parseFloat(k[5]),
    color: parseFloat(k[4]) > parseFloat(k[1]) ? '#10B98180' : '#EF444480',
  }));
  
  return { candles, volumes };
}
```

---

## 🔐 Environment Variables Setup

### `.env.local` file:

```bash
# Liquidation Data
COINGLASS_API_KEY=your_coinglass_key
GLASSNODE_API_KEY=your_glassnode_key

# Multi-Exchange
COINGECKO_API_KEY=your_coingecko_key
ONEINCH_API_KEY=your_1inch_key

# Optional: Direct Exchange APIs
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET_KEY=your_binance_secret
COINBASE_API_KEY=your_coinbase_key
KRAKEN_API_KEY=your_kraken_key
```

### Vercel Environment Variables:

1. Go to Vercel Dashboard
2. Select Project → Settings → Environment Variables
3. Add each variable:
   - Name: `COINGLASS_API_KEY`
   - Value: `your_key_here`
   - Environment: Production

---

## 📝 Implementation Checklist

### Step 1: Get API Keys
- [ ] Sign up for Coinglass (liquidation data)
- [ ] Get Binance API key (funding rates - free)
- [ ] Optional: CoinGecko Pro (multi-exchange)
- [ ] Optional: 1inch (DEX aggregation)

### Step 2: Update Code

**File: `lib/websocket.js`**

Replace mock functions with real API calls:

```javascript
// Replace this:
const fetchLiquidationData = async (ticker) => {
  return {
    longLiquidations: Math.random() * 1000000,
    // ...
  };
};

// With this:
const fetchLiquidationData = async (ticker) => {
  const response = await fetch(
    `https://open-api.coinglass.com/public/v2/liquidation_chart?symbol=${ticker}USDT&time_type=24h`,
    {
      headers: { 'coinglassSecret': process.env.NEXT_PUBLIC_COINGLASS_API_KEY }
    }
  );
  const data = await response.json();
  return {
    longLiquidations: data.data.longLiquidationUsd || 0,
    shortLiquidations: data.data.shortLiquidationUsd || 0,
    totalLiquidated: data.data.totalLiquidationUsd || 0,
  };
};
```

### Step 3: Test

```bash
# Test locally
npm run dev

# Check browser console
# Verify API responses

# Test with different tickers
# BTC, ETH, SOL
```

### Step 4: Deploy

```bash
# Add env vars to Vercel
vercel env add COINGLASS_API_KEY

# Deploy
vercel --prod
```

---

## 🎯 Rate Limiting

### Best Practices

```javascript
// Implement rate limiting
const rateLimiter = {
  lastCall: {},
  minInterval: 1000, // 1 second between calls
  
  async throttle(key, fn) {
    const now = Date.now();
    const lastCall = this.lastCall[key] || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall[key] = Date.now();
    return await fn();
  }
};

// Usage:
const data = await rateLimiter.throttle('coinglass', () => 
  fetchLiquidationData(ticker)
);
```

---

## 🆓 Free Tier Limits

| Service | Free Tier | Recommended Plan |
|---------|-----------|------------------|
| Binance API | Unlimited (public endpoints) | Free ✅ |
| Coinglass | 500 req/day | Free ✅ |
| CoinGecko | 50 req/min | $129/mo (Pro) |
| Glassnode | None | $39/mo (Starter) |
| 1inch | 1 req/sec | Free ✅ |

### Recommended Setup (Cost: $0/month)

- ✅ Binance WebSocket (live prices) - FREE
- ✅ Binance API (funding rates) - FREE  
- ✅ Coinglass (liquidation data) - FREE (500 req/day)
- ✅ Build your own aggregator - FREE

With this setup, you can run the bot completely free!

---

## 🚨 Error Handling

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

---

## 📚 Additional Resources

- [Binance API Docs](https://binance-docs.github.io/apidocs/)
- [Coinglass API](https://coinglass.com/api)
- [CoinGecko API](https://www.coingecko.com/en/api)
- [1inch API](https://docs.1inch.io/)

---

**Once you connect these APIs, your bot will have REAL data instead of mock data!** 🚀
