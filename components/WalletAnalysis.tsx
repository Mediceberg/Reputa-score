"use client"

import { ArrowLeft, Sparkles, TrendingUp, Activity, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { TrustGauge } from './TrustGauge';
import { TransactionList } from './TransactionList';
import { AuditReport } from './AuditReport';

interface WalletAnalysisProps {
  walletData: any; // استخدام any مؤقتاً لضمان التوافق
  isProUser: boolean;
  onReset: () => void;
  onUpgradePrompt: () => void;
}

export function WalletAnalysis({ 
  walletData, 
  isProUser, 
  onReset, 
  onUpgradePrompt 
}: WalletAnalysisProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getBadgeInfo = () => {
    switch (walletData.trustLevel) {
      case 'Elite':
        return { label: 'Elite Wallet', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
      case 'High':
        return { label: 'Trusted Wallet', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'Medium':
        return { label: 'Moderate Trust', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { label: 'Limited Trust', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onReset} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Check Another Wallet
        </Button>
        {!isProUser && (
          <Button
            onClick={onUpgradePrompt}
            className="gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro
          </Button>
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-yellow-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
            <p className="font-mono font-semibold text-lg">{formatAddress(walletData.address)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className="font-bold text-2xl text-purple-600">
              {walletData.balance.toFixed(2)} π
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox icon={<TrendingUp className="text-purple-600 w-5 h-5" />} label="Reputa Score" value={`${walletData.reputaScore}/1000`} />
          <StatBox icon={<Activity className="text-blue-600 w-5 h-5" />} label="Transactions" value={walletData.totalTransactions} />
          <StatBox icon={<Clock className="text-green-600 w-5 h-5" />} label="Account Age" value={`${walletData.accountAge} days`} />
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badgeInfo.bgColor}`}>
               <Shield className={`w-5 h-5 ${badgeInfo.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`font-bold text-sm ${badgeInfo.color}`}>{badgeInfo.label}</p>
            </div>
          </div>
        </div>
      </Card>

      <TrustGauge 
        score={walletData.reputaScore} 
        trustLevel={walletData.trustLevel}
        consistencyScore={walletData.consistencyScore}
        networkTrust={walletData.networkTrust}
      />

      <TransactionList transactions={walletData.transactions} walletAddress={walletData.address} />

      <AuditReport 
        walletData={walletData} 
        isProUser={isProUser}
        onUpgradePrompt={onUpgradePrompt}
      />
    </div>
  );
}

function StatBox({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

import { Shield } from 'lucide-react';
