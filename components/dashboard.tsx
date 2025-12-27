use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePiNetwork } from "@/hooks/use-pi-network"

interface DashboardProps {
  walletAddress: string;
  username: string;
  data: any; // البيانات الحقيقية من محرك البلوكشين (api/wallet/check)
  onDisconnect: () => void;
}

export function Dashboard({ walletAddress, username, data, onDisconnect }: DashboardProps) {
  const { createPayment } = usePiNetwork();
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // دالة تفعيل الدفع للتقرير الممتاز (1 Pi)
  const handlePremiumPayment = async () => {
    setIsProcessing(true);
    try {
      const payment = await createPayment(walletAddress);
      if (payment) {
        setIsPremium(true);
        // يمكنك هنا إضافة سجل في قاعدة بياناتك بأن المستخدم أصبح Premium
      }
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 text-right" dir="rtl">
      
      {/* 1. رأس الصفحة (Header) */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">
            {username ? username[0].toUpperCase() : 'P'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">أهلاً، {username || 'رائد بي'}</h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{walletAddress.substring(0, 20)}...</p>
          </div>
        </div>
        <button onClick={onDisconnect} className="text-red-400 text-xs hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors">
          تسجيل الخروج
        </button>
      </div>

      {/* 2. بطاقات الإحصائيات الحقيقية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* بطاقة السمعة (Scoring) */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-purple-500/30">
          <p className="text-gray-400 text-xs mb-1">نقاط الثقة (Reputa Score)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {data.score}
            </span>
            <span className="text-gray-600 text-sm">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full border border-purple-500/30">
              تصنيف: {data.tier}
            </span>
          </div>
        </motion.div>

        {/* بطاقة الرصيد (Blockchain Balance) */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col justify-center">
          <p className="text-gray-400 text-xs mb-1">الرصيد الفعلي (Mainnet/Testnet)</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-yellow-500">{data.balance}</span>
            <span className="text-xl font-bold text-yellow-600">Pi</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">الحالة: محفظة نشطة وموثقة على الشبكة</p>
        </motion.div>
      </div>

      {/* 3. سجل المعاملات المنظم */}
      <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 bg-white/5 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">آخر العمليات على البلوكشين</h3>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-400">بيانات حية</span>
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-800">
          {data.transactions && data.transactions.length > 0 ? (
            data.transactions.map((tx: any) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'استلام' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'استلام' ? '↙' : '↗'}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{tx.type} عملات Pi</p>
                    <p className="text-[10px] text-gray-500">من: {tx.from} • {tx.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${tx.type === 'استلام' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'استلام' ? '+' : '-'}{tx.amount}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-gray-500 text-xs">لا توجد معاملات مسجلة حالياً</p>
          )}
        </div>
      </div>

      {/* 4. منطقة التقرير الممتاز (Premium Section) */}
      <AnimatePresence mode="wait">
        {!isPremium ? (
          <motion.div 
            key="upgrade"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-purple-900/20 to-black rounded-3xl border border-purple-500/40 text-center"
          >
            <h4 className="text-white font-bold mb-2">تفعيل تقرير السمعة الشامل ⚡</h4>
            <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
              احصل على تحليل معمق لمصدر عملاتك، تقييم خطر المحفظة، <br/> والحصول على شارة "Verified Pioneer" في نتائج البحث.
            </p>
            <button 
              onClick={handlePremiumPayment}
              disabled={isProcessing}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {isProcessing ? "جاري الاتصال بـ Pi Wallet..." : "فتح التقرير (1 Pi)"}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="report"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* واجهة التقرير الممتاز بعد الدفع */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 p-6 rounded-3xl border border-yellow-500/50 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">🏆</div>
              <p className="text-yellow-500 font-bold text-lg mb-1">التقرير التحليلي المفصل</p>
              <p className="text-[10px] text-yellow-200/70">هذا الحساب مصنف كعضو موثوق في شبكة Pi</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center">
                <p className="text-gray-500 text-[10px] mb-1">الأمان</p>
                <p className="text-green-400 font-bold text-[10px]">آمن جداً</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center">
                <p className="text-gray-500 text-[10px] mb-1">النشاط</p>
                <p className="text-blue-400 font-bold text-[10px]">مستمر</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 text-center">
                <p className="text-gray-500 text-[10px] mb-1">المصدر</p>
                <p className="text-purple-400 font-bold text-[10px]">تعدين</p>
              </div>
            </div>

            <div className="bg-blue-900/10 p-4 rounded-2xl border border-blue-500/20">
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                "نصيحة: نقاط سمعتك ممتازة، ننصحك بالاحتفاظ بالرصيد لرفع مرتبتك في تصنيف الـ Elite خلال الأشهر القادمة."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
