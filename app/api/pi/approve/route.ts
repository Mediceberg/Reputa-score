import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    // إرسال موافقة فورية لمنصة Pi قبل انتهاء الـ 30 ثانية
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json({ message: "Approved" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Approval Failed" }, { status: 500 });
  }
}
