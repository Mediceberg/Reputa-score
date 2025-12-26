import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    
    // مفتاح الـ API الخاص بك من لوحة تحكم مطوري Pi
    const apiKey = "dd4knvcjpvcycmxnw8mjmcpovbvjjizrdbjcupasgu6crulcpplk65dmalcegzk"; 

    // إرسال الموافقة لخوادم Pi الرسمية
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
      return NextResponse.json({ success: false, error: "Failed to approve" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
