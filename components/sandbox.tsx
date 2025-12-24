"use client"

import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import type { MockData } from "@/lib/reputation-engine"
import { DollarSign, Calendar, Network } from "lucide-react"

interface SandboxProps {
  mockData: MockData
  onDataChange: (data: MockData) => void
}

export function Sandbox({ mockData, onDataChange }: SandboxProps) {
  const handleVolumeChange = (value: number[]) => {
    onDataChange({ ...mockData, volume: value[0] })
  }

  const handleAgeChange = (value: number[]) => {
    onDataChange({ ...mockData, age: value[0] })
  }

  const handleNetworkChange = (value: number[]) => {
    onDataChange({ ...mockData, network: value[0] })
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 sticky top-6"
    >
      <h2 className="text-lg font-semibold mb-6">Sandbox Mode</h2>
      <div className="space-y-6">
        {/* Volume Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--gold)]" />
              <label className="text-sm font-medium">Volume</label>
            </div>
            <span className="text-sm font-mono text-[var(--gold)]">{mockData.volume} Pi</span>
          </div>
          <Slider
            value={[mockData.volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1000}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Total transaction volume (filters out &lt; 0.1 Pi)</p>
        </div>

        {/* Age Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--purple)]" />
              <label className="text-sm font-medium">Age</label>
            </div>
            <span className="text-sm font-mono text-[var(--purple)]">{mockData.age} days</span>
          </div>
          <Slider
            value={[mockData.age]}
            onValueChange={handleAgeChange}
            min={0}
            max={730}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Account age in days</p>
        </div>

        {/* Network Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[var(--casual)]" />
              <label className="text-sm font-medium">Network</label>
            </div>
            <span className="text-sm font-mono text-[var(--casual)]">{mockData.network} peers</span>
          </div>
          <Slider
            value={[mockData.network]}
            onValueChange={handleNetworkChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Unique network connections</p>
        </div>

        {/* Formula Display */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Formula:</h3>
          <div className="text-xs font-mono bg-background/50 p-3 rounded-lg">
            Score = (Vol × 0.4) + (Age × 0.3) + (Net × 0.3)
          </div>
        </div>
      </div>
    </motion.div>
  )
}
