import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json();

    // تأكيد إتمام المعاملة نهائياً
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: { 
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    return NextResponse.json({ 
      status: "COMPLETED", 
      message: "تم فتح التقرير الاحترافي بنجاح" 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Completion Failed" }, { status: 500 });
  }
}
