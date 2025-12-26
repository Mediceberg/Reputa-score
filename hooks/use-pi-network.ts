export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    if (typeof window === "undefined" || !(window as any).Pi) {
      console.error("Pi SDK not found. Please open in Pi Browser.");
      return null;
    }

    try {
      // بدء عملية الدفع عبر Pi SDK
      const payment = await (window as any).Pi.createPayment({
        amount: 1,
        memo: "Premium Verification Payment",
        metadata: { walletAddress },
      }, {
        // الموافقة على الدفع من خلال الـ API الخاص بك
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        // إكمال عملية الدفع بعد نجاحها في البلوكشين
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
        },
        onCancel: (paymentId: string) => console.log("Payment Cancelled", paymentId),
        onError: (error: Error, paymentId?: string) => console.error("Payment Error", error),
      });

      return payment;
    } catch (e) {
      console.error("Critical Payment Failure", e);
      return null;
    }
  };

  return { createPayment };
}
