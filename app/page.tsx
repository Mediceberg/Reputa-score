"use client";
import { useState, useEffect } from 'react';

export default function ReputaPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. ربط Pi SDK (الهوية) لضمان ظهور اليوزر نيم وربط المحفظة
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['payments', 'username'], onIncompletePaymentFound)
        .then((auth: any) => {
          setUser(auth.user);
          console.log("Authenticated User:", auth.user);
        })
        .catch((err: any) => console.error("Auth Error:", err));
    }
  }, []);

  const onIncompletePaymentFound = (payment: any) => {
    // هذه الوظيفة تضمن عدم تعليق عمليات الدفع السابقة
    console.log("Incomplete payment found", payment);
  };

  // 2. دالة البحث والتحقق (المرتبطة بكود السيرفر الخاص بك)
  const handleSearch = async () => {
    if (!address) return alert("Please enter a wallet address");
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.isValid) {
        setWalletData(data);
      } else {
        alert(data.message || "Wallet not found");
      }
    } catch (error) {
      alert("Blockchain connection failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. دالة الدفع (1 Pi) للحصول على التقرير الكامل
  const handlePayment = () => {
    if (!window.Pi) return alert("Pi SDK not loaded");
    
    window.Pi.createPayment({
      amount: 1,
      memo: "Detailed Reputation Report Access",
      metadata: { reportId: "wallet_report_" + address }
    }, {
      onReadyForServerApproval: (paymentId: string) => {
        return fetch('/api/pi/approve', {
          method: 'POST',
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion: (paymentId: string, txid: string) => {
        return fetch('/api/pi/complete', {
          method: 'POST',
          body: JSON.stringify({ paymentId, txid }),
        });
      },
      onCancel: (paymentId: string) => console.log("Payment Cancelled", paymentId),
      onError: (error: Error, payment?: any) => alert("Payment Error: " + error.message),
    });
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header مع هوية الرائد */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ffa500', paddingBottom: '10px' }}>
        <h1 style={{ color: '#ffa500', fontSize: '24px', margin: 0 }}>REPUTA</h1>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#ffa500', fontWeight: 'bold' }}>@{user.username}</span>
            <br />
            <span style={{ fontSize: '10px', color: '#888' }}>Pioneer Verified</span>
          </div>
        )}
      </div>

      {/* منطقة البحث */}
      <div style={{ marginTop: '30px' }}>
        <input 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Wallet Address (G...)" 
          style={{
            width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #333',
            backgroundColor: '#111', color: '#ffa500', fontSize: '16px', outline: 'none'
          }}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#ffa500',
            color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px'
          }}
        >
          {loading ? "SEARCHING..." : "ANALYZE REPUTATION"}
        </button>
      </div>

      {/* عرض النتائج والمعاملات (الواجهة الأصلية المفضلة) */}
      {walletData && (
        <div style={{ marginTop: '20px', backgroundColor: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#888', margin: 0 }}>Reputation Score</p>
            <h2 style={{ fontSize: '60px', color: '#ffa500', margin: '10px 0' }}>{walletData.score}</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #333' }}>
            <span>Pi Balance:</span>
            <span style={{ fontWeight: 'bold', color: '#ffa500' }}>{walletData.balance} π</span>
          </div>

          {/* زر الدفع المدمج */}
          <button 
            onClick={handlePayment}
            style={{
              width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#333',
              color: '#fff', border: '1px solid #ffa500', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Unlock Detailed Analytics (1 π)
          </button>

          {/* قائمة المعاملات */}
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>RECENT OPERATIONS</p>
            {walletData.transactions && walletData.transactions.map((tx: any, index: number) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222', fontSize: '13px' }}>
                <span style={{ color: tx.type === 'استلام' ? '#00ff00' : '#ff4444' }}>{tx.type}</span>
                <span>{tx.amount} π</span>
                <span style={{ color: '#666' }}>{tx.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
