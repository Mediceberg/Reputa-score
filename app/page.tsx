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

  // الرابط الصريح لضمان عدم ضياع الطلب في Vercel Logs
  const API_BASE_URL = "https://reputa-score.vercel.app";

  useEffect(() => {
    const loginToPi = async () => {
      if (typeof window !== "undefined" && window.Pi) {
        try {
          const scopes = ['username', 'payments'];
          const auth = await window.Pi.authenticate(scopes, (payment: any) => {
            console.log("Payment callback:", payment);
          });
          
          if (auth && auth.user) {
            setUsername(auth.user.username);
          }
        } catch (error) {
          console.error("Auth Error:", error);
        }
      }
    };
    loginToPi();
  }, []);

  const handleConnect = async (address: string) => {
    setIsLoading(true);
    showToast(lang === 'ar' ? "جاري المزامنة..." : "Syncing...", "loading");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/check`, {
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

  const handlePayment = async () => {
    try {
      showToast(lang === 'ar' ? "تأكيد العملية..." : "Confirming...", "loading");
      
      if (!walletAddress) {
        showToast("Wallet address missing", "error");
        return;
      }

      await window.Pi.createPayment({
        amount: 1,
        memo: `Report for ${username}`,
        metadata: { wallet: walletAddress, user: username },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          // استخدام الرابط الصريح المباشر
          const response = await fetch(`${API_BASE_URL}/api/pi/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          
          if (!response.ok) throw new Error("Approval Failed");
          return response.json();
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          const res = await fetch(`${API_BASE_URL}/api/pi/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          
          if (res.ok) {
            showToast(lang === 'ar' ? "تم بنجاح!" : "Activated!", "success");
            return res.json();
          }
          throw new Error("Completion Failed");
        },
        onCancel: () => showToast("Cancelled", "info"),
        onError: (error: Error, paymentId?: string) => {
          // تنبيه منبثق للتشخيص الفوري في حال عدم وصول الطلب للـ Logs
          alert(`CRITICAL: ${error.message} \nID: ${paymentId || 'NONE'}`);
          showToast("Payment Failed", "error");
        },
      });
    } catch (err) {
      showToast("Payment Error", "error");
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
            key={l} onClick={() => setLang(l)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' : 'bg-gray-800 text-gray-400'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md text-center">
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
