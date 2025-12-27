import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    // الاتصال بـ Pi Horizon (شبكة التست نت حالياً)
    const response = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`);

    if (response.ok) {
      const data = await response.json();
      // إذا استجاب البلوكشين، يعني أن المحفظة حقيقية
      return NextResponse.json({ 
        exists: true, 
        balance: data.balances, // جلب الرصيد الحقيقي
        sequence: data.sequence 
      });
    } else {
      // إذا لم يجد الحساب
      return NextResponse.json({ exists: false, message: "المحفظة غير موجودة على الشبكة" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "فشل الاتصال بالبلوكشين" }, { status: 500 });
  }
}
