"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { 
  LogOut, Search, Crown, Loader2, CreditCard, 
  ArrowDownLeft, ArrowUpRight, History, ShieldCheck, Zap, Activity
} from "lucide-react"

export function Dashboard({ walletAddress, username, onDisconnect }: any) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false) 
  const [walletData, setWalletData] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // طلب الصلاحيات فور الدخول للتأكد من عمل الـ SDK
  useEffect(() => {
    if ((window as any).Pi) {
      (window as any).Pi.authenticate(["payments", "username"], () => {});
    }
  }, []);

  const performSearch = useCallback(async (address: string) => {
    if (!address.startsWith('G')) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.isValid) setWalletData(data);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => { if (walletAddress) performSearch(walletAddress); }, [walletAddress, performSearch]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#030303] text-zinc-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div>
          <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500 fill-purple-500" /> REPUTA PRO
          </h1>
          <p className="text-[10px] text-amber-500 font-mono italic">@{username || "Pioneer"}</p>
        </div>
        <Button onClick={onDisconnect} variant="ghost" className="text-zinc-500 hover:text-red-400">
          <LogOut className="w-4 h-4 mr-2" /> Exit
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search */}
          <div className="relative group">
             <Input 
               value={searchAddress} 
               onChange={(e) => setSearchAddress(e.target.value)}
               placeholder="Enter Wallet G..." 
               className="h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 shadow-2xl transition-all focus:border-purple-500"
             />
             <Search className="absolute left-4 top-4 text-zinc-600 w-5 h-5" />
             <Button onClick={() => performSearch(searchAddress)} className="absolute right-2 top-2 h-10 bg-purple-600">
                {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify"}
             </Button>
          </div>

          {walletData && (
            <>
              <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
              
              {/* Transactions List - 10 ONLY & NON-ZERO */}
              <div className="bg-zinc-900/30 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><History className="w-4 h-4 text-purple-400" /> Recent Transactions</h3>
                <div className="space-y-2">
                  {walletData.transactions.map((tx: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        {tx.type === 'Received' ? <ArrowDownLeft className="text-green-500 w-4 h-4" /> : <ArrowUpRight className="text-zinc-500 w-4 h-4" />}
                        <div>
                          <p className="text-[11px] font-bold">{tx.type} <span className="text-zinc-500 font-normal">({tx.tokenName})</span></p>
                          <p className="text-[9px] text-zinc-600 font-mono">{tx.date}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-purple-400">{tx.amount} π</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Audit & VIP */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 rounded-[32px] border transition-all duration-1000 ${isPremium ? 'bg-purple-900/10 border-purple-500/30 shadow-2xl shadow-purple-500/5' : 'bg-zinc-900/20 border-zinc-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" /> Audit Report</h3>
              {!isPremium && <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase font-black">Locked</span>}
            </div>

            <div className="space-y-4">
               {[
                 { label: "Risk Analysis", val: "LOW", color: "text-green-400" },
                 { label: "Account Age", val: walletData?.stats?.accountAge || "N/A", color: "text-blue-400" },
                 { label: "Activity Level", val: "HIGH", color: "text-purple-400" }
               ].map((item, id) => (
                 <div key={id} className="relative group overflow-hidden">
                    <div className="flex justify-between items-end pb-1 border-b border-white/5">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</span>
                       <span className={`text-xs font-black ${isPremium ? item.color : 'blur-sm select-none'}`}>{item.val}</span>
                    </div>
                 </div>
               ))}
            </div>

            {!isPremium && (
              <Button 
                onClick={() => {(window as any).onStartPayment()}}
                className="w-full mt-8 h-12 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black rounded-2xl group hover:scale-[1.02] transition-transform"
              >
                <Crown className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Upgrade for 1 Pi
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
