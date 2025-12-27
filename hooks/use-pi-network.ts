export function usePiNetwork() {
  const createPayment = async (walletAddress: string) => {
    const Pi = (window as any).Pi;
    
    if (typeof window === "undefined" || !Pi) {
      console.error("Pi SDK not found. Please open in Pi Browser.");
      return null;
    }

    try {
      // 1. التوثيق مع معالجة المدفوعات غير المكتملة (الحل لمشكلة Pending Payment)
      const scopes = ['payments', 'username'];
      
      const auth = await Pi.authenticate(scopes, async (payment: any) => {
        // إذا وجد الـ SDK عملية دفع قديمة لم تكتمل، سيقوم بتنفيذ هذا الجزء تلقائياً
        console.log("Incomplete payment found, handling it...", payment);
        
        try {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentId: payment.identifier, 
              txid: payment.transaction.txid 
            }),
          });
          console.log("Incomplete payment resolved.");
        } catch (err) {
          console.error("Failed to resolve incomplete payment:", err);
        }
      });

      alert("تم التوثيق بنجاح للمستخدم: " + auth.user.username);

      // 2. بدء عملية دفع جديدة
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
        onCancel: (paymentId: string) => alert("تم إلغاء عملية الدفع"),
        onError: (error: Error) => {
          // إذا كان الخطأ بسبب وجود دفع معلق، سنخبر المستخدم
          if (error.message.includes("pending payment")) {
            alert("لديك عملية دفع معلقة، يرجى إعادة تحديث الصفحة ليقوم التطبيق بمعالجتها تلقائياً.");
          } else {
            alert("خطأ في الدفع: " + error.message);
          }
        },
      });

      return payment;
    } catch (e: any) {
      alert("خطأ في التوثيق أو الدفع: " + e.message);
      return null;
    }
  };

  return { createPayment };
}
