// هذا الكود يخبر شبكة باي أن تطبيقك موافق على استلام العملية
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { paymentId } = await request.json();
  
  // هنا يجب عليك مراسلة Pi API لإعطاء الموافقة (Approve)
  // ستحتاج لـ API Key الخاص بك من بوابة المطورين
  const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Key YOUR_API_KEY_HERE` }
  });

  return NextResponse.json({ success: true });
}
