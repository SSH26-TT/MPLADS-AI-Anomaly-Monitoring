import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = false }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  if (normLevel === 'HIGH' || normLevel === 'VERY_HIGH') {
    return (
      <span className="badge badge-high" title={`Risk Level: ${normLevel}${score !== undefined ? ` (${score.toFixed(1)})` : ''}`}>
        <AlertOctagon size={13} />
        <span>{normLevel === 'VERY_HIGH' ? 'Very High' : 'High'}</span>
        {showScore && score !== undefined && <span style={{ opacity: 0.85 }}>({score.toFixed(1)})</span>}
      </span>
    );
  }

  if (normLevel === 'MEDIUM') {
    return (
      <span className="badge badge-medium" title={`Risk Level: Medium${score !== undefined ? ` (${score.toFixed(1)})` : ''}`}>
        <AlertTriangle size={13} />
        <span>Medium</span>
        {showScore && score !== undefined && <span style={{ opacity: 0.85 }}>({score.toFixed(1)})</span>}
      </span>
    );
  }

  return (
    <span className="badge badge-low" title={`Risk Level: Low${score !== undefined ? ` (${score.toFixed(1)})` : ''}`}>
      <ShieldCheck size={13} />
      <span>Low</span>
      {showScore && score !== undefined && <span style={{ opacity: 0.85 }}>({score.toFixed(1)})</span>}
    </span>
  );
};
