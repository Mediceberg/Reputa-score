"use client"

import { useState } from 'react';
// تأكد أن المكونات موجودة فعلاً في مجلد app/components/
import { WalletChecker } from './components/WalletChecker';
import { WalletAnalysis } from './components/WalletAnalysis';
import { AccessUpgradeModal } from './components/AccessUpgradeModal';

// --- Types & Interfaces ---
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 font-sans">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Reputa Score
                </h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">v2.5 • Pi Network</p>
              </div>
            </div>
            {hasProAccess && (
              <div className="px-4 py-1 bg-yellow-400 rounded-full shadow-sm">
                <span className="text-[10px] font-black text-white uppercase">Pro Member</span>
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

      <footer className="border-t bg-white/50 py-6 mt-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-gray-400 font-medium">
            © 2025 Reputa Analytics. Powered by Pi Network.
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

// --- Helper Functions ---
function generateMockWalletData(address: string): WalletData {
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const balance = random(100, 5000);
  const accountAge = random(30, 500);
  
  return {
    address,
    balance,
    accountAge,
    transactions: [],
    totalTransactions: random(5, 100),
    reputaScore: random(400, 950),
    trustLevel: 'High',
    consistencyScore: random(50, 90),
    networkTrust: random(60, 95),
    riskLevel: 'Low',
  };
}
