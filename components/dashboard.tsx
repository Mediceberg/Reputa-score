"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { TierCards } from "@/components/tier-cards"
import { TransactionChart } from "@/components/transaction-chart"
import { Sandbox } from "@/components/sandbox"
import { LogOut, Settings, Search, Crown, Loader2, AlertCircle } from "lucide-react"
import { calculateTrustScore, type MockData } from "@/lib/reputation-engine"
import { usePiNetwork } from "@/hooks/use-pi-network"

interface DashboardProps {
  walletAddress: string
  username?: string
  onDisconnect: () => void
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [showSandbox, setShowSandbox] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [mockData, setMockData] = useState<MockData>({
    volume: 500,
    age: 365,
    network: 50,
  })
  const [trustScore, setTrustScore] = useState(0)

  const { createPayment } = usePiNetwork()

  useEffect(() => {
    const score = calculateTrustScore(mockData)
    setTrustScore(score)
  }, [mockData])

  const handleMockDataChange = (data: MockData) => {
    setMockData(data)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchAddress.trim()) return

    setIsSearching(true)
    setSearchError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockResponse = {
        volume: Math.random() * 1000,
        age: Math.floor(Math.random() * 730),
        network: Math.floor(Math.random() * 100),
      }

      setMockData(mockResponse)
    } catch (error) {
      setSearchError("Failed to fetch wallet data. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handlePremiumVerification = async () => {
    setIsProcessingPayment(true)

    try {
      const paymentId = await createPayment(walletAddress)

      if (paymentId) {
        setIsPremium(true)
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] bg-clip-text text-transparent">
              REPUTA
            </h1>
            {isPremium && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] text-xs font-semibold text-white"
              >
                <Crown className="w-3 h-3" />
                PREMIUM
              </motion.span>
            )}
          </div>
          {username && <p className="text-sm text-[var(--gold)] font-medium">@{username}</p>}
          <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-none font-mono">
            {walletAddress}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSandbox(!showSandbox)}
            className={`glass border-border/50 transition-all ${showSandbox ? "bg-[var(--purple)]/20 border-[var(--purple)]" : ""}`}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDisconnect}
            className="glass border-border/50 bg-transparent hover:bg-destructive/10 hover:border-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6"
      >
        <form onSubmit={handleSearch} className="glass rounded-xl p-4 glow-purple">
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Search any Pi wallet address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1 bg-background/50 border-border/50 focus:border-[var(--purple)] transition-all"
            />
            <Button
              type="submit"
              disabled={!searchAddress.trim() || isSearching}
              className="bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] hover:opacity-90 transition-opacity"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
          {searchError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {searchError}
            </div>
          )}
        </form>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Trust Score Gauge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <TrustScoreGauge score={trustScore} isPremium={isPremium} />
          </motion.div>

          {!isPremium && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="glass rounded-xl p-6 glow-gold border border-[var(--gold)]/20"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <Crown className="w-5 h-5 text-[var(--gold)]" />
                    <h3 className="text-lg font-bold text-foreground">Premium Verification</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Unlock verified status, priority support, and advanced analytics
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs">
                    <span className="px-2 py-1 rounded-full bg-[var(--purple)]/20 text-[var(--purple)]">
                      Enhanced Visibility
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">
                      Priority Support
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--trusted)]/20 text-[var(--trusted)]">
                      Advanced Analytics
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handlePremiumVerification}
                  disabled={isProcessingPayment}
                  className="bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] hover:opacity-90 font-semibold whitespace-nowrap h-12 px-6"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Verify for 1 Pi
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tier Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <TierCards currentScore={trustScore} />
          </motion.div>

          {/* Transaction Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TransactionChart />
          </motion.div>
        </div>

        {/* Sidebar - Sandbox */}
        {showSandbox && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <Sandbox mockData={mockData} onDataChange={handleMockDataChange} />
          </motion.div>
        )}
      </div>
    </div>
  )
}

