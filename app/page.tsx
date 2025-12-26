"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button" // تأكد من المسار

export default function HomePage() {
  const [isPiAuthenticated, setIsPiAuthenticated] = useState(false)
  const [userData, setUserData] = useState<{username: string} | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
    }
  }, []);

  // دالة الربط الأولية (تسجيل الدخول)
  const handlePiSignIn = async () => {
    try {
      if (!window.Pi) return alert("الرجاء فتح التطبيق من متصفح Pi Browser");

      const scopes = ['username', 'payments'];
      
      const onIncompletePaymentFound = (payment: any) => {
        console.log("Found incomplete payment", payment);
      };

      // طلب التوثيق من شبكة باي
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      setUserData({ username: auth.user.username });
      setIsPiAuthenticated(true); // هنا نفتح بوابة التطبيق
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isPiAuthenticated ? (
          /* واجهة الربط الأولى - تظهر قبل كل شيء */
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center p-8 glass rounded-3xl border border-purple-500/30 shadow-2xl"
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-gold bg-clip-text text-transparent">
              REPUTA
            </h1>
            <p className="text-muted-foreground mb-8">ابدأ بتوثيق حسابك عبر شبكة باي للوصول إلى محرك السمعة</p>
            
            <Button 
              onClick={handlePiSignIn}
              className="bg-gradient-to-r from-[#6200ee] to-[#9333ea] text-white px-10 py-6 rounded-full text-lg font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all"
            >
              Connect with Pi Network
            </Button>
          </motion.div>
        ) : (
          /* لوحة التحكم وصفحة البحث - تظهر فقط بعد الربط */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <Dashboard 
              walletAddress={userData?.username || "Pi User"} 
              onDisconnect={() => setIsPiAuthenticated(false)}
              // نمرر دالة الدفع التي تنفذ الخطوة 10 داخل الداشبورد
              onPay={() => {/* كود Payment المذكور سابقاً */}} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
