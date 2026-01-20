'use client';

import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const TradingChart = ({ ticker, timeframe = '1h' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#0A0A0A' },
        textColor: '#E5E7EB',
      },
      grid: {
        vertLines: { color: '#1A1A1A' },
        horzLines: { color: '#1A1A1A' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1A1A1A',
      },
      timeScale: {
        borderColor: '#1A1A1A',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Fetch and set data
    fetchChartData(ticker, timeframe).then(({ candles, volumes }) => {
      candlestickSeries.setData(candles);
      volumeSeries.setData(volumes);
      chart.timeScale().fitContent();
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [ticker, timeframe]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden border border-terminal-border" />
      
      {/* Chart controls */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        <div className="bg-terminal-dark/90 backdrop-blur-sm px-3 py-1 rounded border border-terminal-border">
          <span className="text-xs text-gray-400 font-mono">{ticker}/USDT</span>
        </div>
        <div className="bg-terminal-dark/90 backdrop-blur-sm px-3 py-1 rounded border border-terminal-border">
          <span className="text-xs text-neon-emerald font-mono">{timeframe}</span>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-terminal-dark/90 backdrop-blur-sm px-3 py-1 rounded border border-terminal-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
          <span className="text-xs text-gray-400 font-mono">LIVE</span>
        </div>
      </div>
    </div>
  );
};

// Fetch chart data (mock - replace with real API)
async function fetchChartData(ticker, timeframe) {
  // In production, fetch from Binance API
  // For now, generate sample data
  const candles = [];
  const volumes = [];
  const now = Date.now() / 1000;
  const interval = timeframe === '15m' ? 900 : timeframe === '1h' ? 3600 : timeframe === '4h' ? 14400 : 86400;
  
  let basePrice = 100 + Math.random() * 100;
  
  for (let i = 100; i >= 0; i--) {
    const time = now - (i * interval);
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 5;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    
    candles.push({
      time: Math.floor(time),
      open,
      high,
      low,
      close,
    });
    
    volumes.push({
      time: Math.floor(time),
      value: Math.random() * 1000000,
      color: close > open ? '#10B98180' : '#EF444480',
    });
    
    basePrice = close;
  }
  
  return { candles, volumes };
}

export default TradingChart;
