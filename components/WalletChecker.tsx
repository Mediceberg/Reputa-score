"use client"

import { useState } from 'react';
import { Search, Shield, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface WalletCheckerProps {
  onCheck: (address: string) => void;
}

export function WalletChecker({ onCheck }: WalletCheckerProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    if (!address.startsWith('G')) {
      setError('Pi Network addresses must start with "G"');
      return;
    }
    if (address.length < 20) {
      setError('Invalid wallet address format');
      return;
    }
    setError('');
    onCheck(address.trim());
  };

  const handleTryDemo = () => {
    const demoAddress = 'GBEXAMPLEPINETWORKWALLETADDRESS123456789ABCDEFGH';
    setAddress(demoAddress);
    setError('');
    onCheck(demoAddress);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl rounded-full"></div>
          {/* تم استبدال img بـ div يحمل نفس الشكل والتصميم */}
          <div className="w-32 h-32 bg-purple-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl relative z-10">
            R
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Decode Wallet Behavior
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
          Discover what your Pi Network wallet reveals about trust, consistency, and reputation.
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Advanced on-chain intelligence • No private keys required
        </p>
      </div>

      <Card className="p-8 shadow-xl border-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="wallet-address" className="block mb-2 font-semibold">
              Enter Wallet Address
            </label>
            <div className="relative">
              <Input
                id="wallet-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="pr-12 h-14 text-lg font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              Analyze Wallet
            </Button>
            <Button type="button" variant="outline" onClick={handleTryDemo} className="h-12">
              Try Demo
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Privacy First</p>
              <p className="text-blue-700">
                This app only uses public blockchain data. We never ask for private keys or seed phrases.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* بقية قسم المميزات (Features Grid) تظل كما هي في ملفك الأصل */}
    </div>
  );
}
