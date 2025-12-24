"use client"

import { motion } from "framer-motion"
import { Crown, Shield, Users, Sparkles } from "lucide-react"

interface TierCardsProps {
  currentScore: number
}

const tiers = [
  {
    name: "Elite",
    threshold: 80,
    icon: Crown,
    color: "var(--elite)",
    glowClass: "glow-gold",
    description: "Premium trust level",
  },
  {
    name: "Trusted",
    threshold: 60,
    icon: Shield,
    color: "var(--trusted)",
    glowClass: "glow-purple",
    description: "High reputation",
  },
  {
    name: "Casual",
    threshold: 40,
    icon: Users,
    color: "var(--casual)",
    glowClass: "glow-pink",
    description: "Active member",
  },
  {
    name: "New",
    threshold: 0,
    icon: Sparkles,
    color: "var(--new)",
    glowClass: "glow-blue",
    description: "Getting started",
  },
]

export function TierCards({ currentScore }: TierCardsProps) {
  const currentTier = tiers.find((tier, index) => {
    const nextTier = tiers[index + 1]
    return currentScore >= tier.threshold && (!nextTier || currentScore < nextTier.threshold)
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reputation Tiers</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiers.map((tier, index) => {
          const Icon = tier.icon
          const isActive = currentTier?.name === tier.name
          const isUnlocked = currentScore >= tier.threshold

          return (
            <motion.div
              key={tier.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`glass rounded-xl p-4 transition-all ${
                isActive ? tier.glowClass : ""
              } ${!isUnlocked ? "opacity-50" : ""}`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                style={{
                  backgroundColor: `${tier.color}20`,
                  border: `2px solid ${tier.color}`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: tier.color }} />
              </div>
              <h3
                className="text-sm font-semibold text-center mb-1"
                style={{ color: isActive ? tier.color : "inherit" }}
              >
                {tier.name}
              </h3>
              <p className="text-xs text-muted-foreground text-center mb-2">{tier.description}</p>
              <div className="text-center">
                <span className="text-xs font-mono" style={{ color: tier.color }}>
                  {tier.threshold}+ score
                </span>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-center text-xs font-semibold"
                  style={{ color: tier.color }}
                >
                  CURRENT
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
