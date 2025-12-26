"use client";

import { useState, useEffect } from "react";

export function usePiNetwork() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Pi = (window as any).Pi;
    if (!Pi) return;

    Pi.init({ version: "2.0" });

    Pi.authenticate(
      ["username", "payments"],
      (auth: any) => {
        console.log("Authenticated:", auth);
        setUser(auth);
        setReady(true);
      },
      (err: any) => {
        console.error("Pi auth error:", err);
      }
    );
  }, []);

  const createPayment = (walletAddress: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Pi = (window as any).Pi;
      if (!Pi) return reject("Pi SDK not found");

      Pi.createPayment(
        {
          amount: 1,
          memo: "Premium Verification",
          metadata: { walletAddress },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            await fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            resolve(paymentId);
          },
          onCancel: () => reject("Payment cancelled"),
          onError: (err: any) => reject(err),
        }
      );
    });
  };

  return { ready, user, createPayment };
}
