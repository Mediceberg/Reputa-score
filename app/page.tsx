"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  
  // تخزين البيانات الشاملة: النقاط، المعاملات، والرصيد
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async (address: string, piUsername?: string) => {
    if (!address.startsWith('G') || address.length !== 56) {
      alert("يرجى إدخال عنوان محفظة Pi صحيح (يبدأ بحرف G)");
      return;
    }

    setIsLoading(true);
    try {
      // الاتصال بالمسار الجديد الذي أنشأناه في السيرفر
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (data.isValid) {
        // إذا نجح التحقق، نمرر كل البيانات (المعاملات + النقاط + الرصيد)
        setBlockchainData({
          score: data.score,
          balance: data.balance,
          transactions: data.transactions, // مصفوفة المعاملات الحقيقية
          tier: data.score > 80 ? "Elite" : "Trusted",
          isPremium: false // قيمة افتراضية حتى يتم الدفع
        });
        
        setWalletAddress(address);
        if (piUsername) setUsername(piUsername);
        setIsConnected(true);
      } else {
        alert(data.message || "المحفظة غير موجودة في سجلات البلوكشين");
      }
    } catch (error) {
      alert("فشل الاتصال بمحرك البلوكشين. تأكد من إعدادات Vercel ووجود المفاتيح.");
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* طبقة التحميل الاحترافية */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 text-purple-400 font-medium text-lg"
            >
              جاري تحليل بيانات البلوكشين...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <EntryPage onConnect={handleConnect} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
          >
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
