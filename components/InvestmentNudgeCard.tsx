import React, { useState } from 'react';

interface NudgeData {
  fundName: string;
  recommendedAmount: number;
  fundId: string;
  reasoning: string;
}

interface InvestmentNudgeCardProps {
  data: NudgeData;
  onAccept: (data: NudgeData) => void;
  onDecline: () => void;
}

export default function InvestmentNudgeCard({ data, onAccept, onDecline }: InvestmentNudgeCardProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    // Simulate calling the backend API to execute the investment
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.recommendedAmount, fundId: data.fundId, fundName: data.fundName })
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        onAccept(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDeclineClick = () => {
    setDeclined(true);
    onDecline();
  };

  if (success) {
    return (
      <div className="bubble-container model">
        <div className="bubble model" style={{ borderColor: 'var(--success)', background: '#f0fdf4' }}>
          ✅ Investment of ₹{data.recommendedAmount.toLocaleString('en-IN')} in {data.fundName} was successful.
        </div>
      </div>
    );
  }

  return (
    <div className="bubble-container model">
      <div className="nudge-card">
        <div className="nudge-header">
          <div className="nudge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Smart Investment Nudge</h4>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>IDBI WealthLens</span>
          </div>
        </div>
        <div className="nudge-content">
          <p style={{ margin: 0, fontWeight: 500 }}>{data.fundName}</p>
          <div className="nudge-amount">
            ₹{data.recommendedAmount.toLocaleString('en-IN')}
          </div>
          <p className="nudge-reason">{data.reasoning}</p>
          <div className="nudge-actions">
            <button className="btn btn-decline" onClick={handleDeclineClick} disabled={loading || declined}>
              {declined ? 'Declined' : 'Decline'}
            </button>
            <button className="btn btn-accept" onClick={handleAccept} disabled={loading || declined}>
              {loading ? (
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              ) : 'Accept & Invest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
