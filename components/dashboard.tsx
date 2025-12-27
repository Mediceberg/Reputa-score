"use client"
import { useState, useEffect } from "react"

export const Dashboard = ({ walletAddress, username, onDisconnect }: any) => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch('/api/wallet/check', {
          method: 'POST',
          body: JSON.stringify({ walletAddress }),
        });
        const data = await res.json();
        if (data.isValid) setWalletData(data);
      } finally { setLoading(false); }
    };
    getData();
  }, [walletAddress]);

  if (loading) return <div className="text-white p-10 text-center">جاري جلب بيانات البلوكشين...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <div className="flex justify-between mb-8">
        <h1 className="text-xl font-bold text-yellow-500">@{username}</h1>
        <button onClick={onDisconnect} className="text-xs text-gray-500">خروج</button>
      </div>

      {walletData && (
        <div className="space-y-6">
          <div className="p-8 bg-gray-900 rounded-3xl border border-purple-500 text-center">
            <p className="text-gray-400 text-sm">نقاط السمعة</p>
            <h2 className="text-6xl font-black text-purple-400">{walletData.score}</h2>
            <p className="mt-2 text-yellow-500">الرصيد: {walletData.balance} Pi</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl">
            <h3 className="mb-4 text-sm font-bold border-b border-gray-800 pb-2">آخر المعاملات الحقيقية</h3>
            {walletData.transactions.map((tx: any, i: number) => (
              <div key={i} className="flex justify-between py-3 border-b border-gray-800 text-xs">
                <span className={tx.type === 'استلام' ? 'text-green-400' : 'text-red-400'}>{tx.type}</span>
                <span>{tx.amount} Pi</span>
                <span className="text-gray-600">{tx.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};"use client"
import { useState, useEffect } from "react"

export const Dashboard = ({ walletAddress, username, onDisconnect }: any) => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch('/api/wallet/check', {
          method: 'POST',
          body: JSON.stringify({ walletAddress }),
        });
        const data = await res.json();
        if (data.isValid) setWalletData(data);
      } finally { setLoading(false); }
    };
    getData();
  }, [walletAddress]);

  if (loading) return <div className="text-white p-10 text-center">جاري جلب بيانات البلوكشين...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <div className="flex justify-between mb-8">
        <h1 className="text-xl font-bold text-yellow-500">@{username}</h1>
        <button onClick={onDisconnect} className="text-xs text-gray-500">خروج</button>
      </div>

      {walletData && (
        <div className="space-y-6">
          <div className="p-8 bg-gray-900 rounded-3xl border border-purple-500 text-center">
            <p className="text-gray-400 text-sm">نقاط السمعة</p>
            <h2 className="text-6xl font-black text-purple-400">{walletData.score}</h2>
            <p className="mt-2 text-yellow-500">الرصيد: {walletData.balance} Pi</p>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl">
            <h3 className="mb-4 text-sm font-bold border-b border-gray-800 pb-2">آخر المعاملات الحقيقية</h3>
            {walletData.transactions.map((tx: any, i: number) => (
              <div key={i} className="flex justify-between py-3 border-b border-gray-800 text-xs">
                <span className={tx.type === 'استلام' ? 'text-green-400' : 'text-red-400'}>{tx.type}</span>
                <span>{tx.amount} Pi</span>
                <span className="text-gray-600">{tx.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
