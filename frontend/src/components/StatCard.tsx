import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = '#ECFDF5',
  iconColor = '#059669',
  tag,
  tagBg = '#F1F5F9',
  tagColor = '#475569'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="stat-footer">
        {tag && (
          <span className="stat-tag" style={{ backgroundColor: tagBg, color: tagColor }}>
            {tag}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};
