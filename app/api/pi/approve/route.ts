import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    // تأكد أن PI_API_KEY في Vercel لا يحتوي على كلمة Key إذا كنت تضيفها هنا
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`, 
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json({ error: "Approval Failed" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
