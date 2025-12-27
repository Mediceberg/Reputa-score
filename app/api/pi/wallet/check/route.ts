import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    // التحقق من صياغة العنوان قبل إرساله
    if (!walletAddress || walletAddress.length !== 56 || !walletAddress.startsWith('G')) {
      return NextResponse.json({ isValid: false, message: "صيغة عنوان المحفظة غير صحيحة" }, { status: 400 });
    }

    // محاولة الاتصال بالبلوكشين مع توقيت زمني (Timeout)
    const response = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      
      // جلب آخر المعاملات
      const opsRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=5&order=desc`);
      const opsData = await opsRes.json();

      const transactions = opsData._embedded.records.map((op: any) => ({
        id: op.id.substring(0, 8),
        type: op.type === 'payment' ? (op.from === walletAddress ? 'إرسال' : 'استلام') : 'تحويل',
        amount: op.amount || '0',
        date: new Date(op.created_at).toLocaleDateString('ar-EG')
      }));

      const balance = data.balances.find((b: any) => b.asset_type === 'native')?.balance || "0";
      
      // بروتوكول النقاط المطور
      const score = Math.min(100, (parseFloat(balance) * 0.2) + (data.sequence * 1.5));

      return NextResponse.json({ 
        isValid: true, 
        balance, 
        score: Math.floor(score),
        transactions 
      }, { status: 200 });
    } else {
      return NextResponse.json({ isValid: false, message: "المحفظة غير موجودة على الشبكة التجريبية" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "فشل في الوصول للسيرفر الرئيسي" }, { status: 500 });
  }
}
