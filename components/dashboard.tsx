"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// تعريف نوع البيانات المستلمة
interface DashboardProps {
  walletAddress: string;
  username: string;
  onDisconnect: () => void;
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات عند التحميل
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/wallet/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        });
        const data = await res.json();
        if (data.isValid) {
          setWalletData(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [walletAddress]);

  // 2. دالة الدفع (تكامل Pi SDK)
  const handlePayment = () => {
    if (window.Pi) {
      window.Pi.createPayment({
        amount: 1,
        memo: "Reputation Report",
        metadata: { wallet: walletAddress }
      }, {
        onReadyForServerApproval: (id: string) => fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ id }) }),
        onReadyForServerCompletion: (id: string, tx: string) => fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ id, tx }) }),
        onCancel: () => {},
        onError: (err: any) => alert(err.message)
      });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-purple-500 font-bold animate-pulse">
      جاري فحص سجلات البلوكشين...
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-white font-bold">@{username || "Pioneer"}</h2>
          <p className="text-[10px] text-gray-500 font-mono">{walletAddress}</p>
        </div>
        <button onClick={onDisconnect} className="bg-red-500/10 text-red-500 text-xs px-3 py-1 rounded-lg">
          Disconnect
        </button>
      </div>

      {/* Score Card */}
      {walletData && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-3xl p-8 border border-purple-500 shadow-2xl shadow-purple-500/10 text-center"
        >
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Trust Score</p>
          <h1 className="text-7xl font-black text-purple-400 mb-2">{walletData.score}</h1>
          <p className="text-yellow-500 font-bold mb-6">{walletData.balance} π</p>
          
          <button 
            onClick={handlePayment}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all"
          >
            Unlock Detailed Report (1 π)
          </button>
        </motion.div>
      )}

      {/* Transactions List */}
      <div className="bg-gray-900/80 rounded-2xl p-4 border border-white/5">
        <h3 className="text-white text-sm font-bold mb-4 px-2">Recent Transactions</h3>
        <div className="space-y-2">
          {walletData?.transactions?.map((tx: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className={tx.type === 'استلام' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {tx.type}
                </span>
                <span className="text-[10px] text-gray-600">{tx.date}</span>
              </div>
              <span className="text-white font-mono">{tx.amount} π</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
