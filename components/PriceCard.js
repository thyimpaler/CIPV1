'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../lib/store';
import { useCoinData } from '../lib/websocket';
import OrderBook from './OrderBook';
import Modal from './Modal';
import TradeButton from './TradeButton';

const PriceCard = ({ coin }) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { removeCoin, refreshCoin, fundingRates, liquidationData } = useStore();
  const coinData = useCoinData(coin.ticker);

  const gradeColors = {
    A: 'text-neon-gold border-neon-gold bg-neon-gold/10',
    B: 'text-neon-emerald border-neon-emerald bg-neon-emerald/10',
    C: 'text-neon-blue border-neon-blue bg-neon-blue/10',
  };

  const sectorColors = {
    L1: 'bg-neon-purple/10 text-neon-purple',
    L2: 'bg-neon-blue/10 text-neon-blue',
    DePIN: 'bg-neon-emerald/10 text-neon-emerald',
    Memes: 'bg-neon-gold/10 text-neon-gold',
    DeFi: 'bg-purple-500/10 text-purple-400',
    Gaming: 'bg-pink-500/10 text-pink-400',
    AI: 'bg-cyan-500/10 text-cyan-400',
    Stablecoin: 'bg-green-500/10 text-green-400',
    Other: 'bg-gray-500/10 text-gray-400',
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const getPriceColor = () => {
    if (!coinData) return 'text-gray-400';
    if (coinData.priceChangePercent24h > 0) return 'text-neon-emerald';
    if (coinData.priceChangePercent24h < 0) return 'text-neon-crimson';
    return 'text-gray-400';
  };

  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'text-neon-emerald';
    if (abs > 0.4) return 'text-neon-gold';
    return 'text-gray-400';
  };

  const getFundingColor = (rate) => {
    if (rate < -0.01) return 'text-neon-emerald'; // Bullish
    if (rate > 0.05) return 'text-neon-crimson'; // Overheated
    return 'text-gray-400';
  };

  const getSignalBadge = () => {
    if (!coinData?.signal) return null;
    
    const { type, strength } = coinData.signal;
    
    const colors = {
      BUY: strength > 80 ? 'bg-neon-emerald text-terminal-black' : 'bg-neon-emerald/60 text-white',
      SELL: 'bg-neon-crimson text-terminal-black',
      HOLD: 'bg-gray-600 text-gray-300',
    };
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${colors[type]} shadow-lg`}
      >
        {type} {strength}%
      </motion.div>
    );
  };

  const fundingRate = fundingRates[coin.ticker];
  const liqData = liquidationData[coin.ticker];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative bg-terminal-dark border border-terminal-border rounded-lg p-4 
          cursor-pointer transition-all duration-300 overflow-hidden
          ${isHovered ? 'border-neon-emerald shadow-lg shadow-neon-emerald/20' : ''}
        `}
        onClick={() => setShowModal(true)}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-emerald/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Signal Badge */}
        {getSignalBadge()}

        {/* Header */}
        <div className="relative flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-bold text-white">
                  {coin.ticker}
                  <span className="text-xs text-gray-500 ml-2">/USDT</span>
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded ${sectorColors[coin.sector] || sectorColors.Other}`}>
                  {coin.sector}
                </span>
              </div>
            </div>
          </div>
          
          {/* Auto Grade Badge */}
          <div className="flex flex-col items-end gap-1">
            <div className={`text-2xl font-bold border-2 rounded px-2 py-1 ${gradeColors[coin.setupGrade]}`}>
              {coin.setupGrade}
            </div>
            <div className="text-xs px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/40">
              AUTO
            </div>
          </div>
        </div>

        {/* Live Price */}
        {coinData ? (
          <>
            <div className="relative mb-3">
              <div className={`text-3xl font-mono font-bold tabular-nums ${getPriceColor()}`}>
                ${formatPrice(coinData.price)}
              </div>
              <div className={`text-sm font-mono tabular-nums ${getPriceColor()}`}>
                {coinData.priceChangePercent24h > 0 ? '▲' : '▼'} {Math.abs(coinData.priceChangePercent24h).toFixed(2)}%
                <span className="text-gray-500 ml-2">
                  {coinData.priceChange24h > 0 ? '+' : ''}{formatPrice(coinData.priceChange24h)}
                </span>
              </div>
            </div>

            {/* 24h Range */}
            <div className="relative mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>24h Low: ${formatPrice(coinData.low24h)}</span>
                <span>24h High: ${formatPrice(coinData.high24h)}</span>
              </div>
              <div className="relative h-1.5 bg-terminal-accent rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-neon-crimson via-neon-gold to-neon-emerald"
                  style={{
                    width: `${((coinData.price - coinData.low24h) / (coinData.high24h - coinData.low24h)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Distance to ATH */}
            <div className="relative mb-3 p-2 bg-terminal-accent/50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Distance to ATH:</span>
                <span className={`text-sm font-bold ${coinData.isNearATH ? 'text-neon-gold' : 'text-gray-300'}`}>
                  {coinData.distanceToATH.toFixed(2)}%
                  {coinData.isNearATH && <span className="ml-2 text-neon-gold">🔥</span>}
                </span>
              </div>
              <div className="mt-1 h-1 bg-terminal-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-gold transition-all duration-500"
                  style={{ width: `${Math.max(0, 100 - coinData.distanceToATH)}%` }}
                />
              </div>
            </div>

            {/* Volume & Funding Rate */}
            <div className="relative grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-terminal-accent/30 rounded p-2">
                <div className="text-gray-500">24h Volume</div>
                <div className="font-mono text-white">{formatVolume(coinData.quoteVolume)}</div>
              </div>
              <div className="bg-terminal-accent/30 rounded p-2">
                <div className="text-gray-500">Funding</div>
                <div className={`font-mono font-bold ${getFundingColor(fundingRate?.rate || 0)}`}>
                  {fundingRate ? `${(fundingRate.rate * 100).toFixed(3)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Liquidations */}
            {liqData && (
              <div className="relative mb-3 p-2 bg-terminal-accent/30 rounded">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Liquidations (24h)</span>
                  <span className="text-gray-400">{formatVolume(liqData.totalLiquidated)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-neon-crimson">
                    Longs: {formatVolume(liqData.longLiquidations)}
                  </div>
                  <div className="text-neon-emerald">
                    Shorts: {formatVolume(liqData.shortLiquidations)}
                  </div>
                </div>
              </div>
            )}

            {/* Correlations */}
            <div className="relative grid grid-cols-2 gap-2 mb-3">
              <div className="bg-terminal-accent/30 rounded p-2">
                <div className="text-xs text-gray-500">BTC β</div>
                <div className={`text-sm font-bold font-mono tabular-nums ${getCorrelationColor(coin.btcCorrelation)}`}>
                  {coin.btcCorrelation.toFixed(2)}
                </div>
              </div>
              <div className="bg-terminal-accent/30 rounded p-2">
                <div className="text-xs text-gray-500">ETH β</div>
                <div className={`text-sm font-bold font-mono tabular-nums ${getCorrelationColor(coin.ethCorrelation)}`}>
                  {coin.ethCorrelation.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Mini Order Book Preview */}
            {isHovered && coinData.orderBook && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <OrderBook ticker={coin.ticker} mini={true} />
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="shimmer h-20 rounded mb-2" />
            <div className="text-xs text-gray-500">Connecting to live data...</div>
          </div>
        )}

        {/* AI Probability Score */}
        <div className="relative mt-3 pt-3 border-t border-terminal-border">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">AI Probability:</span>
              <span className="text-xs px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/40">
                AUTO
              </span>
            </div>
            <span className="text-lg font-bold text-neon-emerald">{coin.probabilityScore.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-terminal-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-crimson via-neon-gold to-neon-emerald transition-all duration-500"
              style={{ width: `${coin.probabilityScore}%` }}
            />
          </div>
        </div>

        {/* Trade Button */}
        <div className="relative mt-3" onClick={(e) => e.stopPropagation()}>
          <TradeButton coin={coin} signal={coinData?.signal} coinData={coinData} />
        </div>

        {/* Action buttons */}
        <div className="relative flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshCoin(coin.ticker);
            }}
            className="flex-1 px-3 py-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue text-xs rounded transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove ${coin.ticker}?`)) {
                removeCoin(coin.ticker);
              }
            }}
            className="px-3 py-1.5 bg-neon-crimson/10 hover:bg-neon-crimson/20 text-neon-crimson text-xs rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Last updated timestamp */}
        <div className="relative mt-2 text-xs text-gray-600 text-right">
          Updated: {new Date(coin.lastUpdated).toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Full analysis modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        coin={coin}
        coinData={coinData}
      />
    </>
  );
};

export default PriceCard;
