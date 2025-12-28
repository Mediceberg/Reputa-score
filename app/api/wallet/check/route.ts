import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress?.startsWith('G')) return NextResponse.json({ isValid: false, message: "عنوان غير صحيح" });

    // جلب بيانات الحساب + آخر 20 معاملة لتعميق التحليل
    const [accRes, opsRes] = await Promise.all([
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}`, { cache: 'no-store' }),
      fetch(`https://api.testnet.minepi.com/accounts/${walletAddress}/operations?limit=20&order=desc`, { cache: 'no-store' })
    ]);

    if (!accRes.ok) return NextResponse.json({ isValid: false, message: "المحفظة غير موجودة في الشبكة" });

    const accData = await accRes.json();
    const opsData = await opsRes.json();

    const balance = parseFloat(accData.balances.find((b: any) => b.asset_type === 'native')?.balance || "0");
    const sequence = accData.sequence; // عدد المعاملات الكلية المرسلة
    const transactions = opsData._embedded.records;

    // --- بروتوكول السمعة المطور (Reputation Protocol v2) ---
    // 1. وزن الرصيد (30%): كل 1000 باي تعطي 30 نقطة كحد أقصى
    const balanceScore = Math.min(30, (balance / 1000) * 30);
    
    // 2. وزن النشاط التاريخي (40%): يعتمد على الـ Sequence
    const activityScore = Math.min(40, (sequence / 50) * 40);
    
    // 3. وزن التفاعل الأخير (30%): يعتمد على عدد العمليات في السجل الحالي
    const recencyScore = Math.min(30, (transactions.length / 20) * 30);

    const totalScore = Math.floor(balanceScore + activityScore + recencyScore);

    // تنظيم بيانات المعاملات بشكل مفصل
    const formattedTransactions = transactions.map((op: any) => ({
      id: op.id.substring(0, 8),
      type: op.type === 'payment' ? (op.from === walletAddress ? 'إرسال' : 'استلام') : 'تفاعل عقد',
      amount: op.amount || '0',
      from: op.from || 'System',
      to: op.to || walletAddress,
      date: new Date(op.created_at).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    }));

    return NextResponse.json({ 
      isValid: true, 
      balance: balance.toFixed(2), 
      score: totalScore, 
      transactions: formattedTransactions,
      stats: {
        totalOps: sequence,
        accountAge: accData.paging_token ? "قديم" : "جديد"
      }
    });
  } catch (e) { 
    return NextResponse.json({ error: "فشل في الاتصال بالبلوكشين" }, { status: 500 }); 
  }
}
