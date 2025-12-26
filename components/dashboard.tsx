"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, CreditCard } from "lucide-react";
import { usePiNetwork } from "@/hooks/use-pi-network";

interface DashboardProps {
  walletAddress: string;
  username?: string;
  onDisconnect: () => void;
}

export function Dashboard({ walletAddress, username, onDisconnect }: DashboardProps) {
  const { createPayment } = usePiNetwork();
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePremiumVerification = async () => {
    setIsProcessingPayment(true);
    try {
      const paymentId = await createPayment(walletAddress);
      if (paymentId) setIsPremium(true);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed: " + error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">@{username}</h1>
      <p>{walletAddress}</p>

      {!isPremium && (
        <Button onClick={handlePremiumVerification} disabled={isProcessingPayment}>
          {isProcessingPayment ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Crown className="w-4 h-4 mr-2" />
          )}
          {isProcessingPayment ? "Processing..." : "Verify for 1 Pi"}
        </Button>
      )}

      {isPremium && <p className="text-green-500 font-bold">✅ Premium Verified</p>}

      <Button onClick={onDisconnect}>Disconnect</Button>
    </div>
  );
}
