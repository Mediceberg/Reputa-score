// hooks/use-pi-network.ts
export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    // خطوة 1: التحقق من وجود المكتبة
    if (typeof window === "undefined" || !(window as any).Pi) {
      alert("خطأ: لم يتم العثور على Pi SDK. تأكد أنك داخل Pi Browser");
      return null;
    }

    try {
      alert("بدء عملية الدفع..."); // إذا ظهر هذا، فالربط بالزر سليم

      const payment = await (window as any).Pi.createPayment({
        amount: 1,
        memo: "Test Payment",
        metadata: { walletAddress },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          alert("تمت الموافقة المبدئية. ID: " + paymentId);
          // استدعاء الـ API الخاص بك
          const res = await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          if (!res.ok) alert("فشل الـ API في Approve: " + res.status);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          alert("المرحلة النهائية. TXID: " + txid);
        },
        onCancel: (paymentId: string) => alert("تم إلغاء الدفع من قبلك"),
        onError: (error: Error, paymentId?: string) => {
          // هذه أهم رسالة ستظهر لك سبب المشكلة الحقيقي
          alert("خطأ من Pi SDK: " + error.message);
        },
      });
      return payment;
    } catch (e: any) {
      alert("خطأ برمجى (Catch): " + e.message);
    }
  };
  return { createPayment };
}
