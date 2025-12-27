import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    const apiKey = process.env.PI_API_KEY; // تأكد من إضافة هذا في Vercel Settings

    if (!apiKey) {
      return NextResponse.json({ error: "PI_API_KEY is missing" }, { status: 500 });
    }

    // استدعاء خادم Pi للموافقة على الدفع
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      return NextResponse.json({ error: "Pi API Error", detail: errorDetail }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
