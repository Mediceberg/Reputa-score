"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LogOut, Search, Crown, Loader2, AlertCircle, 
  CreditCard, ArrowDownLeft, ArrowUpRight, History, ShieldCheck 
} from "lucide-react"

// تعريف دقيق للأنواع لمنع أخطاء TypeScript في GitHub
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
  stats?: {
    totalOps: number;
    accountAge: string;
  };
}

interface DashboardProps {
  walletAddress: string;
  username?: string;
  onDisconnect: () => void;
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // محرك البحث الحقيقي
  const performSearch = useCallback(async (addr: string) => {
    if (!addr || !addr.startsWith('G')) {
      setSearchError("Invalid Pi Address Format");
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
        setSearchError(data.message || "Account not found");
      }
    } catch (e) {
      setSearchError("Network Error: Could not sync with Pi Blockchain");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  // تفعيل الدفع الحقيقي عبر Pi SDK
  const handlePayment = async () => {
    const piWindow = window as any;
    if (!piWindow.Pi) return alert("Please use Pi Browser");
    
    setIsPaying(true);
    try {
      await piWindow.Pi.createPayment({
        amount: 1,
        memo: "Activate VIP Reputation Report",
        metadata: { user: username || "Pioneer" }
      }, {
        onReadyForServerApproval: (id: string) => console.log("Approved ID:", id),
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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-purple-500 tracking-tighter italic">REPUTA.IO</h1>
        <button onClick={onDisconnect} className="text-zinc-500 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Real Search Engine */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative group">
          <input 
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-12 outline-none focus:border-purple-500/50 transition-all text-sm" 
            placeholder="Search wallet (G...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-zinc-600 w-5 h-5" />
          <button 
            onClick={() => performSearch(searchAddress)}
            disabled={isSearching}
            className="absolute right-2 top-2 bg-purple-600 p-2 rounded-xl"
          >
            {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {searchError && <p className="text-red-500 text-[10px] mt-2 ml-2 animate-pulse">{searchError}</p>}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Score & Payment */}
        <div className="lg:col-span-5 space-y-6">
          {walletData && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-600 opacity-20"></div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Trust Score</p>
              <h2 className="text-8xl font-black text-white">{walletData.score}</h2>
              <p className="text-purple-400 font-bold mt-2 font-mono">{walletData.balance} π</p>
              
              <div className="mt-8">
                <Button 
                  onClick={handlePayment}
                  disabled={isPremium || isPaying}
                  className={`w-full h-14 rounded-2xl font-bold ${isPremium ? 'bg-green-600' : 'bg-amber-600 hover:bg-amber-500'}`}
                >
                  {isPaying ? <Loader2 className="animate-spin mr-2" /> : isPremium ? <ShieldCheck className="mr-2"/> : <Crown className="mr-2 w-5 h-5"/>}
                  {isPremium ? "VIP ACTIVE" : "UPGRADE TO VIP (1 π)"}
                </Button>
                {!isPremium && <p className="text-[9px] text-zinc-600 mt-2 italic">Upgrade to see full behavior analysis</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Transactions */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-900/10 border border-white/5 rounded-[40px] p-8">
            <h3 className="text-sm font-bold text-zinc-400 mb-6 flex items-center gap-2 tracking-widest uppercase">
              <History className="w-4 h-4 text-purple-500" /> Transaction History
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {walletData?.transactions.map((tx, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${tx.type === 'استلام' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'استلام' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tx.type}</p>
                      <p className="text-[10px] text-zinc-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">{tx.amount} π</p>
                    <p className="text-[9px] text-zinc-700 font-mono">ID: {tx.id}</p>
                  </div>
                </div>
              ))}
              {!walletData && <div className="text-center py-20 text-zinc-800 font-black italic">No Data Found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
