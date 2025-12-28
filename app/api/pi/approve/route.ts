import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API KEY MISSING" }, { status: 500 });

    // الرد الفوري على طلب Pi Network
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { 
        "Authorization": `Key ${apiKey}`, 
        "Content-Type": "application/json" 
      }
    });

    if (response.ok) return NextResponse.json({ success: true }, { status: 200 });
    
    const errorText = await response.text();
    return NextResponse.json({ error: errorText }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Connection Error" }, { status: 500 });
  }
}
