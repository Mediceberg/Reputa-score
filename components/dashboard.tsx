"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { LogOut, Search, Crown, Loader2, AlertCircle, CreditCard, ArrowDownLeft, ArrowUpRight, History, ShieldCheck, ExternalLink } from "lucide-react"

export function Dashboard({ walletAddress, username, onDisconnect }: any) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [isPaying, setIsPaying] = useState(false)

  // وظيفة البحث الحقيقي
  const performSearch = useCallback(async (addr: string) => {
    if (!addr.startsWith('G')) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: addr }),
      });
      const data = await res.json();
      if (data.isValid) setWalletData(data);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => { if (walletAddress) performSearch(walletAddress); }, [walletAddress, performSearch]);

  // --- تفعيل زر الدفع الحقيقي ---
  const handlePayment = async () => {
    if (!window.Pi) return alert("افتح التطبيق داخل Pi Browser");
    setIsPaying(true);
    try {
      const payment = await window.Pi.createPayment({
        amount: 1,
        memo: "تفعيل التقرير المفصل VIP",
        metadata: { user: username }
      }, {
        onReadyForServerApproval: (id: string) => console.log("Approved:", id),
        onReadyForServerCompletion: (id: string, txid: string) => {
          setIsPremium(true);
          setIsPaying(false);
          alert("تم تفعيل ميزات VIP بنجاح!");
        },
        onCancel: () => setIsPaying(false),
        onError: () => setIsPaying(false)
      });
    } catch (e) { setIsPaying(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Search Bar - المحرك الفعال */}
      <div className="max-w-2xl mx-auto mb-10 flex gap-2 p-2 bg-zinc-900 rounded-2xl border border-white/10">
        <Search className="ml-3 mt-2.5 text-zinc-500" />
        <input 
          className="bg-transparent flex-1 outline-none text-sm" 
          placeholder="ابحث عن محفظة أخرى لتحليل سمعتها..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <Button onClick={() => performSearch(searchAddress)} disabled={isSearching} className="bg-purple-600 rounded-xl h-9 px-6">
          {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "تحليل"}
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Score & VIP Button */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence>
            {walletData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
                
                <div className="mt-6 p-6 bg-gradient-to-br from-zinc-900 to-black rounded-[32px] border border-amber-500/20">
                  <h3 className="flex items-center gap-2 font-bold text-amber-500 mb-2">
                    <Crown className="w-5 h-5" /> اشتراك VIP
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">احصل على تحليل كامل لمخاطر المحفظة وتوثيق السمعة مقابل 1 باي فقط.</p>
                  <Button 
                    onClick={handlePayment} 
                    disabled={isPaying || isPremium}
                    className={`w-full h-14 rounded-2xl font-bold transition-all ${isPremium ? 'bg-green-600 cursor-default' : 'bg-amber-600 hover:bg-amber-500'}`}
                  >
                    {isPaying ? <Loader2 className="animate-spin mr-2" /> : isPremium ? <ShieldCheck className="mr-2"/> : <CreditCard className="mr-2"/>}
                    {isPremium ? "أنت مشترك VIP بالفعل" : "تفعيل VIP الآن (1 π)"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Detailed Transactions */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-900/50 rounded-[32px] p-6 border border-white/5 h-full">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><History className="text-purple-500"/> سجل المعاملات التفصيلي</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {walletData?.transactions.map((tx: any, i: number) => (
                <div key={i} className="group p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'استلام' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.type === 'استلام' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.type}</p>
                        <p className="text-[10px] text-zinc-500">{tx.date}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-purple-400">{tx.amount} π</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>من: {tx.from.substring(0, 15)}...</span>
                    <span>إلى: {tx.to.substring(0, 15)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
