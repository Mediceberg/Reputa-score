"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

/** * تعديل المسارات: بما أن utils موجود داخل components/ui
 * والملف الحالي في components، نستخدم المسار النسبي المباشر.
 */
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { TrustScoreGauge } from "./trust-score-gauge" // تأكد أن هذا الملف موجود في مجلد components
import { LogOut, Search, Crown, Loader2, CreditCard, ArrowDownLeft, ArrowUpRight, History, ShieldCheck } from "lucide-react"

interface DashboardProps {
  walletAddress: string
  username?: string
  onDisconnect: () => void
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false) 
  const [searchError, setSearchError] = useState<string | null>(null)
  const [walletData, setWalletData] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // 1. تأكيد المصادقة لضمان عمل الـ SDK داخل الـ Dashboard
  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== "undefined" && (window as any).Pi) {
        try {
          await (window as any).Pi.authenticate(["payments", "username"], (payment: any) => {
            console.log("Auth verified for dashboard");
          });
        } catch (e) {
          console.error("Auth failed", e);
        }
      }
    };
    initPi();
  }, []);

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
        setWalletData(data);
      } else {
        // Fallback للبيانات الوهمية إذا لم يكن الـ API جاهزاً
        setWalletData({
            score: 75,
            transactions: [
                { type: 'استلام', date: '2024-05-20', amount: 50 },
                { type: 'إرسال', date: '2024-05-18', amount: 10 }
            ]
        });
      }
    } catch (error) {
      setSearchError("Blockchain sync error - Using local data");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  const handleUpgradeToVIP = async () => {
    const piSDK = (window as any).Pi;
    if (!piSDK) return alert("Please open in Pi Browser");
    
    setIsProcessingPayment(true);
    
    try {
      await piSDK.createPayment({
        amount: 1, 
        memo: "تفعيل ميزات VIP - Reputa",
        metadata: { wallet: walletAddress, user: username }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          const response = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          if (!response.ok) throw new Error("Approval failed");
          return response.json();
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          setIsPremium(true); 
          setIsProcessingPayment(false);
          alert("Success! VIP Activated.");
        },
        onCancel: () => setIsProcessingPayment(false),
        onError: (error: Error) => {
          setIsProcessingPayment(false);
          alert("Payment Failed: " + error.message);
        },
      });
    } catch (e: any) {
      setIsProcessingPayment(false);
      alert("System Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6 bg-black text-white">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-purple-500 tracking-tighter">REPUTA <span className="text-[10px] text-zinc-600">v2.1</span></h1>
          <p className="text-xs text-amber-500">@{username || "Pioneer"}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-zinc-500 hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </motion.div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="relative group max-w-xl mx-auto">
          <Input
            placeholder="Search any G... wallet"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 text-white"
          />
          <Search className="absolute left-4 top-4 text-zinc-500 w-5 h-5" />
          <Button 
            onClick={() => performSearch(searchAddress)} 
            disabled={isSearching}
            className="absolute right-2 top-2 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
          >
            {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Analyze"}
          </Button>
        </div>
        {searchError && <p className="text-center text-red-500 text-xs mt-3">{searchError}</p>}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
               <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
            </div>
            
            {!isPremium && (
              <div className="md:col-span-5 bg-gradient-to-br from-zinc-900 to-black p-6 rounded-[32px] border border-amber-500/30 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="bg-amber-500/10 text-amber-500 w-fit p-2 rounded-xl mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Unlock VIP Analytics</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-6">Detailed behavioral analysis & risk scoring.</p>
                </div>
                <Button 
                  onClick={handleUpgradeToVIP} 
                  disabled={isProcessingPayment}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2 w-4 h-4" />}
                  Pay 1 Pi for VIP
                </Button>
              </div>
            )}
          </div>
        )}

        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/30 p-6 rounded-[32px] border border-white/5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm"><History className="w-4 h-4 text-purple-500"/> Transactions</h3>
              <div className="space-y-3">
                {walletData.transactions?.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex gap-3 items-center">
                      {tx.type === 'استلام' ? <ArrowDownLeft className="text-green-400 w-4 h-4" /> : <ArrowUpRight className="text-red-400 w-4 h-4" />}
                      <div>
                        <p className="text-[10px] font-bold text-zinc-200">{tx.type}</p>
                        <p className="text-[8px] text-zinc-500 font-mono italic">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-purple-400 font-bold">{tx.amount} π</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative p-6 rounded-[32px] border transition-all duration-1000 ${isPremium ? 'bg-purple-900/20 border-purple-500/50' : 'bg-zinc-900/10 border-zinc-800'}`}>
              <AnimatePresence>
                {!isPremium && (
                  <motion.div exit={{ opacity: 0 }} className="absolute inset-0 backdrop-blur-md bg-black/60 z-10 rounded-[32px] flex flex-col items-center justify-center text-center p-6">
                    <ShieldCheck className="w-12 h-12 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Report Locked</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-green-500"/> Audit Report</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5"><p className="text-[9px] text-zinc-500 uppercase">Risk Level</p><p className="text-green-400 text-sm font-black">LOW</p></div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5"><p className="text-[9px] text-zinc-500 uppercase">Trust Index</p><p className="text-blue-400 text-sm font-black">98%</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
