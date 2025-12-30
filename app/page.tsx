"use client"

import React, { useState, useEffect } from 'react';
// استخدام @ هو الأضمن للمسارات في Next.js
import { WalletChecker } from '@/components/WalletChecker';
import { WalletAnalysis } from '@/components/WalletAnalysis';
import { AccessUpgradeModal } from '@/components/AccessUpgradeModal';

export default function App() {
  const [walletData, setWalletData] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // لضمان توافق الواجهة مع السيرفر (Hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletCheck = (address: string) => {
    // المحرك الخاص بك لتوليد البيانات (v2.5)
    const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    const scoreRaw = Math.round(random(30, 95));
    
    setWalletData({
      address,
      balance: random(100, 10000),
      accountAge: random(30, 730),
      transactions: [], 
      totalTransactions: random(10, 500),
      reputaScore: scoreRaw * 10,
      trustLevel: scoreRaw >= 90 ? 'Elite' : scoreRaw >= 70 ? 'High' : scoreRaw >= 50 ? 'Medium' : 'Low',
      consistencyScore: random(40, 98),
      networkTrust: random(30, 95),
      riskLevel: scoreRaw > 60 ? 'Low' : 'Medium',
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
              R
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Reputa Score
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">v2.5 • Pi Network</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {!walletData ? (
          <WalletChecker onCheck={handleWalletCheck} />
        ) : (
          <WalletAnalysis
            walletData={walletData}
            isProUser={hasProAccess}
            onReset={() => setWalletData(null)}
            onUpgradePrompt={() => setIsUpgradeModalOpen(true)}
          />
        )}
      </main>

      <footer className="border-t bg-white/50 py-8 mt-auto text-center">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
          © 2025 Reputa Analytics • Powered by Pi Network
        </p>
      </footer>

      <AccessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={() => {
          setHasProAccess(true);
          setIsUpgradeModalOpen(false);
        }}
      />
    </div>
  );
}
