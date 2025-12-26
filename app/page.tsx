"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

// تعريف واجهة window لتجنب أخطاء TypeScript في Vercel
declare global {
  interface Window {
    Pi: any;
  }
}

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)

  // 1. تهيئة الـ SDK عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      // وضع sandbox: true ضروري لتجاوز الخطوات التجريبية
      window.Pi.init({ version: "2.0", sandbox: true }); 
    }
  }, []);

  // 2. دالة الدفع المطلوبة للخطوة رقم 10
  const handlePayment = async () => {
    try {
      if (!window.Pi) return alert("الرجاء فتح التطبيق من متصفح Pi Browser");

      await window.Pi.createPayment({
        amount: 0.1, 
        memo: "تفعيل الخطوة رقم 10 لمشروع Reputa", 
        metadata: { orderId: "step-10-validation" },
      }, {
        // الخطوة الحاسمة: إرسال الطلب للسيرفر الذي أنشأته في api/pi/approve/route.ts
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("إرسال طلب الموافقة للسيرفر...", paymentId);
          
          try {
            const response = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            
            if (response.ok) {
              console.log("وافق السيرفر على المعاملة ✅");
            }
          } catch (error) {
            console.error("فشل السيرفر في الموافقة:", error);
          }
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log("اكتملت المعاملة بنجاح! TXID:", txid);
          alert("تمت المعاملة بنجاح! الخطوة رقم 10 ستصبح مكتملة الآن.");
        },
        onCancel: (paymentId: string) => console.log("تم إلغاء الدفع"),
        onError: (error: Error, payment?: any) => console.error("خطأ في الدفع:", error),
      });
    } catch (err) {
      console.error("Payment Flow Error:", err);
    }
  };

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
            <Dashboard 
              walletAddress={walletAddress} 
              onDisconnect={handleDisconnect} 
              onPay={handlePayment} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
