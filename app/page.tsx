"use client"

import { useState } from 'react';
// استخدام النقطتين (../) لأن مجلد المكونات خارج مجلد app
import { WalletChecker } from '../components/WalletChecker';
import { WalletAnalysis } from '../components/WalletAnalysis';
import { AccessUpgradeModal } from '../components/AccessUpgradeModal';

// --- الواجهات (Interfaces) تظل كما هي لضمان عمل المميزات ---
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

  const handleReset = () => setWalletData(null);
  const handleUpgradePrompt = () => setIsUpgradeModalOpen(true);
  const handleAccessUpgrade = () => {
    setHasProAccess(true);
    setIsUpgradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl">R</span>
            </div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Reputa Score
            </h1>
          </div>
          {hasProAccess && (
            <div className="px-3 py-1 bg-yellow-400 rounded-full text-[10px] font-bold text-white uppercase">
              Pro Member
            </div>
          )}
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

      <AccessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleAccessUpgrade}
      />
    </div>
  );
}

// دالة توليد البيانات تظل كما هي لضمان عمل السكور
function generateMockWalletData(address: string): WalletData {
  const seed = address.length;
  return {
    address,
    balance: 100.5,
    accountAge: 120,
    transactions: [],
    totalTransactions: 45,
    reputaScore: 850,
    trustLevel: 'High',
    consistencyScore: 90,
    networkTrust: 88,
    riskLevel: 'Low',
  };
}
