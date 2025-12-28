"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LogOut, Search, Crown, Loader2, AlertCircle, 
  CreditCard, ArrowDownLeft, ArrowUpRight, History, Activity
} from "lucide-react"

// تعريف واجهة البيانات لضمان عدم وجود أخطاء TypeScript في GitHub
interface DashboardProps {
  walletAddress: string
  username?: string
  onDisconnect: () => void
  onPay?: () => void 
}

export function Dashboard({ walletAddress, username, onDisconnect, onPay }: DashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // محرك البحث الحقيقي المرتبط بالـ API الخاص بك
  const performSearch = useCallback(async (address: string) => {
    if (!address || !address.startsWith('G')) {
      setSearchError("Please enter a valid Pi wallet address (Starting with G)");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      const data = await res.json();
      
      if (data.isValid) {
        setWalletData(data);
      } else {
        setSearchError(data.message || "Wallet not found on Pi Network");
      }
    } catch (error) {
      setSearchError("Blockchain connection failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // تنفيذ البحث التلقائي عند الدخول
  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center mb-8 bg-zinc-900/40 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-purple-500">REPUTA</h1>
            {isPremium && (
              <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> PREMIUM
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-mono opacity-70">{walletAddress.substring(0, 20)}...</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={onPay} className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> 1 Pi
          </button>
          <button onClick={onDisconnect} className="bg-zinc-800 hover:bg-red-500/20 p-2 rounded-xl border border-white/5 transition-colors text-zinc-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Search Bar */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative group">
          <input 
            type="text"
            placeholder="Search Wallet Address (G...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-purple-500/50 transition-all text-sm"
          />
          <button 
            onClick={() => performSearch(searchAddress)}
            disabled={isSearching}
            className="absolute right-3 top-3 bg-purple-600 hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {searchError && <p className="text-red-500 text-[11px] mt-2 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {searchError}</p>}
      </div>

      {/* 3. Main Data View */}
      <AnimatePresence mode="wait">
        {walletData ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Score Card */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 text-center flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
              <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-4">Reputation Score</p>
              <h2 className="text-8xl font-black text-white drop-shadow-2xl">{walletData.score}</h2>
              <div className="mt-6 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-purple-400 text-xs font-bold">
                <Activity className="w-3 h-3" /> Active Pioneer
              </div>
            </div>

            {/* Transactions View */}
            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-8">
              <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2">
                <History className="w-4 h-4" /> Live Transactions
              </h3>
              <div className="space-y-3">
                {walletData.transactions.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/[0.03]">
                    <div className="flex items-center gap-3">
                      {tx.type === 'استلام' ? 
                        <div className="bg-green-500/10 p-2 rounded-lg text-green-500"><ArrowDownLeft className="w-4 h-4" /></div> : 
                        <div className="bg-red-500/10 p-2 rounded-lg text-red-500"><ArrowUpRight className="w-4 h-4" /></div>
                      }
                      <span className="text-xs font-bold">{tx.type}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-purple-400">{tx.amount} π</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-zinc-700 uppercase tracking-widest text-xs animate-pulse">
            Waiting for blockchain data...
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
