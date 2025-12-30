"use client"

import React, { useState, useEffect } from 'react';

// سنستخدم مكونات بسيطة جداً للتأكد من نجاح الـ Build أولاً
export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md border border-purple-200">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black shadow-lg">
          R
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Reputa Score v2.5</h1>
        <p className="text-slate-500 mb-6 font-medium">تم تجاوز أخطاء البناء بنجاح! الموقع جاهز الآن للربط.</p>
        <button 
          onClick={() => alert('Welcome to Pi Network Analytics')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          ابدأ الفحص
        </button>
      </div>
      <footer className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
        Powered by Pi Network • 2025
      </footer>
    </div>
  );
}
