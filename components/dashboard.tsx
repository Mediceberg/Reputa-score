"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { LogOut, Search, Crown, Loader2, ShieldCheck, History, ArrowDownLeft, ArrowUpRight, Zap, Activity } from "lucide-react"

export function Dashboard({ walletAddress, username, onDisconnect }: any) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false) 
  const [walletData, setWalletData] = useState<any>(null)

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
    <div className="min-h-screen p-4 md:p-8 bg-black text-white selection:bg-purple-500/30">
      {/* Header المصغر والاحترافي */}
      <div className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase">Reputa <span className="text-purple-500">Analytics</span></h1>
            <p className="text-[10px] text-amber-500 font-mono italic">@{username || "Pioneer"}</p>
          </div>
        </div>
        <Button onClick={onDisconnect} variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
          <LogOut className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* القسم الأيسر: البحث والتحليل */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
            <Input 
              value={searchAddress} 
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter Wallet Address..." 
              className="h-14 bg-zinc-900/80 border-zinc-800 rounded-2xl pl-12 text-sm focus:ring-0 focus:border-purple-500 transition-all shadow-xl"
            />
            <Search className="absolute left-4 top-4.5 text-zinc-600 w-5 h-5" />
            <Button onClick={() => performSearch(searchAddress)} className="absolute right-2 top-2 h-10 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl px-5">
              {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify"}
            </Button>
          </div>

          {walletData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
            </motion.div>
          )}

          {/* قائمة المعاملات - المحدودة بـ 10 */}
          {walletData && (
            <div className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-500" /> Recent Activity
                </h3>
                <span className="text-[9px] bg-white/5 px-2 py-1 rounded-md text-zinc-500 font-mono">Limit: 10 Tx</span>
              </div>
              <div className="space-y-3">
                {walletData.transactions.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${tx.type === 'Received' ? 'bg-green-500/10' : 'bg-zinc-500/10'}`}>
                        {tx.type === 'Received' ? <ArrowDownLeft className="text-green-500 w-4 h-4" /> : <ArrowUpRight className="text-zinc-400 w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold group-hover:text-purple-400 transition-colors">{tx.type} <span className="text-zinc-600 font-normal">Pi Token</span></p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black tracking-tighter">{tx.amount} π</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* القسم الأيمن: التقرير الاحترافي والـ VIP */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-700 ${isPremium ? 'bg-purple-900/10 border-purple-500/30 shadow-2xl shadow-purple-500/5' : 'bg-zinc-900/30 border-zinc-800'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Audit Report
              </h3>
              {!isPremium && <Crown className="w-4 h-4 text-amber-500 animate-pulse" />}
            </div>

            <div className="space-y-6">
              {[
                { label: "Trust Level", val: "Verified", icon: ShieldCheck, color: "text-green-400" },
                { label: "Wallet Status", val: walletData?.stats?.accountAge || "Locked", icon: Activity, color: "text-blue-400" },
                { label: "Risk Score", val: "Minimal", icon: Zap, color: "text-purple-400" }
              ].map((item, id) => (
                <div key={id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{item.label}</span>
                  </div>
                  <span className={`text-[11px] font-black ${isPremium ? item.color : 'blur-md select-none opacity-20'}`}>{item.val}</span>
                </div>
              ))}
            </div>

            {!isPremium && (
              <Button 
                onClick={() => (window as any).onStartPayment()} 
                className="w-full mt-10 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black rounded-2xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
              >
                Upgrade to Pro Portfolio
              </Button>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
               <p className="text-[9px] text-zinc-600 font-medium">Blockchain Audit Protocol v2.4.1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
