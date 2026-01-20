'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../lib/store';
import OrderBook from './OrderBook';
import TradingChart from './TradingChart';
import LiquidationMap from './LiquidationMap';
import TradeButton from './TradeButton';

const Modal = ({ isOpen, onClose, coin, coinData }) => {
  const { updateCoinNotes, liquidationData, fundingRates } = useStore();
  const [notes, setNotes] = useState(coin.notes);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    setNotes(coin.notes);
  }, [coin]);

  const handleSave = () => {
    updateCoinNotes(coin.ticker, notes);
    onClose();
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const liqData = liquidationData[coin.ticker];
  const fundingRate = fundingRates[coin.ticker];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-terminal-dark border-2 border-neon-emerald rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl shadow-neon-emerald/20"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-terminal-border bg-gradient-to-r from-neon-emerald/5 to-transparent">
              <div>
                <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                  {coin.ticker}
                  <span className="text-sm font-mono text-gray-500">/USDT</span>
                  <span className={`text-lg px-3 py-1 rounded border-2 ${
                    coin.setupGrade === 'A' ? 'border-neon-gold text-neon-gold bg-neon-gold/10' :
                    coin.setupGrade === 'B' ? 'border-neon-emerald text-neon-emerald bg-neon-emerald/10' :
                    'border-neon-blue text-neon-blue bg-neon-blue/10'
                  }`}>
                    Grade {coin.setupGrade}
                  </span>
                  <span className="text-xs px-2 py-1 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/40">
                    AUTO
                  </span>
                </h2>
                {coinData && (
                  <div className="mt-2 flex items-center gap-6">
                    <div className={`text-2xl font-mono font-bold ${
                      coinData.priceChangePercent24h > 0 ? 'text-neon-emerald' : 'text-neon-crimson'
                    }`}>
                      ${formatPrice(coinData.price)}
                    </div>
                    <div className={`text-sm ${
                      coinData.priceChangePercent24h > 0 ? 'text-neon-emerald' : 'text-neon-crimson'
                    }`}>
                      {coinData.priceChangePercent24h > 0 ? '▲' : '▼'} {Math.abs(coinData.priceChangePercent24h).toFixed(2)}%
                    </div>
                    {coinData.signal && (
                      <div className={`px-3 py-1 rounded font-bold text-sm ${
                        coinData.signal.type === 'BUY' ? 'bg-neon-emerald text-terminal-black' :
                        coinData.signal.type === 'SELL' ? 'bg-neon-crimson text-terminal-black' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {coinData.signal.type} SIGNAL - {coinData.signal.strength}%
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Left column - Chart & Liquidations */}
                <div className="col-span-2 space-y-6">
                  {/* Timeframe selector */}
                  <div className="flex gap-2">
                    {['15m', '1h', '4h', '1d'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                          timeframe === tf
                            ? 'bg-neon-emerald text-terminal-black'
                            : 'bg-terminal-accent text-gray-400 hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  {/* Embedded TradingView Chart */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <TradingChart ticker={coin.ticker} timeframe={timeframe} />
                  </div>

                  {/* Statistics Grid */}
                  {coinData && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-terminal-accent/50 rounded p-4">
                        <div className="text-xs text-gray-500 mb-1">24h High</div>
                        <div className="text-lg font-mono text-neon-emerald tabular-nums">
                          ${formatPrice(coinData.high24h)}
                        </div>
                      </div>
                      <div className="bg-terminal-accent/50 rounded p-4">
                        <div className="text-xs text-gray-500 mb-1">24h Low</div>
                        <div className="text-lg font-mono text-neon-crimson tabular-nums">
                          ${formatPrice(coinData.low24h)}
                        </div>
                      </div>
                      <div className="bg-terminal-accent/50 rounded p-4">
                        <div className="text-xs text-gray-500 mb-1">24h Volume</div>
                        <div className="text-lg font-mono text-neon-gold tabular-nums">
                          {coinData.volume24h >= 1e6 
                            ? `${(coinData.volume24h / 1e6).toFixed(2)}M`
                            : `${(coinData.volume24h / 1e3).toFixed(2)}K`
                          }
                        </div>
                      </div>
                      <div className="bg-terminal-accent/50 rounded p-4">
                        <div className="text-xs text-gray-500 mb-1">Distance to ATH</div>
                        <div className={`text-lg font-mono tabular-nums ${
                          coinData.isNearATH ? 'text-neon-gold' : 'text-gray-300'
                        }`}>
                          {coinData.distanceToATH.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Liquidation Map */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <LiquidationMap 
                      ticker={coin.ticker} 
                      liquidationData={liqData}
                      currentPrice={coinData?.price || 0}
                    />
                  </div>

                  {/* Order Book */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <OrderBook ticker={coin.ticker} mini={false} />
                  </div>
                </div>

                {/* Right column - Analysis & Controls */}
                <div className="space-y-6">
                  {/* AI Probability Score - READ ONLY */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm text-gray-400">
                        AI Probability Score
                      </label>
                      <span className="text-xs px-2 py-1 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/40">
                        AUTO
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-bold text-neon-emerald">
                        {coin.probabilityScore.toFixed(0)}%
                      </span>
                      <div className="text-xs text-gray-500">
                        Updated every 5s based on live metrics
                      </div>
                    </div>
                    <div className="h-2 bg-terminal-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-crimson via-neon-gold to-neon-emerald transition-all"
                        style={{ width: `${coin.probabilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Setup Grade - READ ONLY */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm text-gray-400">
                        Setup Grade
                      </label>
                      <span className="text-xs px-2 py-1 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/40">
                        AUTO
                      </span>
                    </div>
                    <div className={`
                      text-center py-4 rounded font-bold text-3xl border-2
                      ${coin.setupGrade === 'A' ? 'bg-neon-gold/10 text-neon-gold border-neon-gold' :
                        coin.setupGrade === 'B' ? 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald' :
                        'bg-neon-blue/10 text-neon-blue border-neon-blue'}
                    `}>
                      GRADE {coin.setupGrade}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {coin.setupGrade === 'A' && 'High confidence setup (75+ points)'}
                      {coin.setupGrade === 'B' && 'Medium confidence (50-74 points)'}
                      {coin.setupGrade === 'C' && 'Speculative (<50 points)'}
                    </div>
                  </div>

                  {/* Funding Rate */}
                  {fundingRate && (
                    <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                      <h4 className="text-sm text-gray-400 mb-3">Funding Rate</h4>
                      <div className={`text-2xl font-mono font-bold ${
                        fundingRate.rate < -0.01 ? 'text-neon-emerald' :
                        fundingRate.rate > 0.05 ? 'text-neon-crimson' :
                        'text-gray-400'
                      }`}>
                        {(fundingRate.rate * 100).toFixed(4)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {fundingRate.rate < 0 ? '💰 Shorts paying longs (Bullish)' : 
                         fundingRate.rate > 0.05 ? '⚠️ Market overheated' :
                         'Neutral funding'}
                      </div>
                    </div>
                  )}

                  {/* Correlations */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <h4 className="text-sm text-gray-400 mb-3">Market Correlations</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">BTC Beta</span>
                          <span className={`font-mono font-bold ${
                            Math.abs(coin.btcCorrelation) > 0.7 ? 'text-neon-emerald' : 'text-gray-400'
                          }`}>
                            {coin.btcCorrelation.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-2 bg-terminal-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neon-emerald transition-all"
                            style={{ width: `${Math.abs(coin.btcCorrelation) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">ETH Beta</span>
                          <span className={`font-mono font-bold ${
                            Math.abs(coin.ethCorrelation) > 0.7 ? 'text-neon-emerald' : 'text-gray-400'
                          }`}>
                            {coin.ethCorrelation.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-2 bg-terminal-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neon-blue transition-all"
                            style={{ width: `${Math.abs(coin.ethCorrelation) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trade Signal Breakdown */}
                  {coinData?.signal && (
                    <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                      <h4 className="text-sm text-gray-400 mb-3">Trade Signal Analysis</h4>
                      {coinData.signal.reasons && coinData.signal.reasons.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {coinData.signal.reasons.map((reason, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                              <span className="text-neon-emerald">✓</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-terminal-dark rounded">
                          <div className="text-gray-500">Stop Loss</div>
                          <div className="text-neon-crimson font-mono">
                            ${formatPrice(coinData.signal.stopLoss)}
                          </div>
                        </div>
                        <div className="p-2 bg-terminal-dark rounded">
                          <div className="text-gray-500">Take Profit</div>
                          <div className="text-neon-emerald font-mono">
                            ${formatPrice(coinData.signal.takeProfit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Research Notes */}
                  <div className="bg-terminal-accent/30 rounded-lg p-6 border border-terminal-border">
                    <label className="block text-sm text-gray-400 mb-3">
                      Research Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your research notes, catalyst events, or setup details..."
                      className="w-full h-32 bg-terminal-dark border border-terminal-border rounded p-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neon-emerald resize-none"
                    />
                  </div>

                  {/* Trade Button */}
                  <TradeButton coin={coin} signal={coinData?.signal} coinData={coinData} />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 py-3 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue font-bold rounded transition-colors"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-terminal-accent hover:bg-terminal-border text-gray-300 font-bold rounded transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
