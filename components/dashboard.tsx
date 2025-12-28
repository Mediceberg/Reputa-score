"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { TierCards } from "@/components/tier-cards"
import { TransactionChart } from "@/components/transaction-chart"
import { Sandbox } from "@/components/sandbox"
import { LogOut, Settings, Search, Crown, Loader2, AlertCircle, CreditCard, ArrowDownLeft, ArrowUpRight, History } from "lucide-react"

interface DashboardProps {
  walletAddress: string
  username?: string
  onDisconnect: () => void
  onPay?: () => void 
}

export function Dashboard({ walletAddress, username, onDisconnect, onPay }: DashboardProps) {
  const [showSandbox, setShowSandbox] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [walletData, setWalletData] = useState<any>(null)

  // 1. محرك البحث الحقيقي المرتبط بـ API الخاص بك
  const performSearch = useCallback(async (address: string) => {
    if (!address.startsWith('G')) {
      setSearchError("Please enter a valid Pi wallet address");
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
        setSearchError(data.message || "Wallet not found");
      }
    } catch (error) {
      setSearchError("Connection to Pi Blockchain failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // البحث التلقائي عن محفظة الرائد المسجل فور الدخول
  useEffect(() => {
    if (walletAddress) performSearch(walletAddress);
  }, [walletAddress, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchAddress);
  }

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6">
      {/* Header -保持原样 */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-amber-500 bg-clip-text text-transparent">REPUTA</h1>
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-600 text-[10px] font-bold text-white shadow-glow">
                <Crown className="w-3 h-3" /> PREMIUM
              </span>
            )}
          </div>
          {username && <p className="text-sm text-amber-500 font-medium">@{username}</p>}
          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">{walletAddress}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onPay} className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs">
            <CreditCard className="w-3 h-3 mr-2" /> Pi Pay
          </Button>
          <Button variant="outline" size="icon" onClick={onDisconnect} className="border-white/10 hover:bg-red-500/10"><LogOut className="w-4 h-4" /></Button>
        </div>
      </motion.div>

      {/* Search Section - المحرك الحقيقي */}
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <form onSubmit={handleSearchSubmit} className="glass rounded-2xl p-4 border border-white/5">
          <div className="flex gap-2">
            <Input
              placeholder="Paste any G... wallet address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="bg-black/20 border-white/10 focus:border-purple-500"
            />
            <Button type="submit" disabled={isSearching} className="bg-purple-600">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {searchError && <div className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{searchError}</div>}
        </form>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-6">
          
          {/* Gauge - عرض السكور الحقيقي */}
          <AnimatePresence mode="wait">
            {walletData && (
              <motion.div key={walletData.score} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real Transactions List - عرض المعاملات الحقيقية */}
          {walletData && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass rounded-2xl p-6 border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 font-bold text-lg"><History className="text-purple-500 w-5 h-5" /> Transactions History</h3>
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">On-Chain Verified</span>
              </div>
              <div className="space-y-3">
                {walletData.transactions.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'استلام' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.type === 'استلام' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-purple-400">{tx.amount} π</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Premium Detailed Report */}
          {isPremium && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-amber-900/20 border border-amber-500/30">
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2"><Crown className="w-4 h-4"/> Advanced Analytics Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-[10px] text-gray-400">Activity Rank</p>
                    <p className="font-bold text-sm">Top 5%</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-[10px] text-gray-400">Risk Factor</p>
                    <p className="font-bold text-sm text-green-500">Low</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-[10px] text-gray-400">Wallet Age</p>
                    <p className="font-bold text-sm">Verified</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-[10px] text-gray-400">DEX Score</p>
                    <p className="font-bold text-sm">88/100</p>
                  </div>
                </div>
             </motion.div>
          )}

          <TierCards currentScore={walletData?.score || 0} />
        </div>
      </div>
    </div>
  )
}
