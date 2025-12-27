"use client"
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { EntryPage } from "@/components/entry-page"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [username, setUsername] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true);
    if (window.Pi) {
      window.Pi.authenticate(['payments', 'username'], (payment: any) => {})
        .catch((err: any) => console.log(err));
    }
  }, []);

  if (!isMounted) return null;

  const handleConnect = (address: string, piUser?: string) => {
    setWalletAddress(address);
    if (piUser) setUsername(piUser);
    setIsConnected(true);
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <EntryPage key="entry" onConnect={handleConnect} />
        ) : (
          <Dashboard 
            key="dashboard" 
            walletAddress={walletAddress} 
            username={username} 
            onDisconnect={() => setIsConnected(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
