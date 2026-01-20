import { useEffect, useRef } from 'react';
import useStore from './store';

// Calculate correlation coefficient between two price arrays
const calculateCorrelation = (arr1, arr2) => {
  if (arr1.length !== arr2.length || arr1.length === 0) return 0;
  
  const n = arr1.length;
  const sum1 = arr1.reduce((a, b) => a + b, 0);
  const sum2 = arr2.reduce((a, b) => a + b, 0);
  const sum1Sq = arr1.reduce((a, b) => a + b * b, 0);
  const sum2Sq = arr2.reduce((a, b) => a + b * b, 0);
  const pSum = arr1.reduce((a, b, i) => a + b * arr2[i], 0);
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  if (den === 0) return 0;
  return num / den;
};

// Calculate order book imbalance
const calculateOrderBookImbalance = (orderBook) => {
  if (!orderBook || !orderBook.bids || !orderBook.asks) return 1.0;
  
  const bidVolume = orderBook.bids.reduce((sum, [price, qty]) => sum + (price * qty), 0);
  const askVolume = orderBook.asks.reduce((sum, [price, qty]) => sum + (price * qty), 0);
  
  return askVolume > 0 ? bidVolume / askVolume : 1.0;
};

// Calculate order flow strength
const calculateOrderFlowStrength = (priceHistory, volumeHistory) => {
  if (!priceHistory || priceHistory.length < 10) return 0.5;
  
  let buyPressure = 0;
  let sellPressure = 0;
  
  for (let i = 1; i < priceHistory.length; i++) {
    const priceDiff = priceHistory[i] - priceHistory[i - 1];
    const volume = volumeHistory[i] || 1;
    
    if (priceDiff > 0) {
      buyPressure += volume;
    } else if (priceDiff < 0) {
      sellPressure += volume;
    }
  }
  
  const totalPressure = buyPressure + sellPressure;
  return totalPressure > 0 ? buyPressure / totalPressure : 0.5;
};

// Determine market sentiment
const determineMarketSentiment = (metrics) => {
  const {
    priceChangePercent24h,
    volumeRatio,
    btcCorrelation,
    fundingRate,
    orderBookImbalance,
  } = metrics;
  
  let score = 0;
  
  if (priceChangePercent24h > 10) score += 2;
  else if (priceChangePercent24h > 5) score += 1;
  else if (priceChangePercent24h < -5) score -= 1;
  else if (priceChangePercent24h < -10) score -= 2;
  
  if (volumeRatio > 2.0) score += 1;
  if (btcCorrelation > 0.7) score += 1;
  if (fundingRate < 0) score += 1;
  else if (fundingRate > 0.05) score -= 1;
  if (orderBookImbalance > 1.5) score += 1;
  else if (orderBookImbalance < 0.7) score -= 1;
  
  if (score >= 4) return 'extreme_bullish';
  if (score >= 2) return 'bullish';
  if (score <= -4) return 'extreme_bearish';
  if (score <= -2) return 'bearish';
  return 'neutral';
};

// Mock aggregator data (in production, this would fetch from your API)
const fetchAggregatorData = async (ticker) => {
  // Simulating aggregated data from multiple exchanges
  return {
    exchanges: {
      binance: { price: 0, volume: 0, available: true },
      coinbase: { price: 0, volume: 0, available: true },
      kraken: { price: 0, volume: 0, available: true },
      bybit: { price: 0, volume: 0, available: true },
      okx: { price: 0, volume: 0, available: true },
    },
    dex: {
      uniswap: { price: 0, liquidity: 0, volume24h: 0 },
      pancakeswap: { price: 0, liquidity: 0, volume24h: 0 },
      sushiswap: { price: 0, liquidity: 0, volume24h: 0 },
    },
    perp: {
      binanceFutures: { price: 0, openInterest: 0, volume: 0 },
      bybitPerp: { price: 0, openInterest: 0, volume: 0 },
      dydx: { price: 0, openInterest: 0, volume: 0 },
    },
    aggregatedPrice: 0,
    priceDiscrepancy: 0,
    bestBuy: null,
    bestSell: null,
  };
};

// Mock liquidation data fetcher
const fetchLiquidationData = async (ticker) => {
  // In production, fetch from liquidation tracking services
  // For now, simulate data
  return {
    longLiquidations: Math.random() * 1000000,
    shortLiquidations: Math.random() * 1000000,
    totalLiquidated: 0,
    liquidationClusters: [],
    nearbyLiquidations: {
      above: [], // Price levels with liquidations above current price
      below: [], // Price levels with liquidations below current price
    },
  };
};

// Mock funding rate fetcher
const fetchFundingRate = async (ticker) => {
  // In production, fetch from exchange APIs
  // Typical funding rates range from -0.05% to +0.05%
  return (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
};

export const useBinanceWebSocket = () => {
  const wsRef = useRef(null);
  const priceHistoryRef = useRef({});
  const volumeHistoryRef = useRef({});
  const aggregatorIntervalRef = useRef(null);
  const metricsIntervalRef = useRef(null);
  
  const { 
    coins, 
    updatePriceData, 
    updateOrderBook, 
    updateCorrelation,
    updateLiquidationData,
    updateFundingRate,
    updateAggregatorData,
    updateCoinMetrics,
    generateTradeSignal,
    setWsConnected,
    autoTradingEnabled,
    executeTrade,
  } = useStore();

  useEffect(() => {
    if (coins.length === 0) return;

    // Format tickers for Binance (add USDT)
    const streams = coins.map(coin => 
      `${coin.ticker.toLowerCase()}usdt@ticker/${coin.ticker.toLowerCase()}usdt@depth20@100ms`
    ).join('/');

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    
    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.data) {
          const data = message.data;
          const symbol = data.s?.replace('USDT', '') || '';
          
          // Handle ticker data
          if (data.e === '24hrTicker') {
            const priceData = {
              price: parseFloat(data.c),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume24h: parseFloat(data.v),
              priceChange24h: parseFloat(data.p),
              priceChangePercent24h: parseFloat(data.P),
              quoteVolume: parseFloat(data.q),
              trades24h: parseInt(data.n),
              bidPrice: parseFloat(data.b || data.c),
              askPrice: parseFloat(data.a || data.c),
            };
            
            updatePriceData(symbol, priceData);
            
            // Store price history for correlation and order flow
            if (!priceHistoryRef.current[symbol]) {
              priceHistoryRef.current[symbol] = [];
              volumeHistoryRef.current[symbol] = [];
            }
            priceHistoryRef.current[symbol].push(priceData.price);
            volumeHistoryRef.current[symbol].push(priceData.volume24h);
            
            // Keep only last 100 data points
            if (priceHistoryRef.current[symbol].length > 100) {
              priceHistoryRef.current[symbol].shift();
              volumeHistoryRef.current[symbol].shift();
            }
            
            // Calculate correlations
            if (priceHistoryRef.current.BTC && priceHistoryRef.current.ETH && 
                priceHistoryRef.current[symbol] && symbol !== 'BTC' && symbol !== 'ETH') {
              const btcCorr = calculateCorrelation(
                priceHistoryRef.current[symbol],
                priceHistoryRef.current.BTC.slice(-priceHistoryRef.current[symbol].length)
              );
              const ethCorr = calculateCorrelation(
                priceHistoryRef.current[symbol],
                priceHistoryRef.current.ETH.slice(-priceHistoryRef.current[symbol].length)
              );
              
              updateCorrelation(symbol, btcCorr, ethCorr);
            }
          }
          
          // Handle order book data (depth20 gives us top 20 levels)
          if (data.lastUpdateId || data.u) {
            const bids = (data.bids || data.b || []).map(([price, qty]) => [
              parseFloat(price),
              parseFloat(qty),
            ]);
            const asks = (data.asks || data.a || []).map(([price, qty]) => [
              parseFloat(price),
              parseFloat(qty),
            ]);
            
            const bidVolume = bids.reduce((sum, [p, q]) => sum + (p * q), 0);
            const askVolume = asks.reduce((sum, [p, q]) => sum + (p * q), 0);
            
            const orderBook = {
              bids: bids.slice(0, 10),
              asks: asks.slice(0, 10),
              bidVolume,
              askVolume,
              imbalance: askVolume > 0 ? bidVolume / askVolume : 1.0,
              spread: asks[0] && bids[0] ? asks[0][0] - bids[0][0] : 0,
            };
            
            updateOrderBook(symbol, orderBook);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        
        setTimeout(() => {
          if (coins.length > 0) {
            connectWebSocket();
          }
        }, 3000);
      };
    };

    connectWebSocket();

    // Fetch aggregator data every 10 seconds
    aggregatorIntervalRef.current = setInterval(async () => {
      for (const coin of coins) {
        try {
          const aggData = await fetchAggregatorData(coin.ticker);
          updateAggregatorData(coin.ticker, aggData);
          
          const liqData = await fetchLiquidationData(coin.ticker);
          liqData.totalLiquidated = liqData.longLiquidations + liqData.shortLiquidations;
          updateLiquidationData(coin.ticker, liqData);
          
          const fundingRate = await fetchFundingRate(coin.ticker);
          updateFundingRate(coin.ticker, fundingRate);
        } catch (error) {
          console.error(`Error fetching data for ${coin.ticker}:`, error);
        }
      }
    }, 10000);

    // Calculate metrics and update probability/grade every 5 seconds
    metricsIntervalRef.current = setInterval(() => {
      const state = useStore.getState();
      
      for (const coin of coins) {
        const priceData = state.priceData[coin.ticker];
        const orderBook = state.orderBooks[coin.ticker];
        const liqData = state.liquidationData[coin.ticker];
        const fundingRate = state.fundingRates[coin.ticker];
        
        if (!priceData || !orderBook) continue;
        
        // Calculate average volume over last 24h (mock - in production use real data)
        const avgVolume24h = priceData.volume24h;
        const currentVolume = priceData.quoteVolume;
        const volumeRatio = avgVolume24h > 0 ? currentVolume / avgVolume24h : 1.0;
        
        const orderFlowStrength = calculateOrderFlowStrength(
          priceHistoryRef.current[coin.ticker] || [],
          volumeHistoryRef.current[coin.ticker] || []
        );
        
        const metrics = {
          btcCorrelation: coin.btcCorrelation || 0,
          ethCorrelation: coin.ethCorrelation || 0,
          volumeRatio,
          liquidationData: liqData || { longLiquidations: 0, shortLiquidations: 0 },
          fundingRate: fundingRate?.rate || 0,
          orderBookImbalance: orderBook.imbalance || 1.0,
          priceChangePercent24h: priceData.priceChangePercent24h || 0,
          distanceToATH: priceData.high24h > 0 
            ? ((priceData.high24h - priceData.price) / priceData.high24h) * 100 
            : 0,
          orderFlowStrength,
          marketSentiment: determineMarketSentiment({
            priceChangePercent24h: priceData.priceChangePercent24h || 0,
            volumeRatio,
            btcCorrelation: coin.btcCorrelation || 0,
            fundingRate: fundingRate?.rate || 0,
            orderBookImbalance: orderBook.imbalance || 1.0,
          }),
        };
        
        // Update coin with auto-calculated metrics
        updateCoinMetrics(coin.ticker, metrics);
        
        // Generate trade signals
        const signal = generateTradeSignal(coin.ticker);
        
        // Auto-execute if enabled and signal is strong
        if (autoTradingEnabled && signal && signal.type === 'BUY' && signal.strength > 80) {
          executeTrade(coin.ticker, signal);
        }
      }
    }, 5000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (aggregatorIntervalRef.current) {
        clearInterval(aggregatorIntervalRef.current);
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [coins.map(c => c.ticker).join(',')]);

  return null;
};

// Hook to fetch coin data
export const useCoinData = (ticker) => {
  const { priceData, orderBooks, liquidationData, fundingRates, tradeSignals } = useStore();
  const data = priceData[ticker];
  const orderBook = orderBooks[ticker];
  const liqData = liquidationData[ticker];
  const fundingRate = fundingRates[ticker];
  const signal = tradeSignals[ticker];
  
  if (!data) return null;
  
  const distanceToATH = data.high24h > 0 
    ? ((data.high24h - data.price) / data.high24h) * 100 
    : 0;
  
  return {
    ...data,
    distanceToATH,
    isNearATH: distanceToATH < 5,
    orderBook,
    liquidationData: liqData,
    fundingRate: fundingRate?.rate,
    signal,
  };
};
