"use client"

import React, { useState } from 'react';
import { WalletChecker } from '@/components/WalletChecker';
import { WalletAnalysis } from '@/components/WalletAnalysis';
import { AccessUpgradeModal } from '@/components/AccessUpgradeModal';

export default function App() {
  const [walletData, setWalletData] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold">R</div>
           <span className="font-bold text-xl">Reputa Score</span>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {!walletData ? (
          <WalletChecker onCheck={(addr) => setWalletData({ address: addr, reputaScore: 750, trustLevel: 'High' })} />
        ) : (
          <WalletAnalysis 
            walletData={walletData} 
            isProUser={hasProAccess} 
            onReset={() => setWalletData(null)} 
            onUpgradePrompt={() => setIsUpgradeModalOpen(true)} 
          />
        )}
      </main>

      <AccessUpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onUpgrade={() => { setHasProAccess(true); setIsUpgradeModalOpen(false); }} 
      />
    </div>
  );
}
