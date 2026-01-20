import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sector mapping for auto-categorization
const SECTOR_KEYWORDS = {
  L1: ['btc', 'eth', 'sol', 'ada', 'dot', 'avax', 'near', 'atom', 'ftm', 'algo'],
  L2: ['arb', 'op', 'matic', 'polygon', 'zksync', 'starknet', 'imx', 'loopring'],
  DePIN: ['hnt', 'rndr', 'theta', 'fil', 'storj', 'grt', 'ocean', 'akash'],
  Memes: ['doge', 'shib', 'pepe', 'bonk', 'floki', 'babydoge', 'wojak'],
  DeFi: ['uni', 'aave', 'comp', 'mkr', 'crv', 'snx', 'sushi', 'cake'],
  Gaming: ['axs', 'sand', 'mana', 'gala', 'enj', 'ron', 'ilv'],
  AI: ['fet', 'agix', 'ocean', 'render', 'phala'],
  Stablecoin: ['usdt', 'usdc', 'busd', 'dai', 'frax', 'tusd'],
};

const determineSector = (ticker) => {
  const lowerTicker = ticker.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(keyword => lowerTicker.includes(keyword))) {
      return sector;
    }
  }
  return 'Other';
};

// AUTOMATED GRADING SYSTEM
const calculateAutoGrade = (metrics) => {
  const {
    btcCorrelation,
    ethCorrelation,
    volumeRatio,
    liquidationData,
    fundingRate,
    orderBookImbalance,
    priceChangePercent24h,
    distanceToATH,
  } = metrics;

  let score = 0;

  // Correlation analysis (20 points)
  const avgCorrelation = (Math.abs(btcCorrelation) + Math.abs(ethCorrelation)) / 2;
  if (avgCorrelation > 0.7) score += 20;
  else if (avgCorrelation > 0.4) score += 15;
  else if (avgCorrelation > 0.2) score += 10;

  // Volume analysis (15 points)
  if (volumeRatio > 2.0) score += 15;
  else if (volumeRatio > 1.5) score += 10;
  else if (volumeRatio > 1.0) score += 5;

  // Liquidation pressure (20 points)
  if (liquidationData.longLiquidations < liquidationData.shortLiquidations * 0.5) {
    score += 20; // Strong bullish signal
  } else if (liquidationData.longLiquidations < liquidationData.shortLiquidations) {
    score += 10;
  }

  // Funding rate (15 points)
  if (fundingRate < 0) {
    score += 15; // Negative funding = bullish
  } else if (fundingRate < 0.01) {
    score += 10;
  } else if (fundingRate < 0.05) {
    score += 5;
  }

  // Order book imbalance (15 points)
  if (orderBookImbalance > 1.5) score += 15; // More bids than asks
  else if (orderBookImbalance > 1.2) score += 10;
  else if (orderBookImbalance > 1.0) score += 5;

  // Price momentum (10 points)
  if (priceChangePercent24h > 10) score += 10;
  else if (priceChangePercent24h > 5) score += 7;
  else if (priceChangePercent24h > 2) score += 4;

  // Distance to ATH (5 points)
  if (distanceToATH < 5) score += 5;
  else if (distanceToATH < 10) score += 3;

  // Convert score to grade
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  return 'C';
};

// AUTOMATED PROBABILITY CALCULATION
const calculateAutoProbability = (metrics) => {
  const {
    btcCorrelation,
    ethCorrelation,
    volumeRatio,
    liquidationData,
    fundingRate,
    orderBookImbalance,
    priceChangePercent24h,
    distanceToATH,
    orderFlowStrength,
    marketSentiment,
  } = metrics;

  let probability = 50; // Base probability

  // BTC/ETH Correlation factor (±15%)
  const avgCorr = (btcCorrelation + ethCorrelation) / 2;
  if (avgCorr > 0.7) probability += 15;
  else if (avgCorr > 0.4) probability += 10;
  else if (avgCorr > 0) probability += 5;
  else if (avgCorr < -0.3) probability -= 10; // Inverse correlation

  // Volume surge (±10%)
  if (volumeRatio > 3.0) probability += 10;
  else if (volumeRatio > 2.0) probability += 7;
  else if (volumeRatio > 1.5) probability += 4;
  else if (volumeRatio < 0.7) probability -= 5;

  // Liquidation cascade potential (±15%)
  const liqRatio = liquidationData.shortLiquidations / (liquidationData.longLiquidations + 1);
  if (liqRatio > 2.0) probability += 15; // Shorts getting rekt
  else if (liqRatio > 1.5) probability += 10;
  else if (liqRatio < 0.5) probability -= 10; // Longs getting rekt

  // Funding rate analysis (±10%)
  if (fundingRate < -0.01) probability += 10; // Shorts paying longs
  else if (fundingRate < 0) probability += 5;
  else if (fundingRate > 0.05) probability -= 10; // Overheated

  // Order book strength (±12%)
  if (orderBookImbalance > 2.0) probability += 12;
  else if (orderBookImbalance > 1.5) probability += 8;
  else if (orderBookImbalance > 1.2) probability += 4;
  else if (orderBookImbalance < 0.8) probability -= 8;

  // Price action (±10%)
  if (priceChangePercent24h > 15) probability += 10;
  else if (priceChangePercent24h > 8) probability += 7;
  else if (priceChangePercent24h > 3) probability += 4;
  else if (priceChangePercent24h < -5) probability -= 10;

  // ATH proximity (±8%)
  if (distanceToATH < 3) probability += 8;
  else if (distanceToATH < 7) probability += 5;
  else if (distanceToATH < 15) probability += 2;

  // Order flow strength (±10%)
  if (orderFlowStrength > 0.7) probability += 10;
  else if (orderFlowStrength > 0.5) probability += 6;
  else if (orderFlowStrength > 0.3) probability += 3;
  else if (orderFlowStrength < 0.2) probability -= 8;

  // Market sentiment (±10%)
  if (marketSentiment === 'extreme_bullish') probability += 10;
  else if (marketSentiment === 'bullish') probability += 6;
  else if (marketSentiment === 'neutral') probability += 0;
  else if (marketSentiment === 'bearish') probability -= 6;
  else if (marketSentiment === 'extreme_bearish') probability -= 10;

  // Clamp between 0-100
  return Math.max(0, Math.min(100, probability));
};

const useStore = create(
  persist(
    (set, get) => ({
      // Coin data
      coins: [],
      
      // Live price data from WebSocket
      priceData: {},
      
      // Order book data (aggregated from all exchanges)
      orderBooks: {},
      
      // NEW: Liquidation data
      liquidationData: {},
      
      // NEW: Funding rates
      fundingRates: {},
      
      // NEW: Aggregated DEX/Perp/Spot data
      aggregatorData: {},
      
      // NEW: Trading signals
      tradeSignals: {},
      
      // NEW: Active trades
      activeTrades: [],
      
      // Filters and sorting
      sortBy: 'probability',
      filterSector: 'all',
      probabilityDecay: false,
      
      // NEW: Auto-trading settings
      autoTradingEnabled: false,
      riskLevel: 'medium', // low, medium, high
      maxPositionSize: 1000, // USDT
      stopLossPercent: 5,
      takeProfitPercent: 15,
      
      // Admin access
      isAdminAuthenticated: false,
      
      // WebSocket connection status
      wsConnected: false,
      
      // NEW: Trading bot status
      botStatus: 'idle', // idle, scanning, executing, monitoring
      
      // Actions
      addCoin: (ticker, notes = '') => {
        const coins = get().coins;
        const existingIndex = coins.findIndex(c => c.ticker === ticker.toUpperCase());
        
        if (existingIndex >= 0) {
          return; // Already exists
        }
        
        const coinData = {
          ticker: ticker.toUpperCase(),
          probabilityScore: 50, // Will be auto-calculated
          setupGrade: 'B', // Will be auto-calculated
          sector: determineSector(ticker),
          addedAt: Date.now(),
          lastUpdated: Date.now(),
          notes: notes || '',
          btcCorrelation: 0,
          ethCorrelation: 0,
          autoManaged: true, // NEW: Flag for automated management
        };
        
        set({ coins: [...coins, coinData] });
      },
      
      addBulkCoins: (tickers) => {
        const tickerArray = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
        const existingTickers = new Set(get().coins.map(c => c.ticker));
        
        const newCoins = tickerArray
          .filter(ticker => !existingTickers.has(ticker))
          .map(ticker => ({
            ticker,
            probabilityScore: 50,
            setupGrade: 'B',
            sector: determineSector(ticker),
            addedAt: Date.now(),
            lastUpdated: Date.now(),
            notes: '',
            btcCorrelation: 0,
            ethCorrelation: 0,
            autoManaged: true,
          }));
        
        set({ coins: [...get().coins, ...newCoins] });
      },
      
      removeCoin: (ticker) => {
        set({ coins: get().coins.filter(c => c.ticker !== ticker) });
      },
      
      // NEW: Auto-update probability and grade based on metrics
      updateCoinMetrics: (ticker, metrics) => {
        const coins = get().coins.map(coin => {
          if (coin.ticker === ticker) {
            const autoProbability = calculateAutoProbability(metrics);
            const autoGrade = calculateAutoGrade(metrics);
            
            return {
              ...coin,
              probabilityScore: autoProbability,
              setupGrade: autoGrade,
              lastUpdated: Date.now(),
              metrics: metrics,
            };
          }
          return coin;
        });
        set({ coins });
      },
      
      updatePriceData: (ticker, data) => {
        set(state => ({
          priceData: {
            ...state.priceData,
            [ticker]: {
              ...state.priceData[ticker],
              ...data,
              lastUpdate: Date.now(),
            }
          }
        }));
      },
      
      updateOrderBook: (ticker, orderBook) => {
        set(state => ({
          orderBooks: {
            ...state.orderBooks,
            [ticker]: orderBook,
          }
        }));
      },
      
      // NEW: Update liquidation data
      updateLiquidationData: (ticker, liqData) => {
        set(state => ({
          liquidationData: {
            ...state.liquidationData,
            [ticker]: {
              ...liqData,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      // NEW: Update funding rates
      updateFundingRate: (ticker, fundingRate) => {
        set(state => ({
          fundingRates: {
            ...state.fundingRates,
            [ticker]: {
              rate: fundingRate,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      // NEW: Update aggregated exchange data
      updateAggregatorData: (ticker, exchangeData) => {
        set(state => ({
          aggregatorData: {
            ...state.aggregatorData,
            [ticker]: {
              ...exchangeData,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      updateCorrelation: (ticker, btcCorrelation, ethCorrelation) => {
        const coins = get().coins.map(coin => 
          coin.ticker === ticker 
            ? { ...coin, btcCorrelation, ethCorrelation }
            : coin
        );
        set({ coins });
      },
      
      // NEW: Generate trade signal
      generateTradeSignal: (ticker) => {
        const coin = get().coins.find(c => c.ticker === ticker);
        const priceData = get().priceData[ticker];
        const orderBook = get().orderBooks[ticker];
        const liqData = get().liquidationData[ticker];
        const fundingRate = get().fundingRates[ticker];
        
        if (!coin || !priceData || !orderBook) return null;
        
        const signal = {
          ticker,
          type: coin.probabilityScore > 70 ? 'BUY' : coin.probabilityScore < 30 ? 'SELL' : 'HOLD',
          strength: coin.probabilityScore,
          grade: coin.setupGrade,
          entry: priceData.price,
          stopLoss: priceData.price * (1 - get().stopLossPercent / 100),
          takeProfit: priceData.price * (1 + get().takeProfitPercent / 100),
          timestamp: Date.now(),
          reasons: [],
        };
        
        // Add reasoning
        if (coin.btcCorrelation > 0.7) signal.reasons.push('Strong BTC correlation');
        if (liqData && liqData.shortLiquidations > liqData.longLiquidations * 1.5) {
          signal.reasons.push('Short squeeze potential');
        }
        if (fundingRate && fundingRate.rate < -0.01) signal.reasons.push('Negative funding');
        if (orderBook.bidVolume > orderBook.askVolume * 1.5) signal.reasons.push('Strong bid support');
        
        set(state => ({
          tradeSignals: {
            ...state.tradeSignals,
            [ticker]: signal,
          }
        }));
        
        return signal;
      },
      
      // NEW: Execute trade
      executeTrade: async (ticker, signal) => {
        set({ botStatus: 'executing' });
        
        const trade = {
          id: `trade_${Date.now()}`,
          ticker,
          type: signal.type,
          entry: signal.entry,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          size: get().maxPositionSize,
          status: 'open',
          openedAt: Date.now(),
          reasons: signal.reasons,
        };
        
        set(state => ({
          activeTrades: [...state.activeTrades, trade],
          botStatus: 'monitoring',
        }));
        
        return trade;
      },
      
      // NEW: Close trade
      closeTrade: (tradeId, exitPrice, reason) => {
        set(state => ({
          activeTrades: state.activeTrades.map(trade =>
            trade.id === tradeId
              ? {
                  ...trade,
                  status: 'closed',
                  exit: exitPrice,
                  closedAt: Date.now(),
                  pnl: ((exitPrice - trade.entry) / trade.entry) * 100,
                  closeReason: reason,
                }
              : trade
          ),
        }));
      },
      
      setSortBy: (sortBy) => set({ sortBy }),
      setFilterSector: (filterSector) => set({ filterSector }),
      toggleProbabilityDecay: () => set({ probabilityDecay: !get().probabilityDecay }),
      setAdminAuthenticated: (value) => set({ isAdminAuthenticated: value }),
      setWsConnected: (value) => set({ wsConnected: value }),
      
      // NEW: Auto-trading controls
      toggleAutoTrading: () => set({ autoTradingEnabled: !get().autoTradingEnabled }),
      setRiskLevel: (level) => set({ riskLevel: level }),
      setMaxPositionSize: (size) => set({ maxPositionSize: size }),
      setStopLoss: (percent) => set({ stopLossPercent: percent }),
      setTakeProfit: (percent) => set({ takeProfitPercent: percent }),
      setBotStatus: (status) => set({ botStatus: status }),
      
      // Get sorted and filtered coins
      getFilteredCoins: () => {
        const { coins, sortBy, filterSector } = get();
        
        let filtered = [...coins];
        
        if (filterSector !== 'all') {
          filtered = filtered.filter(coin => coin.sector === filterSector);
        }
        
        switch (sortBy) {
          case 'probability':
            filtered.sort((a, b) => b.probabilityScore - a.probabilityScore);
            break;
          case 'grade':
            const gradeOrder = { 'A': 3, 'B': 2, 'C': 1 };
            filtered.sort((a, b) => gradeOrder[b.setupGrade] - gradeOrder[a.setupGrade]);
            break;
          case 'recent':
            filtered.sort((a, b) => b.addedAt - a.addedAt);
            break;
          case 'sector':
            filtered.sort((a, b) => a.sector.localeCompare(b.sector));
            break;
          default:
            break;
        }
        
        return filtered;
      },
    }),
    {
      name: 'cointracker-storage',
      partialize: (state) => ({
        coins: state.coins,
        sortBy: state.sortBy,
        filterSector: state.filterSector,
        probabilityDecay: state.probabilityDecay,
        autoTradingEnabled: state.autoTradingEnabled,
        riskLevel: state.riskLevel,
        maxPositionSize: state.maxPositionSize,
        stopLossPercent: state.stopLossPercent,
        takeProfitPercent: state.takeProfitPercent,
      }),
    }
  )
);

export default useStore;
