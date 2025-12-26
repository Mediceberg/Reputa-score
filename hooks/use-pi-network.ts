// hooks/use-pi-network.ts
export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    if (typeof window !== "undefined" && (window as any).Pi) {
      try {
        const payment = await (window as any).Pi.createPayment({
          amount: 1,
          memo: "Premium Verification",
          metadata: { walletAddress },
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            // استدعاء الـ API الذي أنشأته في الصورة
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
          },
          onCancel: (paymentId: string) => console.log("Cancelled"),
          onError: (error: Error, paymentId?: string) => console.error(error),
        });
        return payment;
      } catch (e) {
        console.error(e);
      }
    }
  };
  return { createPayment };
}
