import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    // التحقق من الصيغة (من كودك - ممتاز جداً)
    if (!walletAddress || walletAddress.length !== 56 || !walletAddress.startsWith('G')) {
      return NextResponse.json({ isValid: false, message: "صيغة العنوان غير صحيحة" }, { status: 400 });
    }

    // الاتصال بالبلوكشين
    const res = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ isValid: false, message: "المحفظة غير موجودة" }, { status: 404 });
    const data = await res.json();

    // جلب العمليات مع تفاصيل المصدر
    const opsRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=5&order=desc`);
    const opsData = await opsRes.json();

    const transactions = opsData._embedded.records.map((op: any) => ({
      id: op.id.substring(0, 8),
      type: op.type === 'payment' ? (op.from === walletAddress ? 'إرسال' : 'استلام') : 'تحويل',
      amount: op.amount || '0',
      from: op.from ? `${op.from.substring(0, 4)}...${op.from.slice(-4)}` : '---', // إضافة العنوان المختصر
      date: new Date(op.created_at).toLocaleDateString('ar-EG')
    }));

    const balance = data.balances.find((b: any) => b.asset_type === 'native')?.balance || "0";
    
    // حساب النقاط الشامل
    const score = Math.min(100, (parseFloat(balance) * 0.3) + (data.sequence * 1.3));

    return NextResponse.json({ 
      isValid: true, 
      balance, 
      score: Math.floor(score),
      transactions,
      account_age: data.sequence // مؤشر إضافي لقدم الحساب
    });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في السيرفر الرئيسي" }, { status: 500 });
  }
}
