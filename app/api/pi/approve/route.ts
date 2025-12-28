import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // يمنع التخزين المؤقت للطلبات (مهم جداً)

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`, 
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("Payment approved successfully:", paymentId);
      return NextResponse.json(data, { status: 200 });
    }

    console.error("Pi API Error:", data);
    return NextResponse.json({ error: data.message || "Approval Failed" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
