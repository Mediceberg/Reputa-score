import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    // 1. جلب بيانات الحساب والرصيد
    const accountRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`);
    if (!accountRes.ok) return NextResponse.json({ isValid: false, message: "محفظة غير موجودة" }, { status: 404 });
    const accountData = await accountRes.json();

    // 2. جلب آخر 5 معاملات (Operations)
    const opsRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=5&order=desc`);
    const opsData = await opsRes.json();

    // 3. معالجة المعاملات لتظهر بشكل منظم
    const transactions = opsData._embedded.records.map((op: any) => ({
      id: op.id.substring(0, 8),
      type: op.type === 'payment' ? (op.from === walletAddress ? 'إرسال' : 'استلام') : 'أخرى',
      amount: op.amount || '0',
      from: op.from.substring(0, 5) + '...',
      to: op.to ? op.to.substring(0, 5) + '...' : '---',
      date: new Date(op.created_at).toLocaleDateString('ar-EG')
    }));

    // 4. بروتوكول حساب النقاط المطور (Reputa Protocol V2)
    const balance = parseFloat(accountData.balances.find((b: any) => b.asset_type === 'native')?.balance || "0");
    const txCount = accountData.sequence; // نستخدم التسلسل كمؤشر لنشاط المحفظة
    
    // معادلة النقاط: (الرصيد 40% + النشاط 60%) - قابلة للتوسع
    let score = Math.min(100, (balance * 0.5) + (txCount * 2)); 
    let tier = score > 80 ? 'Elite' : score > 50 ? 'Trusted' : 'New';

    return NextResponse.json({ 
      isValid: true, 
      balance, 
      score: Math.floor(score),
      tier,
      transactions 
    });

  } catch (error) {
    return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
