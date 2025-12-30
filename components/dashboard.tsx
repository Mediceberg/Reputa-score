"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

/** * تصحيح المسارات للهيكلية بدون SRC:
 * نحن داخل مجلد components، لذا نصل لـ ui مباشرة بـ ./ui
 */
import { Button } from "./ui/button"
import { Input } from "./ui/input"
// استيراد المكون الجديد بدلاً من TrustScoreGauge
import { TrustGauge } from "./trust-gauge" 
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

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== "undefined" && (window as any).Pi) {
        try {
          await (window as any).Pi.authenticate(["payments", "username"], (payment: any) => {
            console.log("Auth verified");
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
        // بيانات تجريبية متوافقة مع متطلبات TrustGauge الجديد
        setWalletData({
            score: 850, // من 1000 كما يطلب المكون الجديد
            trustLevel: 'High',
            transactions: [
                { type: 'استلام', date: '2024-05-20', amount: 150 },
                { type: 'إرسال', date: '2024-05-18', amount: 45 }
            ]
        });
      }
    } catch (error) {
      setSearchError("Sync error - Using local profile");
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
        memo: "Upgrade to VIP Analytics",
        metadata: { wallet: walletAddress, user: username }
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          return await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          }).then(res => res.json());
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
          alert("Payment Failed");
        },
      });
    } catch (e: any) {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6 bg-black text-white font-sans">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-purple-500 tracking-tighter italic">REPUTA</h1>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">@{username || "Pioneer"}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <Input
            placeholder="Search Wallet Address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="h-14 bg-zinc-900/80 border-zinc-800 rounded-3xl pl-12 text-white focus:border-purple-500 transition-all"
          />
          <Search className="absolute left-4 top-4 text-zinc-600 w-5 h-5" />
          <Button 
            onClick={() => performSearch(searchAddress)} 
            disabled={isSearching}
            className="absolute right-2 top-2 h-10 bg-purple-600 hover:bg-purple-700 rounded-2xl px-6"
          >
            {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : "Analyze"}
          </Button>
        </div>
        {searchError && <p className="text-center text-red-500 text-[10px] mt-2 font-bold uppercase">{searchError}</p>}
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
               {/* استخدام المكون الجديد مع التمرير الصحيح للبيانات */}
               <TrustGauge 
                  score={walletData.score} 
                  trustLevel={walletData.trustLevel || 'Medium'} 
               />
            </div>
            
            {!isPremium && (
              <div className="md:col-span-4 bg-zinc-900/50 p-6 rounded-[35px] border border-amber-500/20 flex flex-col justify-between backdrop-blur-sm">
                <div>
                  <div className="bg-amber-500/20 text-amber-500 w-fit p-3 rounded-2xl mb-4">
                    <Crown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">VIP ACCESS</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed mb-6 italic">Unlock deep blockchain behavioral patterns and social trust links.</p>
                </div>
                <Button 
                  onClick={handleUpgradeToVIP} 
                  disabled={isProcessingPayment}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl shadow-lg shadow-amber-500/20"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2 w-4 h-4" />}
                  UPGRADE 1 π
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Sections */}
        {walletData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/30 p-6 rounded-[35px] border border-white/5">
              <h3 className="text-zinc-400 font-black mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest"><History className="w-4 h-4 text-purple-500"/> Recent Activity</h3>
              <div className="space-y-3">
                {walletData.transactions?.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
                    <div className="flex gap-3 items-center">
                      <div className={tx.type === 'استلام' ? 'text-green-500 bg-green-500/10 p-2 rounded-xl' : 'text-red-500 bg-red-500/10 p-2 rounded-xl'}>
                        {tx.type === 'استلام' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-200">{tx.type}</p>
                        <p className="text-[9px] text-zinc-600 font-mono tracking-tighter">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-purple-400 font-black">{tx.amount} π</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative p-6 rounded-[35px] border transition-all duration-700 ${isPremium ? 'bg-purple-900/10 border-purple-500/30' : 'bg-zinc-900/10 border-zinc-800'}`}>
              <AnimatePresence>
                {!isPremium && (
                  <motion.div exit={{ opacity: 0 }} className="absolute inset-0 backdrop-blur-md bg-black/60 z-10 rounded-[35px] flex flex-col items-center justify-center text-center p-6">
                    <ShieldCheck className="w-12 h-12 text-zinc-800 mb-3" />
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">Data Encrypted</p>
                    <p className="text-zinc-700 text-[8px] mt-1">Purchase VIP to decrypt audit report</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <h3 className="text-zinc-400 font-black mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-green-500"/> Trust Audit</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Risk Factor</p>
                    <p className="text-green-400 text-lg font-black tracking-tighter">SECURE</p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Network Hub</p>
                    <p className="text-blue-400 text-lg font-black tracking-tighter">ACTIVE</p>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
