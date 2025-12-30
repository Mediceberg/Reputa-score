"use client"

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* استبدال الصورة بشعار CSS احترافي لتجنب خطأ Figma */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Reputa Score
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">v2.5 • Pi Network</p>
              </div>
            </div>
            {hasProAccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg animate-bounce">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">Pro Member</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
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

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 font-medium">
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

// --- Helper Functions ---
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
    const isReceived = random(0, i + 1) % 2 === 0;
    return {
      id: `tx_${seed}_${i}`,
      type: isReceived ? 'received' : 'sent',
      amount: random(1, 100) + 0.5,
      from: isReceived ? 'G_RANDOM_SENDER' : address,
      to: isReceived ? address : 'G_RANDOM_RECEIVER',
      timestamp: new Date(),
      memo: i % 3 === 0 ? 'Pi Network' : undefined,
    };
  });

  const trustScore = Math.min(Math.round((balance / 10000) * 100 + (accountAge / 730) * 100), 100);
  
  let trustLevel: TrustLevel = 'Medium';
  if (trustScore > 85) trustLevel = 'Elite';
  else if (trustScore > 65) trustLevel = 'High';
  else if (trustScore < 30) trustLevel = 'Low';

  return {
    address,
    balance,
    accountAge,
    transactions,
    totalTransactions,
    reputaScore: trustScore * 10,
    trustLevel,
    consistencyScore: random(40, 99),
    networkTrust: random(30, 95),
    riskLevel: trustScore > 50 ? 'Low' : 'Medium',
  };
}
