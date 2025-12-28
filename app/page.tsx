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
  const [username, setUsername] = useState<string>("") // سيتم جلبه آلياً
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

  // --- 1. نظام الربط التلقائي (Auto-Connect & Authenticate) ---
  useEffect(() => {
    const loginToPi = async () => {
      if (typeof window !== "undefined" && window.Pi) {
        try {
          const scopes = ['username', 'payments'];
          // جلب بيانات المستخدم الحقيقية فور فتح التطبيق
          const auth = await window.Pi.authenticate(scopes, (payment) => {
            console.log("Payment callback:", payment);
          });
          
          if (auth && auth.user) {
            setUsername(auth.user.username); // تعيين اسم المستخدم الحقيقي من Pi
            console.log("Connected as:", auth.user.username);
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          showToast("Please open via Pi Browser", "error");
        }
      }
    };
    loginToPi();
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

  // --- 3. منطق الدفع الاحترافي ---
  const handlePayment = async () => {
    try {
      showToast(lang === 'ar' ? "تأكيد العملية..." : "Confirming...", "loading");
      
      await window.Pi.createPayment({
        amount: 1,
        memo: `Reputation report for ${username}`,
        metadata: { wallet: walletAddress, user: username },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          return await fetch(`${window.location.origin}/api/pi/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          }).then(res => res.json());
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          const res = await fetch(`${window.location.origin}/api/pi/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          showToast(lang === 'ar' ? "تم التفعيل بنجاح!" : "Activated Successfully!", "success");
          return res.json();
        },
        onCancel: () => showToast("Cancelled", "info"),
        onError: (err: any) => {
          console.error(err);
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
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: 50, opacity: 0, x: "-50%" }} animate={{ y: 0, opacity: 1, x: "-50%" }} exit={{ y: 50, opacity: 0, x: "-50%" }}
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

      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {['en', 'ar'].map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
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
              username={username} // يمرر الاسم الحقيقي هنا
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
