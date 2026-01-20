'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../lib/store';

const TradeButton = ({ coin, signal, coinData }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { executeTrade, autoTradingEnabled, maxPositionSize } = useStore();

  const handleTrade = async () => {
    if (!signal || signal.type === 'HOLD') return;
    
    setExecuting(true);
    
    try {
      const trade = await executeTrade(coin.ticker, signal);
      
      // Show success notification
      setTimeout(() => {
        setExecuting(false);
        setShowConfirm(false);
      }, 1000);
      
    } catch (error) {
      console.error('Trade execution failed:', error);
      setExecuting(false);
    }
  };

  const getButtonColor = () => {
    if (!signal) return 'bg-gray-600 cursor-not-allowed';
    
    switch (signal.type) {
      case 'BUY':
        return signal.strength > 80 
          ? 'bg-neon-emerald hover:bg-neon-emerald/80' 
          : 'bg-neon-emerald/60 hover:bg-neon-emerald/70';
      case 'SELL':
        return 'bg-neon-crimson hover:bg-neon-crimson/80';
      default:
        return 'bg-gray-600 cursor-not-allowed';
    }
  };

  const getButtonText = () => {
    if (executing) return 'EXECUTING...';
    if (!signal) return 'NO SIGNAL';
    if (signal.type === 'HOLD') return 'HOLD';
    return `${signal.type} NOW`;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: signal && signal.type !== 'HOLD' ? 1.02 : 1 }}
        whileTap={{ scale: signal && signal.type !== 'HOLD' ? 0.98 : 1 }}
        onClick={() => signal && signal.type !== 'HOLD' && setShowConfirm(true)}
        disabled={!signal || signal.type === 'HOLD' || executing}
        className={`
          w-full py-3 rounded font-bold text-sm transition-all
          ${getButtonColor()}
          ${executing ? 'animate-pulse' : ''}
          text-terminal-black
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {getButtonText()}
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-terminal-dark border-2 border-neon-emerald rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-display font-bold text-white mb-4">
                Confirm Trade
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pair:</span>
                  <span className="text-white font-bold">{coin.ticker}/USDT</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className={`font-bold ${
                    signal.type === 'BUY' ? 'text-neon-emerald' : 'text-neon-crimson'
                  }`}>
                    {signal.type}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white font-mono">${signal.entry.toFixed(4)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Position Size:</span>
                  <span className="text-white font-mono">${maxPositionSize} USDT</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-neon-crimson font-mono">${signal.stopLoss.toFixed(4)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Take Profit:</span>
                  <span className="text-neon-emerald font-mono">${signal.takeProfit.toFixed(4)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Signal Strength:</span>
                  <span className="text-neon-gold font-bold">{signal.strength}%</span>
                </div>
              </div>
              
              {/* Reasons */}
              {signal.reasons && signal.reasons.length > 0 && (
                <div className="mb-6 p-3 bg-terminal-accent rounded">
                  <div className="text-xs text-gray-400 mb-2">Trade Reasons:</div>
                  <ul className="space-y-1">
                    {signal.reasons.map((reason, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-neon-emerald">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleTrade}
                  disabled={executing}
                  className={`
                    flex-1 py-3 rounded font-bold transition-all
                    ${signal.type === 'BUY' 
                      ? 'bg-neon-emerald hover:bg-neon-emerald/80' 
                      : 'bg-neon-crimson hover:bg-neon-crimson/80'
                    }
                    text-terminal-black
                    ${executing ? 'animate-pulse' : ''}
                  `}
                >
                  {executing ? 'EXECUTING...' : 'CONFIRM TRADE'}
                </button>
                
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={executing}
                  className="px-6 py-3 bg-terminal-accent hover:bg-terminal-border text-gray-300 font-bold rounded transition-colors"
                >
                  CANCEL
                </button>
              </div>
              
              {/* Warning */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                ⚠️ Trading involves risk. Only trade with funds you can afford to lose.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TradeButton;
