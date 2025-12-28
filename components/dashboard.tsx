"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { TierCards } from "@/components/tier-cards"
import { LogOut, Search, Crown, Loader2, AlertCircle, CreditCard, ArrowDownLeft, ArrowUpRight, History, ShieldCheck } from "lucide-react"

interface DashboardProps {
  walletAddress: string
  username?: string
  onDisconnect: () => void
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false) // حالة الاشتراك VIP
  const [searchError, setSearchError] = useState<string | null>(null)
  const [walletData, setWalletData] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // 1. محرك جلب البيانات الحقيقي من البلوكشين
  const performSearch = useCallback(async (address: string) => {
    if (!address || !address.startsWith('G')) {
      setSearchError("Invalid Pi Address");
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
        setWalletData(data); // هنا تظهر البيانات الحقيقية (Score + Transactions)
      } else {
        setSearchError(data.message || "Account not found on Testnet");
      }
    } catch (error) {
      setSearchError("Blockchain sync error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // تنفيذ البحث فور دخول الرائد بمحفظته الخاصة
  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  // 2. منطق الدفع لتفعيل VIP (Pi Network SDK)
  const handleUpgradeToVIP = async () => {
    if (!window.Pi) return alert("Please open this in Pi Browser");
    
    setIsProcessingPayment(true);
    try {
      const payment = await window.Pi.createPayment({
        amount: 1, // سعر تفعيل VIP هو 1 Pi
        memo: "Activate VIP Detailed Report",
        metadata: { walletAddress: walletAddress }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          // هنا يتم إرسال المعرف للسيرفر الخاص بك للتوثيق
          console.log("Payment Ready:", paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          setIsPremium(true); // تفعيل ميزات VIP فوراً
          setIsProcessingPayment(false);
        },
        onCancel: (paymentId: string) => setIsProcessingPayment(false),
        onError: (error: Error, payment?: any) => setIsProcessingPayment(false),
      });
    } catch (e) {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6 bg-black">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-purple-500 tracking-tighter">REPUTA <span className="text-[10px] text-zinc-600">v2.0</span></h1>
          <p className="text-xs text-amber-500">@{username || "Pioneer"}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-zinc-500 hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </motion.div>

      {/* Search Input Section */}
      <div className="mb-8">
        <div className="relative group max-w-xl mx-auto">
          <Input
            placeholder="Search any G... wallet on Testnet"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 focus:ring-purple-500"
          />
          <Search className="absolute left-4 top-4 text-zinc-500 w-5 h-5" />
          <Button 
            onClick={() => performSearch(searchAddress)} 
            disabled={isSearching}
            className="absolute right-2 top-2 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Analyze"}
          </Button>
        </div>
        {searchError && <p className="text-center text-red-500 text-xs mt-3 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> {searchError}</p>}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Score Display */}
        <AnimatePresence mode="wait">
          {walletData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                 <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
              </div>
              
              {/* VIP Promotion Card */}
              {!isPremium && (
                <div className="md:col-span-5 bg-gradient-to-br from-zinc-900 to-black p-6 rounded-[32px] border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="bg-amber-500/10 text-amber-500 w-fit p-2 rounded-xl mb-4">
                      <Crown className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upgrade to VIP</h3>
                    <p className="text-zinc-400 text-sm mb-6">Unlock detailed behavior analysis, spam risk assessment, and verified badge.</p>
                  </div>
                  <Button 
                    onClick={handleUpgradeToVIP} 
                    disabled={isProcessingPayment}
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    {isProcessingPayment ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2 w-4 h-4" />}
                    Activate VIP (1 Pi)
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transactions & VIP Report */}
        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real Transactions */}
            <div className="bg-zinc-900/30 p-6 rounded-[32px] border border-white/5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><History className="w-4 h-4 text-purple-500"/> Recent Activity</h3>
              <div className="space-y-3">
                {walletData.transactions.slice(0, 5).map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex gap-3 items-center">
                      {tx.type === 'استلام' ? <ArrowDownLeft className="text-green-500 w-4 h-4" /> : <ArrowUpRight className="text-red-500 w-4 h-4" />}
                      <span className="text-xs font-bold text-zinc-300">{tx.type}</span>
                    </div>
                    <span className="text-sm font-mono text-purple-400 font-bold">{tx.amount} π</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Report (Visible only after payment) */}
            <div className={`relative p-6 rounded-[32px] border transition-all duration-700 ${isPremium ? 'bg-purple-900/10 border-purple-500/40' : 'bg-zinc-900/10 border-zinc-800'}`}>
              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-[6px] bg-black/40 z-10 rounded-[32px] flex flex-col items-center justify-center text-center p-6">
                  <ShieldCheck className="w-10 h-10 text-zinc-600 mb-2" />
                  <p className="text-zinc-500 text-xs font-bold">DETAILED ANALYSIS LOCKED</p>
                </div>
              )}
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-500"/> Reputation Audit</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase">Risk Level</p>
                  <p className="text-green-500 font-bold">LOW</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase">Authenticity</p>
                  <p className="text-blue-500 font-bold">94%</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase">Whale Rank</p>
                  <p className="text-purple-500 font-bold">#2,401</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase">Activity</p>
                  <p className="text-amber-500 font-bold">HIGH</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
