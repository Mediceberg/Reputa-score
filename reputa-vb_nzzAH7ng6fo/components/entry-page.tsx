"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet } from "lucide-react"

interface EntryPageProps {
  onConnect: (address: string) => void
}

export function EntryPage({ onConnect }: EntryPageProps) {
  const [address, setAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      onConnect(address.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 glow-purple">
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] mb-4 glow-gold"
            >
              <Wallet className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] bg-clip-text text-transparent mb-2"
            >
              REPUTA
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-muted-foreground"
            >
              Trust Score Terminal
            </motion.p>
          </div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="wallet" className="text-sm font-medium text-foreground/80 mb-2 block">
                Pi Wallet Address
              </label>
              <Input
                id="wallet"
                type="text"
                placeholder="Enter your Pi wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-[var(--purple)] transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] hover:opacity-90 transition-opacity text-white font-semibold py-6"
              disabled={!address.trim()}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Pi Wallet
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 text-center text-xs text-muted-foreground"
          >
            Secure • Decentralized • Transparent
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
