"use client"

import { useState, useEffect } from "react"
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

  // --- التحديث الجديد: المصادقة الإلزامية للوضع الحقيقي ---
  useEffect(() => {
    const authenticatePi = async () => {
      if (typeof window !== "undefined" && window.Pi) {
        try {
          const scopes = ['username', 'payments'];
          await window.Pi.authenticate(scopes, (payment) => {
            console.log("Pi Authentication Success");
          });
        } catch (error) {
          console.error("Pi Authentication Error:", error);
        }
      }
    };
    authenticatePi();
  }, []);
  // --------------------------------------------------

  const showToast = (msg: string, type: keyof typeof notificationIcons) => {
    setNotifType(type);
    setNotification(msg);
    if (type !== "loading") {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleConnect = async (address: string, piUsername?: string) => {
    setIsLoading(true);
    showToast(lang === 'ar' ? "جاري فحص البلوكشين..." : "Scanning Blockchain...", "loading");
    
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
        if (piUsername) setUsername(piUsername);
        setIsConnected(true);
        setNotification(null);
      } else {
        showToast(data.message || "Wallet not found", "error");
      }
    } catch (error) {
      showToast("Connection Error", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePayment = async () => {
    try {
      showToast(lang === 'ar' ? "جاري تحضير الدفع..." : "Preparing Payment...", "loading");
      
      // تأكد من وجود المحفظة قبل بدء الدفع
      if (!walletAddress) {
        showToast("Wallet address missing", "error");
        return;
      }

      await window.Pi.createPayment({
        amount: 1,
        memo: "Reputa Detailed Report Access",
        metadata: { wallet: walletAddress },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          // استخدام المسار المطلق لضمان الاستجابة في Vercel
          const response = await fetch(`${window.location.origin}/api/pi/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          return response.json();
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          const response = await fetch(`${window.location.origin}/api/pi/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          showToast(lang === 'ar' ? "تم فتح التقرير بنجاح!" : "Full Report Unlocked!", "success");
          return response.json();
        },
        onCancel: (paymentId: string) => showToast("Payment Cancelled", "info"),
        onError: (error: Error) => {
          console.error("Payment Error:", error);
          showToast("Payment Failed", "error");
        },
      });
    } catch (err) {
      showToast("Payment Process Error", "error");
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setUsername("")
    setBlockchainData(null)
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
        {['en', 'ar', 'fr'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-400 font-black animate-pulse uppercase tracking-widest">
              {lang === 'ar' ? 'جاري الاتصال بالبلوكشين' : 'Syncing Blockchain'}
            </p>
          </div>
        </div>
      )}

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
