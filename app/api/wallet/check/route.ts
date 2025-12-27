import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    const res = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ isValid: false, message: "Wallet Not Found" }, { status: 404 });
    const data = await res.json();

    const opsRes = await fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=20&order=desc`);
    const opsData = await opsRes.json();

    // تحليل المعاملات لكشف السبام والتداول الحقيقي
    let realTrades = 0;
    let spamCount = 0;
    const transactions = opsData._embedded.records.map((op: any) => {
      const amount = parseFloat(op.amount || "0");
      if (amount < 0.01) spamCount++; // رصد المعاملات الصغيرة جداً
      if (op.type === 'manage_buy_offer' || op.type === 'create_passive_sell_offer') realTrades++; // Pi DEX activity
      
      return {
        id: op.id.substring(0, 8),
        type: op.type,
        amount: amount,
        isSpam: amount < 0.01,
        date: op.created_at
      };
    });

    // معادلة السمعة المعقدة (Reputa V3)
    const balance = parseFloat(data.balances.find((b: any) => b.asset_type === 'native')?.balance || "0");
    const baseScore = (balance * 0.1) + (data.sequence * 0.5) + (realTrades * 10);
    const penalties = (spamCount * 5); // خصم نقاط للسبام
    
    // سقف النقاط يعتمد على اللوغاريتم ليكون التقدم أصعب كلما زادت النقاط
    const finalScore = Math.min(99, Math.floor(Math.log10(baseScore + 1) * 30) - penalties);

    return NextResponse.json({ 
      isValid: true, 
      score: Math.max(0, finalScore),
      analytics: {
        balance,
        trustLevel: finalScore > 80 ? "Institutional" : finalScore > 50 ? "Trader" : "Standard",
        spamRisk: spamCount > 10 ? "High" : "Low",
        dexActivity: realTrades > 0 ? "Active" : "Inactive"
      },
      transactions 
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
