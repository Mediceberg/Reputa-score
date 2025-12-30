"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

/** * تعديل المسارات هنا:
 * بما أننا في app/page.tsx، نخرج خطوة للخلف للوصول إلى مجلد components 
 * الذي يحتوي على الملفات التي رفعتها.
 */
import { EntryPage } from "../components/entry-page"
import { Dashboard } from "../components/dashboard"

// تعريف الأنواع لضمان عدم حدوث أخطاء
export type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

export interface WalletData {
  address: string;
  balance: number;
  accountAge: number;
  reputaScore: number;
  trustLevel: TrustLevel;
  riskLevel: 'Low' | 'Medium' | 'High';
}

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
  const [blockchainData, setBlockchainData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const [notification, setNotification] = useState<string | null>(null)
  const [notifType, setNotifType] = useState<keyof typeof notificationIcons>("info")

  const showToast = useCallback((msg: string, type: keyof typeof notificationIcons) => {
    setNotifType(type);
    setNotification(msg);
    if (type !== "loading") setTimeout(() => setNotification(null), 4000);
  }, []);

  // --- 1. نظام المصادقة (Pi Auth) ---
  useEffect(() => {
    const loginToPi = async () => {
      if (typeof window !== "undefined" && (window as any).Pi) {
        try {
          const Pi = (window as any).Pi;
          const auth = await Pi.authenticate(['username', 'payments'], (payment: any) => {
            console.log("Payment in progress:", payment);
          });
          
          if (auth && auth.user) {
            setUsername(auth.user.username);
            showToast(lang === 'ar' ? `مرحباً ${auth.user.username}` : `Welcome ${auth.user.username}`, "success");
          }
        } catch (error: any) {
          console.error("Auth failed:", error);
        }
      }
    };
    const timer = setTimeout(loginToPi, 1000);
    return () => clearTimeout(timer);
  }, [lang, showToast]);

  // --- 2. منطق فحص المحفظة ---
  const handleConnect = async (address: string) => {
    setIsLoading(true);
    showToast(lang === 'ar' ? "جاري تحليل بيانات البلوكشين..." : "Analyzing blockchain data...", "loading");
    
    try {
      const response = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (data.isValid) {
        setBlockchainData(data);
      } else {
        const mockData = generateMockWalletData(address);
        setBlockchainData(mockData);
      }
      
      setWalletAddress(address);
      setIsConnected(true);
      setNotification(null);
    } catch (error) {
      const mockData = generateMockWalletData(address);
      setBlockchainData(mockData);
      setWalletAddress(address);
      setIsConnected(true);
    } finally {
      setIsLoading(false);
    }
  }

  // --- 3. منطق الدفع ---
  const handlePayment = async () => {
    if (!(window as any).Pi) {
      showToast("Pi SDK not detected!", "error");
      return;
    }

    try {
      showToast(lang === 'ar' ? "انتظار تأكيد الشبكة..." : "Awaiting network...", "loading");
      
      await (window as any).Pi.createPayment({
        amount: 1,
        memo: `Upgrade to Pro - Reputa Score`,
        metadata: { wallet: walletAddress, user: username },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          return await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          }).then(res => res.json());
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
        onError: (error: Error) => showToast("Payment Failed", "error"),
      });
    } catch (err: any) {
      console.error(err);
    }
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
            <p className="font-bold text-sm">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {['en', 'ar'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}
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
              onDisconnect={() => setIsConnected(false)}
              onStartPayment={handlePayment} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function generateMockWalletData(address: string): WalletData {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const trustScore = random(40, 95);
  return {
    address,
    balance: random(50, 5000),
    accountAge: random(10, 500),
    reputaScore: trustScore * 10,
    trustLevel: trustScore > 85 ? 'Elite' : trustScore > 70 ? 'High' : 'Medium',
    riskLevel: trustScore > 60 ? 'Low' : 'Medium'
  };
}
