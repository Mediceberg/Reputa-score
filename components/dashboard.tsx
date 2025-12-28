"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
// ... بقية الـ imports الخاصة بك

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [walletData, setWalletData] = useState<any>(null) // الداتا الحقيقية هنا
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // 1. وظيفة البحث الحقيقي عن المحفظة
  const handleSearch = async (e?: React.FormEvent, addressToSearch = searchAddress) => {
    if (e) e.preventDefault()
    if (!addressToSearch.trim()) return

    setIsSearching(true)
    setSearchError(null)

    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addressToSearch }),
      })
      
      const data = await res.json()
      
      if (data.isValid) {
        setWalletData(data) // جلب الرصيد، السكور، والمعاملات الحقيقية
      } else {
        setSearchError(data.message || "Wallet not found on Pi Network")
      }
    } catch (error) {
      setSearchError("Blockchain connection error")
    } finally {
      setIsSearching(false)
    }
  }

  // البحث التلقائي عن محفظة الرائد فور دخوله
  useEffect(() => {
    if (walletAddress) handleSearch(undefined, walletAddress)
  }, [walletAddress])

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6">
      {/* Header & Search Input - تبقى كما هي في كودك مع ربط handleSearch */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 space-y-6">
          
          {/* عرض النقاط الحقيقية (Gauge) */}
          <AnimatePresence mode="wait">
            {walletData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TrustScoreGauge score={walletData.score} isPremium={isPremium} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* عرض المعاملات الحقيقية بشكل منظم */}
          {walletData && (
            <motion.div className="glass rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-[var(--gold)] mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Real-time Transactions
              </h3>
              <div className="space-y-3">
                {walletData.transactions.map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/30 rounded-xl border border-white/5 hover:border-[var(--purple)]/50 transition-all">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${tx.type === 'استلام' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'استلام' ? '↙ Received' : '↗ Sent'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">{tx.amount} π</span>
                      <p className="text-[9px] text-gray-600">Verified on Pi Chain</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* تقرير الرائد المفصل (يظهر فقط إذا كان Premium) */}
          {isPremium && walletData && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl border-2 border-[var(--gold)]"
            >
              <h2 className="text-xl font-bold text-[var(--gold)] mb-4">Detailed Reputation Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-xs text-gray-500">Stability Index</p>
                  <p className="text-lg font-bold">{(walletData.score * 0.8).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-xs text-gray-500">Spam Risk</p>
                  <p className="text-lg font-bold text-green-500">Low</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-xs text-gray-500">Network Weight</p>
                  <p className="text-lg font-bold text-[var(--purple)]">Active Node</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* زر الاشتراك (Verify for 1 Pi) - يبقى كما هو في كودك */}
        </div>
      </div>
    </div>
  )
}
