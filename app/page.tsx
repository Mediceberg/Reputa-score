"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isPiAuthenticated, setIsPiAuthenticated] = useState(false)
  const [userData, setUserData] = useState<{username: string} | null>(null)

  // 1. تهيئة الـ SDK عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Pi) {
      (window as any).Pi.init({ version: "2.0", sandbox: true });
    }
  }, []);

  // 2. دالة الربط (تسجيل الدخول) - تم تحسينها للاستجابة الفورية
  const handlePiSignIn = async () => {
    const Pi = (window as any).Pi;
    if (!Pi) return alert("الرجاء فتح التطبيق من متصفح Pi Browser");

    try {
      // إعادة التأكد من التهيئة قبل التوثيق
      await Pi.init({ version: "2.0", sandbox: true });

      const scopes = ['username', 'payments'];
      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment found:", payment);
      };

      const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
      setUserData({ username: auth.user.username });
      setIsPiAuthenticated(true); 
    } catch (err) {
      console.error("Auth error:", err);
      alert("فشل الاتصال: تأكد من تفعيل Sandbox في تطبيق Pi Mining");
    }
  };

  // 3. دالة الدفع (المرحلة 10) - نمررها للداشبورد
  const handlePayment = async () => {
    const Pi = (window as any).Pi;
    try {
      await Pi.createPayment({
        amount: 0.1,
        memo: "تفعيل المرحلة 10 - Reputa Score",
        metadata: { orderId: "step-10-check" },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          alert("تمت المعاملة بنجاح! مبروك تفعيل المرحلة 10.");
        },
        onCancel: (paymentId: string) => console.log("Cancelled"),
        onError: (error: Error) => console.error("Payment error:", error),
      });
    } catch (err) {
      console.error("Payment flow failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isPiAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center p-8 glass rounded-3xl border border-purple-500/30 shadow-2xl max-w-sm w-full mx-4"
          >
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              REPUTA
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              يجب ربط حساب Pi Network الخاص بك للمتابعة
            </p>
            
            <Button 
              onClick={handlePiSignIn}
              className="w-full bg-gradient-to-r from-[#6200ee] to-[#9333ea] text-white py-7 rounded-2xl text-lg font-bold shadow-xl hover:opacity-90 transition-all"
            >
              Connect with Pi Network
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <Dashboard 
              walletAddress={userData?.username || "Pi User"} 
              onDisconnect={() => setIsPiAuthenticated(false)}
              onPay={handlePayment} // الربط الفعلي لزر الدفع
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
