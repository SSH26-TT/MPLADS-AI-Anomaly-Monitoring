import React from 'react';
import { SCORE_TIERS } from '../utils/colors';

interface ScoreLegendProps {
  compact?: boolean;
}

export const ScoreLegend: React.FC<ScoreLegendProps> = ({ compact = false }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: compact ? '8px' : '12px',
        padding: compact ? '6px 10px' : '10px 14px',
        background: 'var(--color-bg-input)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        fontSize: compact ? '11.5px' : '12.5px',
      }}
    >
      <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.04em' }}>
        Score Index:
      </span>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: compact ? '8px' : '12px' }}>
        {SCORE_TIERS.map((tier) => (
          <div key={tier.range} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: tier.color,
                display: 'inline-block',
                flexShrink: 0
              }}
            />
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {tier.range}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
              ({tier.label})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
