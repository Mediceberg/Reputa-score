import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress?.startsWith('G')) return NextResponse.json({ isValid: false, message: "Invalid Address" });

    // جلب البيانات من Testnet
    const [accRes, opsRes] = await Promise.all([
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' }),
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=50&order=desc`, { cache: 'no-store' })
    ]);

    if (!accRes.ok) return NextResponse.json({ isValid: false, message: "Wallet not found on Network" });

    const accData = await accRes.json();
    const opsData = await opsRes.json();

    const balance = parseFloat(accData.balances.find((b: any) => b.asset_type === 'native')?.balance || "0");
    const sequence = parseInt(accData.sequence);
    const allOps = opsData._embedded.records;

    // 1. تصفية المعاملات الصفرية واختيار أول 10 فقط
    const filteredTransactions = allOps
      .filter((op: any) => {
        const amount = parseFloat(op.amount || "0");
        return amount > 0 || op.type === 'create_account'; // استبعاد المعاملات الصفرية إلا إذا كانت إنشاء حساب
      })
      .slice(0, 10) // جلب 10 فقط
      .map((op: any) => ({
        id: op.id.substring(0, 8),
        // تحويل الأنواع للإنجليزية وتفصيلها
        type: op.type === 'payment' 
          ? (op.from === walletAddress ? 'Sent' : 'Received') 
          : (op.type === 'create_account' ? 'Account Created' : 'Contract Interaction'),
        amount: op.amount || '0',
        tokenName: "Pi Token", // يمكنك لاحقاً تطوير هذا لجلب أسماء توكنات أخرى
        date: new Date(op.created_at).toLocaleString('en-US', { 
          hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' 
        })
      }));

    // بروتوكول السمعة
    const totalScore = Math.floor(
      Math.min(30, (balance / 1000) * 30) + 
      Math.min(40, (sequence / 50) * 40) + 
      Math.min(30, (filteredTransactions.length / 10) * 30)
    );

    return NextResponse.json({ 
      isValid: true, 
      balance: balance.toFixed(2), 
      score: totalScore, 
      transactions: filteredTransactions,
      stats: {
        totalOps: sequence,
        accountAge: sequence > 10 ? "Established" : "New Account"
      }
    });
  } catch (e) { 
    return NextResponse.json({ error: "Blockchain Connection Failed" }, { status: 500 }); 
  }
}
