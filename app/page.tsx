"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

const notificationIcons = {
  success: "✅",
  error: "❌",
  loading: "⏳",
  info: "ℹ️"
};

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [username, setUsername] = useState<string>("") 
  const [isConnected, setIsConnected] = useState(false)
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const [notification, setNotification] = useState<string | null>(null)
  const [notifType, setNotifType] = useState<keyof typeof notificationIcons>("info")

  const showToast = useCallback((msg: string, type: keyof typeof notificationIcons) => {
    setNotifType(type);
    setNotification(msg);
    if (type !== "loading") setTimeout(() => setNotification(null), 4000);
  }, []);

  // --- 1. إصلاح نظام الربط التلقائي (الـ Auth) ---
  useEffect(() => {
    const loginToPi = async () => {
      // التأكد من أننا داخل Pi Browser وأن الـ SDK جاهز
      if (typeof window !== "undefined" && (window as any).Pi) {
        try {
          const Pi = (window as any).Pi;
          
          // طلب الصلاحيات بشكل صريح
          const auth = await Pi.authenticate(['username', 'payments'], (payment: any) => {
            console.log("Payment in progress:", payment);
          });
          
          if (auth && auth.user) {
            setUsername(auth.user.username); // هنا سيظهر الاسم أخيراً
            console.log("Authenticated User:", auth.user.username);
          }
        } catch (error: any) {
          console.error("Auth failed:", error);
          // إذا ظهر لك خطأ هنا، فهذا يعني أنك لم تضف رابط التطبيق في Pi Developer Portal
          showToast("Authentication Error", "error");
        }
      }
    };

    // إضافة تأخير بسيط للتأكد من تحميل الـ SDK في المتصفح
    const timer = setTimeout(loginToPi, 1000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // --- 2. منطق فحص المحفظة ---
  const handleConnect = async (address: string) => {
    setIsLoading(true);
    showToast(lang === 'ar' ? "جاري مزامنة حسابك..." : "Syncing account...", "loading");
    
    try {
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (data.isValid) {
        setBlockchainData(data);
        setWalletAddress(address);
        setIsConnected(true);
        setNotification(null);
      } else {
        showToast(data.message || "Invalid Wallet", "error");
      }
    } catch (error) {
      showToast("Blockchain Error", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // --- 3. منطق الدفع (مع إضافة تنبيهات لكشف العطل) ---
  const handlePayment = async () => {
    // اختبار أولي: هل الدالة تُستدعى؟
    console.log("Button clicked, initiating payment...");

    if (!(window as any).Pi) {
      alert("Pi SDK not detected!");
      return;
    }

    if (!username) {
      alert("User not authenticated. Please restart Pi Browser.");
      return;
    }

    try {
      showToast(lang === 'ar' ? "تأكيد العملية..." : "Confirming...", "loading");
      
      await (window as any).Pi.createPayment({
        amount: 1,
        memo: `Reputation report for ${username}`,
        metadata: { wallet: walletAddress, user: username },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          const response = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          if (!response.ok) throw new Error("Approval failed");
          return response.json();
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          const res = await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          if (res.ok) {
            showToast(lang === 'ar' ? "تم التفعيل!" : "Activated!", "success");
            return res.json();
          }
        },
        onCancel: () => showToast("Cancelled", "info"),
        onError: (error: Error) => {
          alert("Payment Error: " + error.message);
          showToast("Payment Failed", "error");
        },
      });
    } catch (err: any) {
      alert("System Error: " + err.message);
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setBlockchainData(null);
  }

  return (
    <div className={`min-h-screen bg-background relative ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: 50, opacity: 0, x: "-50%" }} 
            animate={{ y: 0, opacity: 1, x: "-50%" }} 
            exit={{ y: 50, opacity: 0, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
              notifType === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
              notifType === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
              'bg-purple-500/20 border-purple-500/50 text-purple-400'
            }`}
          >
            <span className="text-xl">{notificationIcons[notifType]}</span>
            <p className="font-bold text-sm tracking-wide">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {['en', 'ar'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'bg-gray-800 text-gray-400'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntryPage onConnect={handleConnect} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Dashboard 
              walletAddress={walletAddress} 
              username={username} 
              data={blockchainData} 
              onDisconnect={handleDisconnect}
              onStartPayment={handlePayment} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
