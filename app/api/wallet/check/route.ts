"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface DashboardProps {
  walletAddress: string;
  username: string;
  onDisconnect: () => void;
}

export const Dashboard = ({ walletAddress, username, onDisconnect }: DashboardProps) => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // دالة البحث المحدثة التي أرسلتها
  const handleSearch = async (address: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.isValid) {
        setWalletData(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-8 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-white">Welcome, {username || "Pioneer"}</h1>
          <p className="text-xs text-gray-500 font-mono">{walletAddress.substring(0, 10)}...</p>
        </div>
        <button onClick={onDisconnect} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-lg">Disconnect</button>
      </div>

      {/* زر تفعيل البحث التلقائي لمجرد الدخول */}
      {!walletData && !loading && (
        <button 
          onClick={() => handleSearch(walletAddress)}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all"
        >
          تحليل السمعة الآن
        </button>
      )}

      {loading && <p className="text-center text-purple-400 animate-pulse">جاري فحص البلوكشين...</p>}

      {/* واجهة العرض التي أرسلتها مدمجة هنا */}
      <AnimatePresence>
        {walletData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-gray-900 rounded-2xl border border-purple-500 shadow-xl"
          >
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">نقاط السمعة الحقيقية</p>
              <h2 className="text-5xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                {walletData.score}
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">آخر المعاملات:</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                  Live Data
                </span>
              </div>
              
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {walletData.transactions.map((tx: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-black/40 rounded-xl text-xs border border-white/5">
                    <div className="flex flex-col">
                      <span className={tx.type === 'استلام' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {tx.type}
                      </span>
                      <span className="text-gray-500 text-[10px]">{tx.date}</span>
                    </div>
                    <span className="text-white font-mono font-bold text-sm">{tx.amount} Pi</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
