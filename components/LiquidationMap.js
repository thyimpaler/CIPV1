'use client';

import { motion } from 'framer-motion';

const LiquidationMap = ({ ticker, liquidationData, currentPrice }) => {
  if (!liquidationData) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Loading liquidation data...
      </div>
    );
  }

  const { longLiquidations, shortLiquidations, totalLiquidated } = liquidationData;
  const maxLiq = Math.max(longLiquidations, shortLiquidations);
  
  const longPercent = maxLiq > 0 ? (longLiquidations / maxLiq) * 100 : 0;
  const shortPercent = maxLiq > 0 ? (shortLiquidations / maxLiq) * 100 : 0;

  const formatLiquidation = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getSentiment = () => {
    const ratio = shortLiquidations / (longLiquidations + 1);
    if (ratio > 2.0) return { text: 'EXTREME BULLISH', color: 'text-neon-emerald' };
    if (ratio > 1.5) return { text: 'BULLISH', color: 'text-neon-emerald' };
    if (ratio < 0.5) return { text: 'BEARISH', color: 'text-neon-crimson' };
    if (ratio < 0.7) return { text: 'SLIGHTLY BEARISH', color: 'text-neon-crimson' };
    return { text: 'NEUTRAL', color: 'text-gray-400' };
  };

  const sentiment = getSentiment();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm text-gray-400 uppercase tracking-wider">
          Liquidation Map (24h)
        </h4>
        <div className={`text-sm font-bold ${sentiment.color}`}>
          {sentiment.text}
        </div>
      </div>

      {/* Liquidation Bars */}
      <div className="space-y-3">
        {/* Longs Liquidated */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Longs Liquidated</span>
            <span className="text-neon-crimson font-mono font-bold">
              {formatLiquidation(longLiquidations)}
            </span>
          </div>
          <div className="h-6 bg-terminal-border rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${longPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-neon-crimson to-neon-crimson/70 flex items-center justify-end pr-2"
            >
              {longPercent > 20 && (
                <span className="text-xs font-bold text-white">
                  {longPercent.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Shorts Liquidated */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Shorts Liquidated</span>
            <span className="text-neon-emerald font-mono font-bold">
              {formatLiquidation(shortLiquidations)}
            </span>
          </div>
          <div className="h-6 bg-terminal-border rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${shortPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-gradient-to-r from-neon-emerald to-neon-emerald/70 flex items-center justify-end pr-2"
            >
              {shortPercent > 20 && (
                <span className="text-xs font-bold text-white">
                  {shortPercent.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-terminal-border">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Liquidated:</span>
          <span className="text-white font-mono font-bold">
            {formatLiquidation(totalLiquidated)}
          </span>
        </div>
      </div>

      {/* Liquidation Ratio */}
      <div className="p-3 bg-terminal-accent/50 rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Liquidation Ratio:</span>
          <span className="text-sm font-bold text-neon-gold">
            {(shortLiquidations / (longLiquidations + 1)).toFixed(2)}x
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {shortLiquidations > longLiquidations 
            ? '📈 More shorts liquidated = Bullish pressure'
            : '📉 More longs liquidated = Bearish pressure'
          }
        </div>
      </div>

      {/* Squeeze Potential */}
      {shortLiquidations > longLiquidations * 1.5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-neon-emerald/10 border border-neon-emerald rounded"
        >
          <div className="flex items-center gap-2 text-neon-emerald text-sm font-bold">
            <span>⚡</span>
            <span>SHORT SQUEEZE POTENTIAL</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            High short liquidations may trigger cascade buying
          </div>
        </motion.div>
      )}

      {/* Liquidation Heatmap Preview */}
      <div className="pt-3 border-t border-terminal-border">
        <div className="text-xs text-gray-400 mb-2">Liquidation Zones:</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-neon-crimson/10 rounded text-center">
            <div className="text-xs text-gray-500">Above Price</div>
            <div className="text-sm font-mono text-neon-crimson">
              ${(currentPrice * 1.05).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Long stops</div>
          </div>
          <div className="p-2 bg-neon-emerald/10 rounded text-center">
            <div className="text-xs text-gray-500">Below Price</div>
            <div className="text-sm font-mono text-neon-emerald">
              ${(currentPrice * 0.95).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Short stops</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidationMap;
