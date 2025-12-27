"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState<any>(null);

  // ربط Pi SDK الأساسي لضمان عمل الهوية والدفع
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['payments', 'username'], onIncompletePaymentFound)
        .then((auth: any) => setUser(auth.user))
        .catch((err: any) => console.error(err));
    }
  }, []);

  const onIncompletePaymentFound = (payment: any) => {
    // معالجة المدفوعات غير المكتملة لضمان عدم التعليق
  };

  // دالة الدفع التي كانت تعمل في الخطوة 10
  const handlePayment = async () => {
    if (!window.Pi) return;
    window.Pi.createPayment({
      amount: 1,
      memo: "Reputation Report",
      metadata: { type: "report" }
    }, {
      onReadyForServerApproval: (id: string) => fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ id }) }),
      onReadyForServerCompletion: (id: string, tx: string) => fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ id, tx }) }),
      onCancel: () => {},
      onError: (err: any) => alert(err.message)
    });
  };

  const checkWallet = async () => {
    const res = await fetch('/api/wallet/check', {
      method: 'POST',
      body: JSON.stringify({ walletAddress: address }),
    });
    const data = await res.json();
    setWalletData(data);
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ color: '#ffa500' }}>REPUTA</h1>
        {user && <span style={{ fontSize: '12px' }}>@{user.username}</span>}
      </header>

      <main>
        <div style={{ marginBottom: '20px' }}>
          <input 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Wallet G..." 
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#000', color: 'white' }}
          />
          <button 
            onClick={checkWallet}
            style={{ width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#ffa500', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
          >
            Check Reputation
          </button>
        </div>

        {walletData && (
          <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
            <h2>Score: {walletData.score}/100</h2>
            <p>Balance: {walletData.balance} Pi</p>
            <button 
              onClick={handlePayment}
              style={{ padding: '10px 20px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '5px', marginTop: '10px' }}
            >
              Unlock Full Report (1 Pi)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
