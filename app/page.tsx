"use client"; // ضروري لاستخدام مكتبة Pi SDK في المتصفح

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ScoreCard from './components/ScoreCard';

// تعريف واجهة window لتجنب أخطاء TypeScript
declare global {
  interface Window {
    Pi: any;
  }
}

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const initPi = async () => {
      if (typeof window !== "undefined" && window.Pi) {
        try {
          // 1. تهيئة التطبيق (ضروري لتجاوز الخطوة 6)
          window.Pi.init({ version: "2.0", sandbox: true });

          // 2. طلب تسجيل الدخول (Authenticate) لربط حساب المستخدم
          const scopes = ['username', 'payments'];
          
          const onIncompletePaymentFound = (payment: any) => {
            console.log("Incomplete payment found", payment);
          };

          const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
          setUsername(user.user.username);
          console.log(`Welcome, ${user.user.username}`);
        } catch (err) {
          console.error("Pi SDK Error:", err);
        }
      }
    };

    initPi();
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* عرض رسالة ترحيب باسم المستخدم من Pi */}
        {username && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-400">
            Welcome back, <span className="font-bold">{username}</span>!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ScoreCard score={75} status="TRUSTED" />
          </div>

          <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Activity Analysis</h2>
            <div className="h-64 flex items-end gap-2">
               <div className="w-full h-full border-b border-l border-gray-700 flex items-center justify-center text-gray-600 italic">
                  Transaction Volume Graph (Coming Next...)
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
