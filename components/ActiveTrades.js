'use client';

import { motion } from 'framer-motion';
import useStore from '../lib/store';

const ActiveTrades = () => {
  const { activeTrades, closeTrade, priceData } = useStore();

  const openTrades = activeTrades.filter(t => t.status === 'open');
  const closedTrades = activeTrades.filter(t => t.status === 'closed').slice(0, 5);

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const calculateUnrealizedPnL = (trade) => {
    const currentPrice = priceData[trade.ticker]?.price || trade.entry;
    return ((currentPrice - trade.entry) / trade.entry) * 100;
  };

  const handleCloseTrade = (trade) => {
    if (confirm(`Close ${trade.ticker} trade?`)) {
      const currentPrice = priceData[trade.ticker]?.price || trade.entry;
      closeTrade(trade.id, currentPrice, 'Manual close');
    }
  };

  if (activeTrades.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-terminal-dark border-2 border-neon-gold rounded-lg p-6 mb-6"
    >
      <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-neon-gold">📊</span>
        Active Trades
        {openTrades.length > 0 && (
          <span className="text-sm px-2 py-1 bg-neon-gold/20 text-neon-gold rounded">
            {openTrades.length} Open
          </span>
        )}
      </h3>

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <div className="space-y-3 mb-6">
          {openTrades.map((trade) => {
            const unrealizedPnL = calculateUnrealizedPnL(trade);
            const currentPrice = priceData[trade.ticker]?.price || trade.entry;
            
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-terminal-accent/50 rounded-lg p-4 border border-terminal-border"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white">{trade.ticker}/USDT</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        trade.type === 'BUY' ? 'bg-neon-emerald text-terminal-black' : 'bg-neon-crimson text-terminal-black'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Opened: {new Date(trade.openedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-right ${
                    unrealizedPnL >= 0 ? 'text-neon-emerald' : 'text-neon-crimson'
                  }`}>
                    <div className="text-2xl font-bold font-mono">
                      {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">Unrealized P&L</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <div className="text-gray-500">Entry</div>
                    <div className="text-white font-mono">${formatPrice(trade.entry)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Current</div>
                    <div className="text-white font-mono">${formatPrice(currentPrice)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Stop Loss</div>
                    <div className="text-neon-crimson font-mono">${formatPrice(trade.stopLoss)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Take Profit</div>
                    <div className="text-neon-emerald font-mono">${formatPrice(trade.takeProfit)}</div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">To Stop Loss:</span>
                      <span className="text-neon-crimson">
                        {((trade.stopLoss - currentPrice) / currentPrice * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-crimson"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, ((currentPrice - trade.stopLoss) / (trade.entry - trade.stopLoss)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">To Take Profit:</span>
                      <span className="text-neon-emerald">
                        {((trade.takeProfit - currentPrice) / currentPrice * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-emerald"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, ((currentPrice - trade.entry) / (trade.takeProfit - trade.entry)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Trade reasons */}
                {trade.reasons && trade.reasons.length > 0 && (
                  <div className="text-xs text-gray-500 mb-3">
                    Reasons: {trade.reasons.join(', ')}
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => handleCloseTrade(trade)}
                  className="w-full py-2 bg-neon-crimson/20 hover:bg-neon-crimson/30 text-neon-crimson text-sm font-bold rounded transition-colors"
                >
                  Close Position
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Closed Trades History */}
      {closedTrades.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-400 mb-3">Recent Closed Trades</h4>
          <div className="space-y-2">
            {closedTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-terminal-accent/30 rounded p-3 text-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{trade.ticker}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      trade.type === 'BUY' ? 'bg-neon-emerald/20 text-neon-emerald' : 'bg-neon-crimson/20 text-neon-crimson'
                    }`}>
                      {trade.type}
                    </span>
                  </div>
                  <div className={`font-bold ${
                    trade.pnl >= 0 ? 'text-neon-emerald' : 'text-neon-crimson'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                  </div>
                </div>
                <div className="text-gray-600 mt-1">
                  {trade.closeReason} • {new Date(trade.closedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ActiveTrades;
