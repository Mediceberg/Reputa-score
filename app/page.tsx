"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  
  // حالات جديدة لتخزين بيانات البلوكشين الحقيقية
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async (address: string, piUsername?: string) => {
    setIsLoading(true);
    try {
      // استدعاء محرك التحقق الحقيقي الذي أنشأناه في السيرفر
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (data.isValid) {
        // إذا كانت المحفظة حقيقية، نقوم بتخزين بياناتها وتوصيل المستخدم
        setBlockchainData(data);
        setWalletAddress(address);
        if (piUsername) setUsername(piUsername);
        setIsConnected(true);
      } else {
        alert(data.message || "المحفظة غير موجودة على الشبكة");
      }
    } catch (error) {
      alert("خطأ في الاتصال بمحرك البلوكشين");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setUsername("")
    setBlockchainData(null)
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* مؤشر تحميل أثناء التحقق من البلوكشين */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-6 bg-gray-900 rounded-2xl border border-purple-500 animate-pulse">
            <p className="text-white font-bold">جاري فحص البلوكشين... 🔍</p>
          </div>
        </div>
      )}

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
            {/* نمرر blockchainData إلى الـ Dashboard لعرض النقاط والمعاملات */}
            <Dashboard 
              walletAddress={walletAddress} 
              username={username} 
              data={blockchainData} 
              onDisconnect={handleDisconnect} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
