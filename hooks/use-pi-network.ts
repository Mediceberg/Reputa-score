// hooks/use-pi-network.ts
export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    const Pi = (window as any).Pi;
    if (!Pi) return null;

    try {
      // 1. طلب التوثيق مع صلاحية المدفوعات (هذا هو الكود الذي سألته عنه)
      // يجب أن يتم هذا قبل createPayment
      const auth = await Pi.authenticate(['payments', 'username'], (payment: any) => {
        console.log("Incomplete payment found:", payment);
        // هنا يمكنك معالجة المدفوعات غير المكتملة إذا أردت
      });

      alert("تم التوثيق بنجاح للمستخدم: " + auth.user.username);

      // 2. الآن نطلب عملية الدفع بعد التأكد من الصلاحيات
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
          await fetch('/api/pi/complete', { // تأكد من وجود هذا الـ API أيضاً
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
