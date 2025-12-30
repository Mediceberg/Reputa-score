import { useEffect, useState } from 'react';
// حل مشكلة السطر 2: تغيير motion/react إلى framer-motion
import { motion } from 'framer-motion'; 
import { ShieldCheck, ShieldAlert, ShieldBan, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

// حل مشكلة السطر 5: تعريف النوع هنا بدلاً من استيراده من ملف غير موجود
type TrustLevel = 'Low' | 'Medium' | 'High' | 'Elite';

interface TrustGaugeProps {
  score: number;
  trustLevel: TrustLevel;
}

export function TrustGauge({ score, trustLevel }: TrustGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
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

  const getGaugeColor = (level: TrustLevel) => {
    if (level === 'Elite') return '#10b981';
    if (level === 'High') return '#3b82f6';
    if (level === 'Medium') return '#eab308';
    return '#ef4444';
  };

  const gaugeColor = getGaugeColor(trustLevel);

  return (
    <Card className="p-6 bg-zinc-900/90 border-white/10 text-white rounded-[32px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Trust Intelligence</h2>
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-24">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="#333" strokeWidth="10" strokeLinecap="round" />
            <motion.path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animatedScore / 1000 }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end">
            <span className="text-3xl font-black" style={{ color: gaugeColor }}>{displayScore}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Score</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: gaugeColor }}>{trustLevel} Reputation</p>
        </div>
      </div>
    </Card>
  );
}
