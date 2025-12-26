"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TrustScoreGauge } from "@/components/trust-score-gauge"
import { TierCards } from "@/components/tier-cards"
import { TransactionChart } from "@/components/transaction-chart"
import { Sandbox } from "@/components/sandbox"
import { LogOut, Settings, CreditCard } from "lucide-react" 
import { calculateTrustScore, type MockData } from "@/lib/reputation-engine"

interface DashboardProps {
  walletAddress: string
  onDisconnect: () => void
  onPay?: () => void 
}

export function Dashboard({ walletAddress, onDisconnect, onPay }: DashboardProps) {
  const [showSandbox, setShowSandbox] = useState(false)
  const [mockData, setMockData] = useState<MockData>({
    volume: 500,
    age: 365,
    network: 50,
  })
  const [trustScore, setTrustScore] = useState(0)

  useEffect(() => {
    const score = calculateTrustScore(mockData)
    setTrustScore(score)
  }, [mockData])

  const handleMockDataChange = (data: MockData) => {
    setMockData(data)
  }

  return (
    <div className="min-h-screen p-4 pb-20 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] bg-clip-text text-transparent">
            REPUTA
          </h1>
          <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-none">{walletAddress}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* زر الدفع لتفعيل الخطوة رقم 10 - يظهر بشكل بارز */}
          <Button
            variant="default"
            onClick={onPay}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg border-none transition-all hover:scale-105 active:scale-95"
          >
            <CreditCard className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline font-bold">Pi Pay (Step 10)</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSandbox(!showSandbox)}
            className="glass border-border/50"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onDisconnect}
            className="glass border-border/50 bg-transparent hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <TrustScoreGauge score={trustScore} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <TierCards currentScore={trustScore} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TransactionChart />
          </motion.div>
        </div>

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
