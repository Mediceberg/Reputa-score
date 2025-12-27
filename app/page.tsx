"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 1. حل مشكلة Hydration و Application Error
  useEffect(() => {
    setIsMounted(true)
    
    // 2. تفعيل Pi SDK لضمان التعرف على هوية الرائد
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['payments', 'username'], (payment: any) => {
        console.log("Incomplete payment found", payment);
      }).catch((err: any) => {
        console.error("Pi Authentication failed:", err);
      });
    }
  }, [])

  const handleConnect = (address: string, piUsername?: string) => {
    setWalletAddress(address)
    if (piUsername) {
      setUsername(piUsername)
    }
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setUsername("")
  }

  // منع الرندر على السيرفر لتفادي أخطاء الـ Client-side
  if (!isMounted) return null

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
            {/* نمرر وظيفة الربط لصفحة الدخول */}
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
            {/* نمرر البيانات للوحة التحكم */}
            <Dashboard 
              walletAddress={walletAddress} 
              username={username} 
              onDisconnect={handleDisconnect} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
