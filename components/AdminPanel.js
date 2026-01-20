'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../lib/store';

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [bulkTickers, setBulkTickers] = useState('');
  const [singleTicker, setSingleTicker] = useState('');
  const [probability, setProbability] = useState(50);
  const [grade, setGrade] = useState('B');
  const [notes, setNotes] = useState('');
  
  const { 
    isAdminAuthenticated, 
    setAdminAuthenticated, 
    addCoin, 
    addBulkCoins 
  } = useStore();

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'crypto2024';

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setShowPasswordPrompt(false);
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleBulkAdd = () => {
    if (bulkTickers.trim()) {
      addBulkCoins(bulkTickers);
      setBulkTickers('');
      alert('Coins added successfully!');
    }
  };

  const handleSingleAdd = () => {
    if (singleTicker.trim()) {
      addCoin(singleTicker, probability, grade, notes);
      setSingleTicker('');
      setNotes('');
      setProbability(50);
      setGrade('B');
      alert(`${singleTicker} added successfully!`);
    }
  };

  const handleButtonClick = () => {
    if (!isAdminAuthenticated) {
      setShowPasswordPrompt(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Floating Admin Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleButtonClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-neon-emerald hover:bg-neon-emerald/80 rounded-full shadow-lg shadow-neon-emerald/50 flex items-center justify-center text-terminal-black text-2xl font-bold transition-all"
        title="Admin Console"
      >
        <span className={isOpen ? '×' : '+'}>
          {isOpen ? '×' : '+'}
        </span>
      </motion.button>

      {/* Password Prompt */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordPrompt(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-terminal-dark border-2 border-neon-emerald rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-display font-bold text-white mb-4">
                Admin Access Required
              </h3>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-terminal-accent border border-terminal-border rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-neon-emerald hover:bg-neon-emerald/80 text-terminal-black font-bold rounded transition-colors"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordPrompt(false)}
                    className="px-6 py-3 bg-terminal-accent hover:bg-terminal-border text-gray-300 font-bold rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {isOpen && isAdminAuthenticated && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-6 bottom-24 z-40 w-96 max-h-[80vh] bg-terminal-dark border-2 border-neon-emerald rounded-lg shadow-2xl shadow-neon-emerald/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neon-emerald/10 to-transparent p-4 border-b border-terminal-border">
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span className="text-neon-emerald">⚡</span>
                Admin Console
              </h3>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-6">
              {/* Bulk Add Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Bulk Ticker Intake
                </label>
                <textarea
                  value={bulkTickers}
                  onChange={(e) => setBulkTickers(e.target.value)}
                  placeholder="BTC, ETH, SOL, ARB, MATIC..."
                  className="w-full h-24 bg-terminal-accent border border-terminal-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald resize-none font-mono"
                />
                <button
                  onClick={handleBulkAdd}
                  disabled={!bulkTickers.trim()}
                  className="w-full mt-2 py-2 bg-neon-emerald/20 hover:bg-neon-emerald/30 text-neon-emerald font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Bulk Tickers
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-terminal-border" />

              {/* Single Add Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Add Single Coin (Advanced)
                </label>
                
                <input
                  type="text"
                  value={singleTicker}
                  onChange={(e) => setSingleTicker(e.target.value.toUpperCase())}
                  placeholder="Ticker (e.g., BTC)"
                  className="w-full bg-terminal-accent border border-terminal-border rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald mb-3"
                />

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Probability Score</span>
                    <span className="text-neon-emerald font-bold">{probability}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(parseInt(e.target.value))}
                    className="w-full h-2 bg-terminal-border rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-gray-400 mb-2">Setup Grade</label>
                  <div className="flex gap-2">
                    {['A', 'B', 'C'].map(g => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`flex-1 py-2 rounded font-bold transition-all ${
                          grade === g
                            ? g === 'A' ? 'bg-neon-gold text-terminal-black'
                            : g === 'B' ? 'bg-neon-emerald text-terminal-black'
                            : 'bg-neon-blue text-terminal-black'
                            : 'bg-terminal-accent text-gray-400 hover:bg-terminal-border'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Research notes..."
                  className="w-full h-20 bg-terminal-accent border border-terminal-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald resize-none mb-3"
                />

                <button
                  onClick={handleSingleAdd}
                  disabled={!singleTicker.trim()}
                  className="w-full py-2 bg-neon-emerald hover:bg-neon-emerald/80 text-terminal-black font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Coin
                </button>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Quick Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (confirm('Lock admin console?')) {
                        setAdminAuthenticated(false);
                        setIsOpen(false);
                      }
                    }}
                    className="w-full py-2 bg-terminal-accent hover:bg-terminal-border text-gray-300 text-sm rounded transition-colors"
                  >
                    🔒 Lock Console
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPanel;
