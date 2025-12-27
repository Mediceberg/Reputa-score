import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "PI_API_KEY not set" }, { status: 500 });

    // Approve
    const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
    });

    if (!approveRes.ok) {
      const err = await approveRes.text();
      return NextResponse.json({ error: "Approve failed", details: err }, { status: 400 });
    }

    // Complete
    if (txid) {
      const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ txid }),
      });

      if (!completeRes.ok) {
        const err = await completeRes.text();
        return NextResponse.json({ error: "Complete failed", details: err }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pi payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
