export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    const Pi = (window as any).Pi;
    
    if (typeof window === "undefined" || !Pi) {
      console.error("Pi SDK not found. Please open in Pi Browser.");
      return null;
    }

    try {
      // 1. طلب التوثيق وصلاحية المدفوعات (هذا الجزء المفقود في كودك الحالي)
      const scopes = ['payments', 'username'];
      const auth = await Pi.authenticate(scopes, (payment: any) => {
        console.log("Incomplete payment found:", payment);
      });

      alert("تم التوثيق بنجاح للمستخدم: " + auth.user.username);

      // 2. بدء عملية الدفع عبر Pi SDK
      const payment = await Pi.createPayment({
        amount: 1,
        memo: "Premium Verification Payment",
        metadata: { walletAddress },
      }, {
        // الـ API الخاص بك للموافقة على الدفع
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        // الـ API الخاص بك لإكمال عملية الدفع
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
        },
        onCancel: (paymentId: string) => alert("تم إلغاء عملية الدفع"),
        onError: (error: Error) => alert("خطأ في الدفع: " + error.message),
      });

      return payment;
    } catch (e: any) {
      alert("خطأ في التوثيق أو الدفع: " + e.message);
      return null;
    }
  };

  return { createPayment };
}
