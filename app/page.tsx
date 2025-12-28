"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "@/components/dashboard"
import { EntryPage } from "@/components/entry-page"
import { CheckCircle2, XCircle, Info } from "lucide-react"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [username, setUsername] = useState(""); 
  const [isConnected, setIsConnected] = useState(false);
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    const initPi = async () => {
      const piWindow = (window as any).Pi;
      if (piWindow) {
        try {
          const auth = await piWindow.authenticate(['username', 'payments'], () => {});
          if (auth?.user) setUsername(auth.user.username);
        } catch (e) { console.warn("Waiting for SDK..."); }
      }
    };
    setTimeout(initPi, 1500);
  }, []);

  const handleConnect = async (address: string) => {
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.isValid) {
        setBlockchainData(data);
        setWalletAddress(address);
        setIsConnected(true);
        showToast("Connected", "success");
      } else {
        showToast("Invalid Wallet", "error");
      }
    } catch (e) {
      showToast("Sync Error", "error");
    }
  }

  // ربط الدفع بنافذة المتصفح لتسهيل استدعائه من Dashboard
  useEffect(() => {
    (window as any).onStartPayment = async () => {
      const piWindow = (window as any).Pi;
      if (!piWindow) return;
      try {
        await piWindow.createPayment({
          amount: 1,
          memo: "Pro Audit Subscription",
          metadata: { wallet: walletAddress }
        }, {
          onReadyForServerApproval: (id: string) => fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ paymentId: id }) }),
          onReadyForServerCompletion: () => {
             showToast("Upgrade Successful!", "success");
             setTimeout(() => window.location.reload(), 1500);
          },
          onCancel: () => showToast("Cancelled", "info"),
          onError: (e: Error) => showToast(e.message, "error")
        });
      } catch (e) { showToast("System Error", "error"); }
    }
  }, [walletAddress]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-xl">
            {toast.type === 'success' ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : 
             toast.type === 'error' ? <XCircle className="text-red-500 w-5 h-5" /> : 
             <Info className="text-purple-500 w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntryPage onConnect={handleConnect} />
          </motion.div>
        ) : (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard 
               walletAddress={walletAddress} 
               username={username} 
               onDisconnect={() => setIsConnected(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
