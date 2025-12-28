"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'ar' | 'en' | 'fr'>('ar')

  // دالة الدفع التي تمنع انتهاء الصلاحية
  const startPayment = async (address: string) => {
    try {
      const payment = await window.Pi.createPayment({
        amount: 1,
        memo: "Reputa Protocol Analysis V3",
        metadata: { walletAddress: address },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          // إرسال الموافقة الفورية للسيرفر لمنع خطأ Expired
          await fetch('/api/pi/approve', {
            method: 'POST',
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          // إتمام المعاملة نهائياً
          await fetch('/api/pi/complete', {
            method: 'POST',
            body: JSON.stringify({ paymentId, txid }),
          });
          // بعد نجاح الدفع، نقوم بجلب البيانات العميقة
          fetchBlockchainData(address);
        },
        onCancel: (paymentId: string) => console.log("Cancelled"),
        onError: (error: Error, payment: any) => alert("Payment Error: " + error.message),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const fetchBlockchainData = async (address: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await response.json();
      if (data.isValid) {
        setBlockchainData(data);
        setIsConnected(true);
      }
    } catch (error) {
      alert("Blockchain Error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnect = async (address: string, piUsername?: string) => {
    setWalletAddress(address);
    if (piUsername) setUsername(piUsername);
    
    // تشغيل نظام الدفع أولاً لفتح التقرير
    await startPayment(address);
  }

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setBlockchainData(null);
  }

  return (
    <div className={`min-h-screen bg-background relative ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* شريط تبديل اللغات الاحترافي */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {['en', 'ar', 'fr'].map((lang) => (
          <button 
            key={lang} 
            onClick={() => setLanguage(lang as any)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === lang ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="p-8 bg-gray-900 rounded-3xl border border-purple-500 shadow-2xl text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold">
              {language === 'ar' ? 'جاري تحليل بروتوكول السمعة...' : 'Analyzing Reputa Protocol...'}
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntryPage onConnect={handleConnect} language={language} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Dashboard 
              walletAddress={walletAddress} 
              username={username} 
              data={blockchainData} 
              onDisconnect={handleDisconnect}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
