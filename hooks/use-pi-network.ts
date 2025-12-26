"use client";

export function usePiNetwork() {
  const createPayment = (walletAddress: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Pi = (window as any).Pi;
      if (!Pi) return reject("Pi SDK not found");

      // Authenticate user
      Pi.authenticate(
        ["username", "payments"],
        (auth: any) => {
          console.log("Authenticated user:", auth);

          // Create Payment
          Pi.createPayment(
            { amount: 1, memo: "Premium Verification", metadata: { walletAddress } },
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
        },
        (err: any) => reject(err)
      );
    });
  };

  return { createPayment };
}
