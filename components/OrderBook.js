'use client';

import { motion } from 'framer-motion';
import useStore from '../lib/store';

const OrderBook = ({ ticker, mini = false }) => {
  const { orderBooks } = useStore();
  const orderBook = orderBooks[ticker];

  if (!orderBook || (!orderBook.bids?.length && !orderBook.asks?.length)) {
    return (
      <div className="text-center py-4 text-xs text-gray-500">
        {mini ? 'Order book loading...' : 'Loading market depth...'}
      </div>
    );
  }

  const formatPrice = (price) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatQuantity = (qty) => {
    if (qty >= 1000) return `${(qty / 1000).toFixed(1)}K`;
    return qty.toFixed(2);
  };

  const maxBidQty = Math.max(...(orderBook.bids?.map(b => b.quantity) || [1]));
  const maxAskQty = Math.max(...(orderBook.asks?.map(a => a.quantity) || [1]));
  const maxQty = Math.max(maxBidQty, maxAskQty);

  const displayCount = mini ? 3 : 5;

  return (
    <div className={`${mini ? 'text-xs' : 'text-sm'} font-mono`}>
      {!mini && (
        <div className="mb-3 pb-2 border-b border-terminal-border">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider">Market Depth</h4>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Bids (Buy Orders) */}
        <div>
          {!mini && (
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              <span>Price</span>
              <span>Size</span>
            </div>
          )}
          <div className="space-y-0.5">
            {orderBook.bids?.slice(0, displayCount).map((bid, idx) => (
              <motion.div
                key={`bid-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-0 bg-neon-emerald/10 rounded"
                  style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
                />
                
                {/* Content */}
                <div className="relative flex justify-between px-2 py-1">
                  <span className="text-neon-emerald font-semibold tabular-nums">
                    {formatPrice(bid.price)}
                  </span>
                  <span className="text-gray-400 tabular-nums">
                    {formatQuantity(bid.quantity)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          {!mini && (
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              <span>Price</span>
              <span>Size</span>
            </div>
          )}
          <div className="space-y-0.5">
            {orderBook.asks?.slice(0, displayCount).reverse().map((ask, idx) => (
              <motion.div
                key={`ask-${idx}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-0 bg-neon-crimson/10 rounded"
                  style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
                />
                
                {/* Content */}
                <div className="relative flex justify-between px-2 py-1">
                  <span className="text-neon-crimson font-semibold tabular-nums">
                    {formatPrice(ask.price)}
                  </span>
                  <span className="text-gray-400 tabular-nums">
                    {formatQuantity(ask.quantity)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Spread indicator */}
      {orderBook.bids?.[0] && orderBook.asks?.[0] && !mini && (
        <div className="mt-3 pt-2 border-t border-terminal-border">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Spread:</span>
            <span className="text-gray-300">
              ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(6)}
              <span className="text-gray-600 ml-2">
                ({(((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100).toFixed(3)}%)
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBook;
