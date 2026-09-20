import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  if (normLevel === 'VERY_HIGH') {
    return (
      <span className="badge badge-very-high" title="Risk Classification: Very High">
        <AlertOctagon size={13} />
        <span>Very High</span>
      </span>
    );
  }

  if (normLevel === 'HIGH') {
    return (
      <span className="badge badge-high" title="Risk Classification: High">
        <AlertOctagon size={13} />
        <span>High</span>
      </span>
    );
  }

  if (normLevel === 'MEDIUM') {
    return (
      <span className="badge badge-medium" title="Risk Classification: Medium">
        <AlertTriangle size={13} />
        <span>Medium</span>
      </span>
    );
  }

  return (
    <span className="badge badge-low" title="Risk Classification: Low">
      <ShieldCheck size={13} />
      <span>Low</span>
    </span>
  );
};
