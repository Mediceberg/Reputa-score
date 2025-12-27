import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    // فحص الصيغة لضمان عدم إرسال طلبات خاطئة للبلوكشين
    if (!walletAddress || walletAddress.length !== 56 || !walletAddress.startsWith('G')) {
      return NextResponse.json({ isValid: false, message: "Invalid Wallet Format" }, { status: 400 });
    }

    // جلب بيانات الحساب والرصيد (Testnet حالياً)
    const res = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ isValid: false, message: "Wallet Not Found" }, { status: 404 });
    const data = await res.json();

    // جلب آخر 20 عملية لتحليل السلوك المالي
    const opsRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=20&order=desc`);
    const opsData = await opsRes.json();

    let dexTrades = 0;
    let spamPenalty = 0;
    
    const transactions = opsData._embedded.records.map((op: any) => {
      const amount = parseFloat(op.amount || "0");
      // كشف المعاملات الصغيرة جداً (Spam Detection)
      if (amount > 0 && amount < 0.01) spamPenalty += 2;
      // كشف نشاط التداول (DEX Detection)
      if (op.type.includes('offer')) dexTrades++;

      return {
        id: op.id.substring(0, 8),
        type: op.type === 'payment' ? (op.from === walletAddress ? 'OUT' : 'IN') : 'DEX',
        amount: amount,
        isSpam: amount > 0 && amount < 0.01,
        date: new Date(op.created_at).toISOString()
      };
    });

    const balance = parseFloat(data.balances.find((b: any) => b.asset_type === 'native')?.balance || "0");
    
    // معادلة السمعة العادلة (توازن بين الرصيد والنشاط والنوعية)
    // التقدم يصبح أصعب كلما اقتربت من 100
    const rawScore = (balance * 0.15) + (data.sequence * 0.4) + (dexTrades * 5);
    const finalScore = Math.min(99, Math.floor(Math.log10(rawScore + 1) * 35) - spamPenalty);

    return NextResponse.json({ 
      isValid: true, 
      score: Math.max(5, finalScore), // الحد الأدنى 5 لضمان رغبة المستخدم في الزيادة
      balance,
      transactions,
      tier: finalScore > 85 ? 'Institutional' : finalScore > 60 ? 'Pro Trader' : 'Pioneer'
    });
  } catch (error) {
    return NextResponse.json({ error: "Blockchain Sync Error" }, { status: 500 });
  }
}
