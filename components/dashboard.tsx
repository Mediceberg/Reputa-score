"use client"

import { motion } from "framer-motion"

interface DashboardProps {
  walletAddress: string;
  username: string;
  data: any; // البيانات الحقيقية من البلوكشين
  onDisconnect: () => void;
}

export function Dashboard({ walletAddress, username, data, onDisconnect }: DashboardProps) {
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 text-right" dir="rtl">
      {/* الرأس: الترحيب وزر الخروج */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">أهلاً، {username || 'رائد بي'}</h2>
          <p className="text-xs text-gray-400 font-mono">{walletAddress.substring(0, 15)}...</p>
        </div>
        <button onClick={onDisconnect} className="text-red-400 text-sm hover:underline">خروج</button>
      </div>

      {/* القسم العلوي: النقاط والرصيد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* بطاقة تقييم السمعة (Trust Score) */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-purple-500/30 relative overflow-hidden">
          <h3 className="text-gray-400 mb-2">مستوى الثقة (Reputa Score)</h3>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {data.score}
            </span>
            <span className="text-gray-500 pb-2">/ 100</span>
          </div>
          <p className="mt-2 text-sm text-purple-300 font-medium">الفئة: {data.tier}</p>
          {/* تأثير بصري للخلفية */}
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>
        </div>

        {/* بطاقة الرصيد الحقيقي */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col justify-center">
          <h3 className="text-gray-400 mb-1">الرصيد المتاح حالياً</h3>
          <p className="text-4xl font-bold text-yellow-500">{data.balance} <span className="text-lg">Pi</span></p>
          <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-yellow-500" style={{ width: `${Math.min(data.balance, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* قسم جدول المعاملات الأخيرة */}
      <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-lg">آخر معاملات الشبكة</h3>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">مباشر من البلوكشين</span>
        </div>
        <div className="divide-y divide-gray-800">
          {data.transactions && data.transactions.length > 0 ? (
            data.transactions.map((tx: any) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                <div className="flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'استلام' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'استلام' ? '↙' : '↗'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{tx.type} عملات بي</p>
                    <p className="text-[10px] text-gray-500">من: {tx.from} • {tx.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${tx.type === 'استلام' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'استلام' ? '+' : '-'}{tx.amount}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono">ID: {tx.id}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">لا توجد معاملات حديثة لهذه المحفظة</div>
          )}
        </div>
      </div>

      {/* زر التقرير المفصل */}
      <div className="bg-purple-900/20 p-6 rounded-3xl border border-purple-500/20 text-center">
        <h4 className="text-white font-bold mb-2">هل تريد تحليلاً أعمق؟</h4>
        <p className="text-sm text-gray-400 mb-4">احصل على تقرير مفصل لنشاط محفظتك، مصادر العملات، وتصنيف الأمان الشامل.</p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-900/40">
          تفعيل التقرير الممتاز (1 Pi)
        </button>
      </div>
    </div>
  )
}
