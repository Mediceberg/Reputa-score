"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  en: {
    title: "Reputa Protocol",
    search_placeholder: "Enter Wallet G...",
    check: "Analyze Wallet",
    score_title: "Trust Score",
    balance: "Native Balance",
    transactions: "Recent Activities",
    spam_warn: "Spam Detected",
    dex_trade: "DEX Operation",
    notif_linked: "Wallet Linked Successfully",
    notif_pay: "Payment Confirmed",
    risk_low: "Low Risk",
    risk_high: "High Risk"
  },
  ar: {
    title: "بروتوكول سمعة",
    search_placeholder: "أدخل عنوان المحفظة...",
    check: "تحليل المحفظة",
    score_title: "مؤشر الثقة",
    balance: "الرصيد الأساسي",
    transactions: "النشاطات الأخيرة",
    spam_warn: "معاملة مشبوهة",
    dex_trade: "تداول منصة Pi",
    notif_linked: "تم ربط المحفظة بنجاح",
    notif_pay: "تم تأكيد الدفع",
    risk_low: "مخاطر منخفضة",
    risk_high: "مخاطر عالية"
  },
  fr: {
    title: "Protocole Reputa",
    search_placeholder: "Adresse Wallet G...",
    check: "Analyser",
    score_title: "Indice de Confiance",
    balance: "Solde Natif",
    transactions: "Activités Récentes",
    spam_warn: "Spam Détecté",
    dex_trade: "Opération DEX",
    notif_linked: "Portefeuille Lié",
    notif_pay: "Paiement Confirmé",
    risk_low: "Risque Faible",
    risk_high: "Risque Élevé"
  }
};

export default function ProfessionalDashboard() {
  const [lang, setLang] = useState('en');
  const [data, setData] = useState<any>(null);
  const [notification, setNotif] = useState("");
  const t = translations[lang as keyof typeof translations];

  const triggerNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className={`min-h-screen ${lang === 'ar' ? 'font-arabic' : 'font-sans'} bg-[#0a0a0a] text-white p-4`}>
      {/* Header & Lang Switcher */}
      <nav className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
          REPUTA <span className="text-xs text-gray-500">V3.0</span>
        </h1>
        <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg">
          {['en', 'ar', 'fr'].map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded ${lang === l ? 'bg-yellow-600' : ''}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Analysis Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 mb-6 shadow-2xl">
          <input 
            className="w-full bg-[#050505] border border-white/10 p-4 rounded-xl mb-4 text-center text-lg focus:border-yellow-500 outline-none transition-all"
            placeholder={t.search_placeholder}
          />
          <button 
            onClick={() => triggerNotif(t.notif_linked)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-transform"
          >
            {t.check}
          </button>
        </div>

        {/* النتائج تظهر هنا فقط عند وجود بيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بطاقة الرصيد والسمعة */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] p-6 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-sm mb-2">{t.score_title}</p>
            <div className="text-5xl font-black text-yellow-500 mb-6">85<span className="text-xl text-gray-600">/100</span></div>
            <hr className="border-white/5 mb-6" />
            <p className="text-gray-400 text-sm mb-1">{t.balance}</p>
            <div className="text-3xl font-mono">1,450.25 <span className="text-yellow-500">π</span></div>
          </motion.div>

          {/* قائمة المعاملات الاحترافية */}
          <div className="bg-[#111] p-6 rounded-3xl border border-white/5">
            <h3 className="mb-4 font-bold text-gray-300">{t.transactions}</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-[#050505] p-3 rounded-xl border-l-4 border-green-500">
                  <div>
                    <div className="text-sm font-bold">Received Pi</div>
                    <div className="text-[10px] text-gray-500">2023-12-25</div>
                  </div>
                  <div className="text-green-500 font-mono">+50.00</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* نظام الإشعارات الطافي */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-yellow-600 text-black px-6 py-3 rounded-full font-bold shadow-2xl z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
