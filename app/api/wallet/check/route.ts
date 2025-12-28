import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress?.startsWith('G')) return NextResponse.json({ isValid: false, message: "عنوان غير صحيح" });

    // جلب الرصيد والعمليات من الشبكة التجريبية
    const [accRes, opsRes] = await Promise.all([
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' }),
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=5&order=desc`)
    ]);

    if (!accRes.ok) return NextResponse.json({ isValid: false, message: "المحفظة غير موجودة" });

    const accData = await accRes.json();
    const opsData = await opsRes.json();

    const balance = accData.balances.find((b: any) => b.asset_type === 'native')?.balance || "0";
    const transactions = opsData._embedded.records.map((op: any) => ({
      type: op.type === 'payment' ? (op.from === walletAddress ? 'إرسال' : 'استلام') : 'تداول',
      amount: op.amount || '0',
      date: new Date(op.created_at).toLocaleDateString('ar-EG')
    }));

    // معادلة السمعة
    const score = Math.min(100, (parseFloat(balance) * 0.2) + (accData.sequence * 1.5));

    return NextResponse.json({ isValid: true, balance, score: Math.floor(score), transactions });
  } catch (e) { return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 }); }
}
