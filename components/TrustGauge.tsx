import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // إصلاح الخطأ الأول
import { ShieldCheck, ShieldAlert, ShieldBan, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

// إصلاح الخطأ الثاني: تعريف النوع محلياً بدلاً من استيراده من ملف غير موجود
type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

interface TrustGaugeProps {
  score: number;
  trustLevel: TrustLevel;
  consistencyScore?: number;
  networkTrust?: number;
}

export function TrustGauge({ score, trustLevel }: TrustGaugeProps) {
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

  const gaugeColor = getGaugeColor(trustLevel);
  const rotation = ((score / 10) / 100) * 180 - 90;

  return (
    <Card className="p-6 bg-zinc-900/80 border-white/5 text-white rounded-[35px] shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bold text-xl tracking-tight">Trust Intelligence</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Reputa AI</span>
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
            <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="#27272a" strokeWidth="12" strokeLinecap="round" />
            <motion.path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animatedScore / 1000 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center translate-y-2">
             <span className="font-black text-5xl tracking-tighter" style={{ color: gaugeColor }}>{displayScore}</span>
             <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1">Trust Score</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-white/5 border border-white/10" style={{ color: gaugeColor }}>
                {trustLevel === 'Elite' || trustLevel === 'High' ? <ShieldCheck /> : <ShieldAlert />}
             </div>
             <div>
                <h3 className="font-black text-lg uppercase tracking-tight leading-none">{trustLevel} Wallet</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Status Verified</p>
             </div>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed italic">
             Our AI has analyzed this wallet behavior across the Pi Network. Current signals indicate a <b>{trustLevel.toLowerCase()}</b> reliability factor.
          </p>
        </div>
      </div>
    </Card>
  );
}
