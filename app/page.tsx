"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = (address: string) => {
    setWalletAddress(address)
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EntryPage onConnect={handleConnect} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard walletAddress={walletAddress} onDisconnect={handleDisconnect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

