export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    const Pi = (window as any).Pi;
    
    // التحقق من وجود المكتبة
    if (!Pi) {
      alert("الرجاء فتح التطبيق من داخل متصفح Pi Browser");
      return null;
    }

    try {
      // 1. التوثيق وطلب الصلاحيات (Scopes)
      // يجب استدعاء authenticate قبل أي عملية دفع
      const scopes = ['payments', 'username']; 
      
      const auth = await Pi.authenticate(scopes, (payment: any) => {
        // معالجة المدفوعات غير المكتملة
        console.log("Incomplete payment found:", payment);
      });

      console.log(`Hi ${auth.user.username}, ready for payment!`);

      // 2. إنشاء عملية الدفع (User-To-App)
      const payment = await Pi.createPayment({
        amount: 1,
        memo: "Premium Verification Payment",
        metadata: { walletAddress },
      }, {
        // يتم استدعاؤها عندما يكون الدفع جاهزاً للموافقة من السيرفر
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        // يتم استدعاؤها بعد اكتمال المعاملة على البلوكشين
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
        },
        onCancel: (paymentId: string) => {
          console.log("Payment cancelled:", paymentId);
        },
        onError: (error: Error, payment?: any) => {
          alert("حدث خطأ أثناء الدفع: " + error.message);
        },
      });

      return payment;
    } catch (e: any) {
      alert("فشل التوثيق: " + e.message);
      return null;
    }
  };

  return { createPayment };
}
