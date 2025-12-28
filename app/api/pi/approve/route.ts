import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    // الاتصال المباشر بسيرفر Pi
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`, // تأكد أن الكلمة Key موجودة هنا أو في Vercel
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return NextResponse.json({ approved: true }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Pi Server Refused" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Timeout/Network Error" }, { status: 500 });
  }
}
