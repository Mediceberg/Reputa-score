"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// نظام اللغات المتكامل
const content = {
  en: { check: "Analyze", score: "Reputa Score", bal: "Balance", spam: "Risk Detected" },
  ar: { check: "تحليل", score: "مؤشر السمعة", bal: "الرصيد", spam: "مخاطر مكتشفة" },
  fr: { check: "Analyser", score: "Score Reputa", bal: "Solde", spam: "Risque Détecté" }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [address, setAddress] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = content[lang as keyof typeof content];

  const performAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.isValid) setResults(data);
      else setError(data.message);
    } catch (err) {
      setError("Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      {/* تبديل اللغات */}
      <div className="flex justify-end gap-2 mb-8">
        {['en', 'ar', 'fr'].map(l => (
          <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs ${lang === l ? 'bg-yellow-500 text-black' : 'bg-white/5'}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* محرك البحث الحقيقي */}
        <section className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
          <input 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-black border border-white/10 p-5 rounded-2xl mb-4 text-center font-mono focus:border-yellow-500 transition-all outline-none"
            placeholder="G..." 
          />
          <button 
            disabled={loading}
            onClick={performAnalysis}
            className="w-full py-5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl font-black uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50"
          >
            {loading ? "..." : t.check}
          </button>
          {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
        </section>

        {/* عرض النتائج الاحترافية */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
              {/* بطاقة السمعة الدائرية (تصور) */}
              <div className="bg-[#111] p-10 rounded-3xl text-center relative overflow-hidden">
                <div className="text-sm text-gray-400 mb-2 uppercase">{t.score}</div>
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-700">
                  {results.score}
                </div>
                <div className="mt-2 text-yellow-500 font-bold tracking-widest">{results.tier}</div>
              </div>

              {/* تفاصيل الرصيد والمعاملات */}
              <div className="grid grid-cols-1 gap-4">
                {results.transactions.map((tx: any) => (
                  <div key={tx.id} className={`p-5 rounded-2xl bg-[#111] border-l-4 ${tx.isSpam ? 'border-red-600' : 'border-green-500'} flex justify-between items-center`}>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {tx.type} {tx.amount} π
                        {tx.isSpam && <span className="text-[10px] bg-red-600 px-2 rounded-full">{t.spam}</span>}
                      </div>
                      <div className="text-[10px] text-gray-500">{tx.date.split('T')[0]}</div>
                    </div>
                    <div className="text-xs text-gray-600 font-mono">#{tx.id}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
