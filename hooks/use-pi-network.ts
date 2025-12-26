export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    const Pi = (window as any).Pi;
    if (!Pi) return null;

    try {
      const auth = await Pi.authenticate(['payments', 'username'], (payment: any) => {
        console.log("Incomplete payment found:", payment);
      });

      alert("تم التوثيق بنجاح للمستخدم: " + auth.user.username);

      const payment = await Pi.createPayment({
        amount: 1,
        memo: "Premium Verification Payment",
        metadata: { walletAddress },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
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
        onCancel: (paymentId: string) => alert("تم إلغاء العملية"),
        onError: (error: Error) => alert("خطأ: " + error.message),
      });

      return payment;
    } catch (e: any) {
      alert("خطأ في التوثيق أو الدفع: " + e.message);
      return null;
    }
  };

  return { createPayment };
}
