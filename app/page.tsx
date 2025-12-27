"use client";
import { useState, useEffect } from 'react';

export default function ReputaApp() {
  const [user, setUser] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [lang, setLang] = useState('en');

  // 1. إعادة ربط Pi SDK (هوية التطبيق)
  useEffect(() => {
    if (window.Pi) {
      window.Pi.authenticate(['payments', 'username'], onIncompletePaymentFound)
        .then((auth: any) => setUser(auth.user))
        .catch((err: any) => console.error(err));
    }
  }, []);

  const onIncompletePaymentFound = (payment: any) => { /* معالجة الدفع المعلق */ };

  // 2. دالة الدفع الرسمية (Step 10)
  const handlePayment = async () => {
    if (!window.Pi) return;
    window.Pi.createPayment({
      amount: 1,
      memo: "Unlock Deep Reputation Report",
      metadata: { reportId: "premium_v3" }
    }, {
      onReadyForServerApproval: (id: string) => fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ id }) }),
      onReadyForServerCompletion: (id: string, tx: string) => fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ id, tx }) }),
      onCancel: () => alert("Payment Cancelled"),
      onError: (err: any) => alert("Error: " + err.message)
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Top Bar: بروفايل الرائد */}
      <header className="p-4 border-b border-yellow-500/20 flex justify-between items-center bg-[#111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center font-bold text-black">
            {user?.username?.[0]?.toUpperCase() || "P"}
          </div>
          <div>
            <p className="text-xs text-gray-500">Welcome, Pioneer</p>
            <p className="text-sm font-bold text-yellow-500">@{user?.username || "Guest"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['EN', 'AR', 'FR'].map(l => (
            <button key={l} onClick={() => setLang(l.toLowerCase())} className="text-[10px] bg-white/5 px-2 py-1 rounded">
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* المحتوى الرئيسي: محرك البحث والسمعة */}
      <main className="p-6 max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-white">REPUTA <span className="text-yellow-500">V3</span></h2>
          <p className="text-gray-500 text-sm">Pi Network Blockchain Identity Protocol</p>
        </div>

        {/* حقل البحث الاحترافي */}
        <div className="bg-[#151515] p-2 rounded-2xl border border-white/5 flex shadow-2xl">
          <input 
            className="flex-1 bg-transparent p-4 outline-none text-yellow-500 font-mono"
            placeholder="G..." 
          />
          <button className="bg-yellow-500 text-black px-6 rounded-xl font-bold text-sm">Analyze</button>
        </div>

        {/* عرض الرصيد والسمعة (عند توفر البيانات) */}
        {true && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-3xl border border-yellow-500/10 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Trust Index</p>
                  <h3 className="text-6xl font-black text-white">88<span className="text-lg text-gray-600">/100</span></h3>
                </div>
                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold border border-yellow-500/20">
                  PRO TRADER
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between">
                <div>
                  <p className="text-gray-500 text-[10px]">Current Balance</p>
                  <p className="text-xl font-mono font-bold">1,240.50 π</p>
                </div>
                <button 
                  onClick={handlePayment}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                  Get Report (1 π)
                </button>
              </div>
            </div>

            {/* سجل المعاملات الحقيقي */}
            <div className="bg-[#111] p-5 rounded-3xl border border-white/5">
              <p className="text-xs text-gray-500 mb-4 font-bold uppercase">Recent Operations</p>
              <div className="space-y-3">
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xs font-bold">IN</div>
                      <div>
                        <p className="text-xs font-bold">Received from DEX</p>
                        <p className="text-[9px] text-gray-600">ID: 88231...9a</p>
                      </div>
                    </div>
                    <p className="text-green-500 font-mono text-sm font-bold">+10.00 π</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
