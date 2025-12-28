"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LogOut, Search, Crown, Loader2, AlertCircle, 
  CreditCard, ArrowDownLeft, ArrowUpRight, History, ShieldCheck 
} from "lucide-react"

// تعريف الأنواع لضمان استقرار الكود
interface Transaction {
  id: string;
  type: string;
  amount: string;
  from: string;
  to: string;
  date: string;
}

interface WalletData {
  isValid: boolean;
  score: number;
  balance: string;
  transactions: Transaction[];
}

export function Dashboard({ walletAddress, username, onDisconnect }: any) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // محرك البحث الحقيقي المرتبط بالبلوكشين
  const performSearch = useCallback(async (addr: string) => {
    if (!addr || !addr.startsWith('G')) {
      setSearchError("Invalid Wallet Address");
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr }),
      });
      const data = await res.json();
      if (data.isValid) {
        setWalletData(data);
      } else {
        setSearchError(data.message || "Address not found");
      }
    } catch (e) {
      setSearchError("Sync error with Pi Network");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // تشغيل البحث التلقائي عند التحميل
  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  // منطق الدفع VIP مع حماية ضد أخطاء المتصفح
  const handlePayment = async () => {
    if (typeof window === "undefined" || !(window as any).Pi) {
      return alert("يرجى فتح التطبيق داخل متصفح Pi Browser لتفعيل الدفع");
    }
    
    setIsPaying(true);
    try {
      await (window as any).Pi.createPayment({
        amount: 1,
        memo: "Upgrade to VIP Report",
        metadata: { wallet: walletAddress }
      }, {
        onReadyForServerApproval: (id: string) => console.log("Approved"),
        onReadyForServerCompletion: (id: string, txid: string) => {
          setIsPremium(true);
          setIsPaying(false);
        },
        onCancel: () => setIsPaying(false),
        onError: () => setIsPaying(false)
      });
    } catch (e) {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center p-4 mb-6 border-b border-white/5">
        <h1 className="text-xl font-black text-purple-500 tracking-tighter">REPUTA</h1>
        <button onClick={onDisconnect} className="text-zinc-500 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <input 
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 px-12 outline-none focus:border-purple-500/50" 
            placeholder="Search G... wallet address"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-zinc-600" />
          <button 
            onClick={() => performSearch(searchAddress)}
            disabled={isSearching}
            className="absolute right-2 top-2 bg-purple-600 p-2 rounded-xl"
          >
            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>

        {/* Main View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Section */}
          <div className="bg-zinc-900 rounded-[32px] p-8 text-center border border-white/5">
            <p className="text-zinc-500 text-xs uppercase mb-2">Pi Reputation Score</p>
            <h2 className="text-7xl font-black">{walletData?.score || "--"}</h2>
            <p className="text-purple-400 font-bold mt-2 font-mono">{walletData?.balance || "0.00"} π</p>
            
            <button 
              onClick={handlePayment}
              disabled={isPremium || isPaying}
              className={`w-full mt-8 h-14 rounded-2xl font-bold transition-all ${isPremium ? 'bg-green-600' : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-500/20'}`}
            >
              {isPaying ? <Loader2 className="animate-spin mx-auto" /> : isPremium ? "VIP ACTIVE" : "UPGRADE TO VIP (1 π)"}
            </button>
          </div>

          {/* Activity Section */}
          <div className="bg-zinc-900/50 rounded-[32px] p-6 border border-white/5">
            <h3 className="text-xs font-bold text-zinc-500 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> RECENT BLOCKCHAIN ACTIVITY
            </h3>
            <div className="space-y-3">
              {walletData?.transactions.map((tx, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    {tx.type === 'استلام' ? <ArrowDownLeft className="text-green-500" size={16}/> : <ArrowUpRight className="text-red-500" size={16}/>}
                    <span className="text-[10px] font-bold">{tx.type}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400">{tx.amount} π</span>
                </div>
              ))}
              {!walletData && <p className="text-center text-zinc-700 py-10 italic">No data synced</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
