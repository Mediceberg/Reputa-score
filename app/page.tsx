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
      window.Pi.init({ version: "2.0", sandbox: true }); // اجعلها true للخطوة 10
    }
  }, []);

  // 2. دالة الدفع المطلوبة للخطوة رقم 10
  const handlePayment = async () => {
    try {
      if (!window.Pi) return alert("الرجاء فتح التطبيق من متصفح Pi");

      const payment = await window.Pi.createPayment({
        amount: 0.1, // مبلغ تجريبي صغير
        memo: "Test payment for Step 10", 
        metadata: { orderId: "step-10-validation" },
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log("Payment Ready for Approval:", paymentId);
          // في تطبيقات التجربة، الشبكة توافق تلقائياً أحياناً في الـ Sandbox
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log("Payment Completed! TXID:", txid);
          alert("تمت المعاملة بنجاح! انتقل الآن إلى بوابة المطورين");
        },
        onCancel: (paymentId: string) => console.log("Payment Cancelled"),
        onError: (error: Error, payment?: any) => console.error("Payment Error", error),
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
            {/* أضفنا دالة handlePayment هنا ليتمكن المستخدم من الضغط على زر الدفع داخل الداشبورد */}
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
