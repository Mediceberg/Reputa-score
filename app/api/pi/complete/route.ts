import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json();
    
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid }) // إرسال TXID ضروري للإكمال
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json({ error: "Completion Failed" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
