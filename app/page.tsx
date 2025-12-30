"use client"

import React, { useState, useEffect } from 'react';

export default function App() {
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const checkWallet = () => {
    if(!address) return;
    setWalletData({
      address: address,
      reputaScore: Math.floor(Math.random() * 300) + 600,
      trustLevel: 'High',
      balance: (Math.random() * 1000).toFixed(2)
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden mt-10 border border-slate-100">
        <div className="bg-purple-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">R</div>
          <h1 className="text-xl font-bold">Reputa Score v2.5</h1>
        </div>

        <div className="p-8">
          {!walletData ? (
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Wallet Address</label>
              <input 
                type="text" 
                placeholder="G..." 
                className="w-full p-4 bg-slate-100 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none transition-all"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button 
                onClick={checkWallet}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition-all"
              >
                Check Reputation
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-purple-600" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * walletData.reputaScore / 1000)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{walletData.reputaScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold">SCORE</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Trust Level: <span className="text-green-500">{walletData.trustLevel}</span></h2>
                <p className="text-sm text-slate-500">Address: {walletData.address.substring(0,6)}...{walletData.address.substring(50)}</p>
              </div>
              <button onClick={() => setWalletData(null)} className="text-purple-600 font-bold text-sm">New Check</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
