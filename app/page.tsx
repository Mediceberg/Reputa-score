"use client"

import { useState } from 'react';
// استيراد المكونات بناءً على الملفات الموجودة في صورتك بالضبط
import { WalletChecker } from '../components/WalletChecker';
import { WalletAnalysis } from '../components/WalletAnalysis';
import { AccessUpgradeModal } from '../components/AccessUpgradeModal';

// الأنواع والمنطق البرمجي الخاص بك (v2.5)
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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-lg text-white font-black text-xl">
                R
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Reputa Score
                </h1>
                <p className="text-xs text-gray-500">v2.5 • Pi Network</p>
              </div>
            </div>
            {hasProAccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg">
                <span className="text-sm font-semibold text-white">Pro Member</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!walletData ? (
          <WalletChecker onCheck={handleWalletCheck} />
        ) : (
          <WalletAnalysis
            walletData={walletData}
            isProUser={hasProAccess}
            onReset={handleReset}
            onUpgradePrompt={handleUpgradePrompt}
          />
        )}
      </main>

      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500 font-medium">
            © 2025 Reputa Analytics. Powered by Pi Network Blockchain.
          </p>
        </div>
      </footer>

      <AccessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleAccessUpgrade}
      />
    </div>
  );
}

// دالة توليد البيانات (المحرك الخاص بك)
function generateMockWalletData(address: string): WalletData {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const balance = random(100, 10000);
  const accountAge = random(30, 730);
  const totalTransactions = random(10, 500);
  const trustScore = Math.round(random(30, 95));

  return {
    address,
    balance,
    accountAge,
    transactions: [], // يمكنك ملؤها لاحقاً
    totalTransactions,
    reputaScore: trustScore * 10,
    trustLevel: trustScore >= 90 ? 'Elite' : trustScore >= 70 ? 'High' : trustScore >= 50 ? 'Medium' : 'Low',
    consistencyScore: random(0, 100),
    networkTrust: random(0, 100),
    riskLevel: trustScore > 60 ? 'Low' : 'Medium',
  };
}
