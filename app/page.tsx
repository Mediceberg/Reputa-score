"use client" // إصلاح خطأ UseState: ضروري جداً لعمل الصفحات التفاعلية

import React, { useState } from 'react';

// إصلاح المسارات: استخدام @ يضمن الوصول للمجلد الصحيح وتفادي خطأ Module Not Found
import { WalletChecker } from '@/components/WalletChecker';
import { WalletAnalysis } from '@/components/WalletAnalysis';
import { AccessUpgradeModal } from '@/components/AccessUpgradeModal';

// ملاحظة: تم حذف استيراد logoImage من Figma لأنه يسبب فشل البناء (Build Error)
// سيتم استبداله بشعار نصي احترافي أو يمكنك وضع صورة في مجلد public لاحقاً

// --- الأنواع (Interfaces) ---
export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  memo?: string;
}

export type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

export interface WalletData {
  address: string;
  balance: number;
  accountAge: number; // بالقيم اليومية
  transactions: Transaction[];
  totalTransactions: number;
  reputaScore: number; // من 0 إلى 1000
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
    const mockData = generateMockWalletData(address);
    setWalletData(mockData);
  };

  const handleReset = () => {
    setWalletData(null);
  };

  const handleUpgradePrompt = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleAccessUpgrade = () => {
    setHasProAccess(true);
    setIsUpgradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* استبدال صورة Figma المكسورة بشعار CSS احترافي */}
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent leading-tight">
                  Reputa Score
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">v2.5 • Pi Network</p>
              </div>
            </div>
            
            {hasProAccess && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-md animate-pulse">
                <span className="text-[10px] font-black text-white uppercase">Pro Member</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!walletData ? (
          <div className="max-w-2xl mx-auto">
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
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            © 2025 Reputa Analytics. Powered by Pi Network Blockchain.
          </p>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <AccessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleAccessUpgrade}
      />
    </div>
  );
}

// --- Helper Functions (Logic) ---

function generateMockWalletData(address: string): WalletData {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const balance = random(100, 10000) + random(0, 99) / 100;
  const accountAge = random(30, 730);
  const totalTransactions = random(10, 500);

  const transactions: Transaction[] = Array.from({ length: 10 }, (_, i) => {
    const isReceived = random(0, 1) === 1;
    const amount = random(1, 100) + random(0, 99) / 100;
    const daysAgo = i * random(1, 5);

    return {
      id: `tx_${seed}_${i}`,
      type: isReceived ? 'received' : 'sent',
      amount,
      from: isReceived ? generateRandomAddress(seed + i) : address,
      to: isReceived ? address : generateRandomAddress(seed + i + 1),
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      memo: i % 3 === 0 ? 'Payment' : undefined,
    };
  });

  const balanceScore = Math.min((balance / 1000) * 30, 30);
  const ageScore = Math.min((accountAge / 365) * 40, 40);
  const activityScore = Math.min((totalTransactions / 100) * 30, 30);
  const trustScore = Math.round(balanceScore + ageScore + activityScore);

  const trustLevel: TrustLevel = trustScore >= 90 ? 'Elite' : trustScore >= 70 ? 'High' : trustScore >= 50 ? 'Medium' : 'Low';
  const networkTrust = random(20, 100);

  return {
    address,
    balance,
    accountAge,
    transactions,
    totalTransactions,
    reputaScore: trustScore * 10,
    trustLevel,
    consistencyScore: random(30, 95),
    networkTrust,
    riskLevel: networkTrust < 30 ? 'High' : networkTrust < 60 ? 'Medium' : 'Low',
  };
}

function generateRandomAddress(seed: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let address = 'G';
  for (let i = 0; i < 55; i++) {
    const index = Math.floor(Math.abs(Math.sin(seed + i) * 10000) % chars.length);
    address += chars[index];
  }
  return address;
}
