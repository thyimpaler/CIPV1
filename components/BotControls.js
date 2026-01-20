'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../lib/store';

const BotControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    autoTradingEnabled,
    riskLevel,
    maxPositionSize,
    stopLossPercent,
    takeProfitPercent,
    botStatus,
    toggleAutoTrading,
    setRiskLevel,
    setMaxPositionSize,
    setStopLoss,
    setTakeProfit,
  } = useStore();

  const riskPresets = {
    low: {
      stopLoss: 3,
      takeProfit: 10,
      maxPosition: 500,
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/10',
      borderColor: 'border-neon-blue',
    },
    medium: {
      stopLoss: 5,
      takeProfit: 15,
      maxPosition: 1000,
      color: 'text-neon-gold',
      bgColor: 'bg-neon-gold/10',
      borderColor: 'border-neon-gold',
    },
    high: {
      stopLoss: 8,
      takeProfit: 25,
      maxPosition: 2000,
      color: 'text-neon-crimson',
      bgColor: 'bg-neon-crimson/10',
      borderColor: 'border-neon-crimson',
    },
  };

  const applyRiskPreset = (level) => {
    const preset = riskPresets[level];
    setRiskLevel(level);
    setStopLoss(preset.stopLoss);
    setTakeProfit(preset.takeProfit);
    setMaxPositionSize(preset.maxPosition);
  };

  const getBotStatusColor = () => {
    switch (botStatus) {
      case 'scanning': return 'text-neon-blue';
      case 'executing': return 'text-neon-gold';
      case 'monitoring': return 'text-neon-emerald';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      {/* Bot Status Indicator */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-24 right-6 z-40 px-4 py-3 rounded-lg
          border-2 shadow-lg transition-all
          ${autoTradingEnabled 
            ? 'bg-neon-emerald/20 border-neon-emerald' 
            : 'bg-terminal-dark border-terminal-border'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            autoTradingEnabled ? 'bg-neon-emerald animate-pulse' : 'bg-gray-600'
          }`} />
          <div className="text-left">
            <div className="text-xs text-gray-400">Trading Bot</div>
            <div className={`text-sm font-bold ${
              autoTradingEnabled ? 'text-neon-emerald' : 'text-gray-500'
            }`}>
              {autoTradingEnabled ? 'ACTIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>
      </motion.button>

      {/* Bot Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-6 bottom-40 z-40 w-96 max-h-[70vh] bg-terminal-dark border-2 border-neon-emerald rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neon-emerald/10 to-transparent p-4 border-b border-terminal-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-white">
                    Trading Bot
                  </h3>
                  <div className={`text-xs mt-1 ${getBotStatusColor()}`}>
                    Status: {botStatus.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-4 space-y-4">
              {/* Power Toggle */}
              <div className="p-4 bg-terminal-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 font-semibold">
                    Auto-Trading
                  </span>
                  <button
                    onClick={toggleAutoTrading}
                    className={`
                      relative w-14 h-7 rounded-full transition-colors
                      ${autoTradingEnabled ? 'bg-neon-emerald' : 'bg-gray-600'}
                    `}
                  >
                    <div className={`
                      absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform
                      ${autoTradingEnabled ? 'translate-x-7' : 'translate-x-0'}
                    `} />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {autoTradingEnabled 
                    ? 'Bot will automatically execute high-probability trades'
                    : 'Enable to allow automated trade execution'
                  }
                </div>
              </div>

              {/* Risk Level Presets */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Risk Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(riskPresets).map(([level, preset]) => (
                    <button
                      key={level}
                      onClick={() => applyRiskPreset(level)}
                      className={`
                        py-2 px-3 rounded border-2 transition-all
                        ${riskLevel === level 
                          ? `${preset.bgColor} ${preset.borderColor} ${preset.color}` 
                          : 'bg-terminal-accent border-terminal-border text-gray-400 hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="text-xs font-bold uppercase">{level}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Size */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Position Size</span>
                  <span className="text-white font-mono">${maxPositionSize} USDT</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={maxPositionSize}
                  onChange={(e) => setMaxPositionSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-terminal-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>$100</span>
                  <span>$5000</span>
                </div>
              </div>

              {/* Stop Loss */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Stop Loss</span>
                  <span className="text-neon-crimson font-mono">{stopLossPercent}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={stopLossPercent}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                  className="w-full h-2 bg-terminal-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Take Profit */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Take Profit</span>
                  <span className="text-neon-emerald font-mono">{takeProfitPercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={takeProfitPercent}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                  className="w-full h-2 bg-terminal-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Risk/Reward Ratio */}
              <div className="p-3 bg-terminal-accent/50 rounded">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Risk/Reward Ratio:</span>
                  <span className="text-neon-gold font-bold">
                    1:{(takeProfitPercent / stopLossPercent).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trading Rules */}
              <div className="p-3 bg-terminal-accent/30 rounded">
                <div className="text-xs text-gray-400 mb-2">Auto-Trading Rules:</div>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>✓ Only Grade A setups</li>
                  <li>✓ Probability &gt; 80%</li>
                  <li>✓ BUY signals only</li>
                  <li>✓ Max 3 concurrent trades</li>
                  <li>✓ Auto stop-loss/take-profit</li>
                </ul>
              </div>

              {/* Warning */}
              {autoTradingEnabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-neon-gold/10 border border-neon-gold rounded"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-neon-gold text-lg">⚠️</span>
                    <div className="text-xs text-gray-300">
                      <div className="font-bold text-neon-gold mb-1">Auto-Trading Active</div>
                      Bot will execute trades automatically based on signals. Monitor positions regularly.
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BotControls;
