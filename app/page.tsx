"use client"

import React, { useState } from 'react';
// استخدام @ يحل مشكلة المسارات نهائياً في Next.js
import { WalletChecker } from '@/components/WalletChecker';
import { WalletAnalysis } from '@/components/WalletAnalysis';
import { AccessUpgradeModal } from '@/components/AccessUpgradeModal';

// تعريف الأنواع لضمان عدم وجود أخطاء TypeScript
export type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  memo?: string;
}

export interface WalletData {
  address: string;
  balance: number;
  accountAge: number;
  transactions: Transaction[];
  totalTransactions: number;
  reputaScore: number;
  trustLevel: TrustLevel;
  consistencyScore: number;
  networkTrust: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export default function App() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);

  const handleWalletCheck = (address: string) => {
    // المحرك الخاص بك لتوليد البيانات
    const data = generateMockWalletData(address);
    setWalletData(data);
  };

  const handleReset = () => setWalletData(null);
  const handleUpgradePrompt = () => setIsUpgradeModalOpen(true);
  const handleAccessUpgrade = () => {
    setHasProAccess(true);
    setIsUpgradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-lg text-white font-black text-xl shadow-lg shadow-purple-200">
              R
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent leading-tight">
                Reputa Score
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">v2.5 • Pi Network</p>
            </div>
          </div>
          {hasProAccess && (
            <div className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-md transform hover:scale-105 transition-transform cursor-default">
              <span className="text-xs font-black text-white uppercase tracking-tighter">Pro Member</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!walletData ? (
          <div className="max-w-xl mx-auto">
             <WalletChecker onCheck={handleWalletCheck} />
          </div>
        ) : (
          <WalletAnalysis
            walletData={walletData}
            isProUser={hasProAccess}
            onReset={handleReset}
            onUpgradePrompt={handleUpgradePrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">
            © 2025 Reputa Analytics • Powered by Pi Network Blockchain
          </p>
        </div>
      </footer>

      {/* Modal */}
      <AccessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleAccessUpgrade}
      />
    </div>
  );
}

// دالة المحرك (Logic) - تم نقلها خارج المكون لضمان استقرار الأداء
function generateMockWalletData(address: string): WalletData {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const balance = random(100, 10000);
  const accountAge = random(30, 730);
  const totalTransactions = random(10, 500);
  const scoreRaw = Math.round(random(30, 95));

  return {
    address,
    balance,
    accountAge,
    transactions: [],
    totalTransactions,
    reputaScore: scoreRaw * 10,
    trustLevel: scoreRaw >= 90 ? 'Elite' : scoreRaw >= 70 ? 'High' : scoreRaw >= 50 ? 'Medium' : 'Low',
    consistencyScore: random(40, 98),
    networkTrust: random(30, 95),
    riskLevel: scoreRaw > 65 ? 'Low' : scoreRaw > 45 ? 'Medium' : 'High',
  };
}
