import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

    // 1. استبدل 'YOUR_API_KEY' بمفتاحك من Developer Portal
    const PI_API_KEY = "ضغ_مفتاح_API_الخاص_بك_هنا"; 

    // 2. مراسلة سيرفر Pi للموافقة على المعاملة (Approve)
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${dd4knvcjpvcycmxnxw8mjmcpovbvjjizrdbjcupasgu6crwlcpp1k65dmalcegzk}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error("Pi API Error:", data);
      return NextResponse.json({ success: false, error: data }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
