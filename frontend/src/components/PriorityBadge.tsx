import React from 'react';
import { Clock, Eye, AlertCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const norm = (priority || 'NORMAL').toUpperCase();

  if (norm === 'HIGH_REVIEW' || norm === 'CRITICAL_REVIEW') {
    return (
      <span className="badge badge-priority-high">
        <AlertCircle size={13} />
        <span>High Review</span>
      </span>
    );
  }

  if (norm === 'REVIEW') {
    return (
      <span className="badge badge-priority-review">
        <Eye size={13} />
        <span>Requires Review</span>
      </span>
    );
  }

  return (
    <span className="badge badge-priority-normal">
      <Clock size={13} />
      <span>Normal</span>
    </span>
  );
};
