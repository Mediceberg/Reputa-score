import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    // استبدل 'YOUR_API_KEY' بالمفتاح الذي تجده في لوحة تحكم مطوري Pi
    const apiKey = "dd4knvcjpvcycmxnxw8mjmcpovbvjjizrdbjcupasgu6crwlcpp1k65dmalcegzk"; 

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to approve" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
