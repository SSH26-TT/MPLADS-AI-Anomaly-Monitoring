import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="disclaimer-banner" role="alert">
      <ShieldAlert size={20} className="banner-icon" />
      <div style={{ flex: 1 }}>
        <strong>Official Decision-Support Notice:</strong> This AI-assisted system highlights works and payments exhibiting statistically unusual patterns for human review. An anomaly or high risk score <strong>does not establish wrongdoing, corruption, or fraud</strong>. All prioritized findings require independent verification by authorities.
      </div>
      <button 
        onClick={() => setVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', padding: '4px' }}
        title="Dismiss notice"
      >
        <X size={16} />
      </button>
    </div>
  );
};
