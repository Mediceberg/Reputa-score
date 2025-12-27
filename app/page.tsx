"use client";
import { useState, useEffect } from 'react';

export default function ReputaHome() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ربط Pi SDK (الهوية والدفع)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['payments', 'username'], (payment: any) => {})
        .then((auth: any) => setUser(auth.user))
        .catch((err: any) => console.error(err));
    }
  }, []);

  // محرك البحث والتحليل
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: address }),
      });
      const result = await res.json();
      if (result.isValid) setData(result);
      else alert(result.message);
    } catch (err) {
      alert("Error connecting to blockchain");
    } finally {
      setLoading(false);
    }
  };

  // دالة الدفع الرسمية (للحصول على التقرير)
  const handlePayment = () => {
    if (!window.Pi) return;
    window.Pi.createPayment({
      amount: 1,
      memo: "Detailed Reputation Report",
      metadata: { reportType: "advanced_v3" }
    }, {
      onReadyForServerApproval: (id: string) => fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ id }) }),
      onReadyForServerCompletion: (id: string, tx: string) => fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ id, tx }) }),
      onCancel: () => {},
      onError: (err: any) => alert(err.message)
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ color: '#ffa500', margin: 0 }}>REPUTA <span style={{fontSize: '10px'}}>V3</span></h1>
        {user && <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#ffa500', fontWeight: 'bold' }}>@{user.username}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Pioneer Verified</div>
        </div>}
      </header>

      <main style={{ marginTop: '30px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
        <input 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Paste Wallet Address (G...)" 
          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#111', color: '#ffa500', outline: 'none', marginBottom: '10px' }}
        />
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          style={{ width: '100%', padding: '15px', backgroundColor: '#ffa500', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "Analyzing Blockchain..." : "CHECK REPUTATION"}
        </button>

        {data && (
          <div style={{ marginTop: '25px', backgroundColor: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #222' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Reputation Score</p>
              <h2 style={{ fontSize: '50px', margin: '5px 0', color: '#ffa500' }}>{data.score}<span style={{fontSize: '15px', color: '#444'}}>/100</span></h2>
              <div style={{ fontSize: '12px', backgroundColor: '#222', display: 'inline-block', padding: '5px 15px', borderRadius: '20px' }}>{data.tier}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>Balance:</span>
              <span style={{ color: '#ffa500', fontWeight: 'bold' }}>{data.balance} π</span>
            </div>

            <button 
              onClick={handlePayment}
              style={{ width: '100%', padding: '12px', backgroundColor: '#222', color: 'white', border: '1px solid #333', borderRadius: '10px', marginBottom: '20px' }}
            >
              Get Detailed Report (1 π)
            </button>

            <div style={{ fontSize: '12px' }}>
              <p style={{ color: '#666', borderBottom: '1px solid #222', paddingBottom: '5px' }}>Last Operations</p>
              {data.transactions.map((tx: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ color: tx.type === 'IN' ? '#4caf50' : '#f44336' }}>{tx.type}</span>
                  <span>{tx.amount} π</span>
                  <span style={{ color: '#444' }}>{tx.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
