import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "PI_API_KEY_NOT_FOUND" }, { status: 500 });
    }

    // إرسال الموافقة لمنصة Pi في أقل من ثانيتين لتجنب انتهاء الصلاحية
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { 
        "Authorization": `Key ${apiKey}`, 
        "Content-Type": "application/json" 
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Approved Successfully" }, { status: 200 });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ error: "Pi_API_REJECTED", details: errorText }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: error.message }, { status: 500 });
  }
}
