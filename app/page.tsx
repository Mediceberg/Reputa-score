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

  // دالة الدفع التي تضمن الربط والموافقة الفورية
  const processPayment = async (address: string) => {
    return new Promise((resolve, reject) => {
      try {
        window.Pi.createPayment({
          amount: 1, // رسوم التقرير المعمق
          memo: "Reputa Protocol V3 Analysis",
          metadata: { walletAddress: address },
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            // حل مشكلة انتهاء الصلاحية: إرسال إشارة الموافقة فوراً للسيرفر
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            // تأكيد إتمام المعاملة
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            resolve(true);
          },
          onCancel: (paymentId: string) => reject("Payment Cancelled"),
          onError: (error: Error) => reject(error.message),
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleConnect = async (address: string, piUsername?: string) => {
    setIsLoading(true);
    try {
      // 1. أولاً: نقوم بمعالجة الدفع لضمان جدية المستخدم ومنع انتهاء الصلاحية
      await processPayment(address);

      // 2. ثانياً: بعد نجاح الدفع، نستدعي محرك التحقق الحقيقي
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (data.isValid) {
        setBlockchainData(data);
        setWalletAddress(address);
        if (piUsername) setUsername(piUsername);
        setIsConnected(true);
      } else {
        alert(data.message || "المحفظة غير موجودة على الشبكة");
      }
    } catch (error) {
      // إذا فشل الدفع أو التحقق يظهر التنبيه
      alert(typeof error === 'string' ? error : "فشل في إتمام العملية");
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
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-6 bg-gray-900 rounded-2xl border border-purple-500 animate-pulse text-center">
            <p className="text-white font-bold mb-2">جاري المعالجة الآمنة... 🛡️</p>
            <p className="text-xs text-purple-300">يرجى عدم إغلاق التطبيق أثناء الدفع</p>
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
