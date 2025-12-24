"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface TrustScoreGaugeProps {
  score: number
}

export function TrustScoreGauge({ score }: TrustScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = () => {
    if (score >= 80) return "var(--elite)"
    if (score >= 60) return "var(--trusted)"
    if (score >= 40) return "var(--casual)"
    return "var(--new)"
  }

  const getScoreTier = () => {
    if (score >= 80) return "ELITE"
    if (score >= 60) return "TRUSTED"
    if (score >= 40) return "CASUAL"
    return "NEW"
  }

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  return (
    <div className="glass rounded-2xl p-6 md:p-8 glow-purple">
      <h2 className="text-lg font-semibold mb-6 text-center">Trust Score</h2>
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="90" stroke="var(--muted)" strokeWidth="12" fill="none" opacity="0.2" />
            {/* Animated Progress Circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="90"
              stroke={getScoreColor()}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 8px ${getScoreColor()})`,
              }}
            />
          </svg>

          {/* Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <div className="text-6xl md:text-7xl font-bold" style={{ color: getScoreColor() }}>
                {displayScore}
              </div>
              <div className="text-sm text-muted-foreground mt-2">out of 100</div>
              <div className="text-xl font-semibold mt-2" style={{ color: getScoreColor() }}>
                {getScoreTier()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
