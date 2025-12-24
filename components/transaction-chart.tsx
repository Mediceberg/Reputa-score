"use client"

import { motion } from "framer-motion"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan", volume: 45, transactions: 12 },
  { date: "Feb", volume: 89, transactions: 24 },
  { date: "Mar", volume: 156, transactions: 38 },
  { date: "Apr", volume: 234, transactions: 52 },
  { date: "May", volume: 312, transactions: 67 },
  { date: "Jun", volume: 423, transactions: 89 },
  { date: "Jul", volume: 567, transactions: 112 },
]

export function TransactionChart() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Transaction History</h2>
        <p className="text-sm text-muted-foreground">Volume and activity over time</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="var(--purple)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVolume)"
            />
            <Area
              type="monotone"
              dataKey="transactions"
              stroke="var(--gold)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTransactions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--purple)" }} />
          <span className="text-xs text-muted-foreground">Volume (Pi)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--gold)" }} />
          <span className="text-xs text-muted-foreground">Transactions</span>
        </div>
      </div>
    </motion.div>
  )
}
