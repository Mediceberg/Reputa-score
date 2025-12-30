import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // تأكد أنها framer-motion وليس motion/react
import { ShieldCheck, ShieldAlert, ShieldBan, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

// تعريف النوع هنا مباشرة لتجنب خطأ الاستيراد من App
export type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

interface TrustGaugeProps {
  score: number; // 0-1000
  trustLevel: TrustLevel;
  consistencyScore?: number;
  networkTrust?: number;
}

export function TrustGauge({ score, trustLevel, consistencyScore, networkTrust }: TrustGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  const getGaugeColor = (level: TrustLevel): string => {
    switch (level) {
      case 'Elite': return '#10b981';
      case 'High': return '#3b82f6';
      case 'Medium': return '#eab308';
      case 'Low': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getIcon = () => {
    if (trustLevel === 'Elite' || trustLevel === 'High') return <ShieldCheck className="w-8 h-8" />;
    if (trustLevel === 'Medium') return <ShieldAlert className="w-8 h-8" />;
    return <ShieldBan className="w-8 h-8" />;
  };

  const getDescription = () => {
    switch (trustLevel) {
      case 'Elite': return 'Exceptional reputation. Elite-level trustworthiness.';
      case 'High': return 'Strong reputation with consistent positive signals.';
      case 'Medium': return 'Moderate trust signals. Standard verification recommended.';
      case 'Low': return 'Limited trust indicators. Enhanced due diligence advised.';
      default: return '';
    }
  };

  const gaugeColor = getGaugeColor(trustLevel);
  const normalizedScore = score / 10;
  const rotation = (normalizedScore / 100) * 180 - 90;

  return (
    <Card className="p-6 bg-zinc-900/50 border-white/5 text-white rounded-[35px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl">Trust Intelligence</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase">AI Analysis</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-64 h-32 flex-shrink-0">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="#333" strokeWidth="12" strokeLinecap="round" />
            <motion.path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animatedScore / 1000 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
             <span className="font-black text-4xl" style={{ color: gaugeColor }}>{displayScore}</span>
             <p className="text-[10px] text-zinc-500 uppercase font-bold">Trust Score</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${gaugeColor}20`, color: gaugeColor }}>{getIcon()}</div>
            <h3 className="font-black text-lg uppercase tracking-tight">{trustLevel} Status</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">{getDescription()}</p>
        </div>
      </div>
    </Card>
  );
}
