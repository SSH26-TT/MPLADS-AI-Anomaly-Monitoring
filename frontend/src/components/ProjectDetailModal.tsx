import React from 'react';
import { Project } from '../types';
import { RiskBadge } from './RiskBadge';
import { PriorityBadge } from './PriorityBadge';
import { ScoreLegend } from './ScoreLegend';
import { getScoreColor } from '../utils/colors';
import { X, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';


interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<string | null>(null);

  if (!project) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(project.work_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPayment = project.payment_data_available === 1 && typeof project.payment_risk_0_100 === 'number';
  const paymentRiskVal = typeof project.payment_risk_0_100 === 'number' ? project.payment_risk_0_100 : null;

  // 5-tier color codes for bars and numbers
  const finColor = getScoreColor(project.financial_risk_0_100);
  const payColor = paymentRiskVal !== null ? getScoreColor(paymentRiskVal) : '#64748B';
  const execColor = getScoreColor(project.execution_risk_0_100);
  const finalColor = getScoreColor(project.final_risk_score);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--color-primary-border)' }}>
                {project.work_id}
              </span>
              <button
                onClick={handleCopyId}
                className="btn btn-outline btn-sm"
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                {copied ? <Check size={12} color="#059669" /> : 'Copy ID'}
              </button>
              <RiskBadge level={project.risk_level} score={project.final_risk_score} showScore />
              <PriorityBadge priority={project.investigation_priority} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: '1.3' }}>
              {project.work_title}
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'var(--color-bg-input)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-main)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice */}
        <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
          <ShieldAlert size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Official Monitoring Notice:</strong> Risk scores indicate unusual patterns that warrant administrative review. They do not constitute proof of financial wrongdoing.
          </span>
        </div>

        {/* Project Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--color-bg-input)', padding: '14px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>State</span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{project.state}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Financial Year</span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{project.financial_year}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Work Category</span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{project.work_category || 'General'}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>House / Representative</span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{project.house || 'Lok Sabha'} • {project.mp_key || 'Representative'}</span>
          </div>
        </div>

        {/* Risk Score & Primary Reason Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Overall Risk Rating</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: finalColor }}>
                {project.final_risk_score.toFixed(1)}%
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>/ 100</span>
            </div>
            <div className="risk-meter-bar">
              <div
                className="risk-meter-fill"
                style={{
                  width: `${Math.min(100, project.final_risk_score)}%`,
                  backgroundColor: finalColor
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              Classification: <strong>{project.risk_level}</strong> (Priority: {project.investigation_priority})
            </span>
          </div>

          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Primary Review Explanation</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '6px' }}>
              {project.primary_risk_reason}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Assessment based on financial disbursement ratios, payment tracking, and project execution records.
            </p>
          </div>
        </div>

        {/* Modal Score Legend */}
        <div style={{ marginBottom: '16px' }}>
          <ScoreLegend compact />
        </div>

        {/* 3 Component Breakdown Cards */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', marginBottom: '12px' }}>
          Risk Factor Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {/* Financial Component */}
          <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>1. Financial Risk</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: finColor }}>
                {project.financial_risk_0_100.toFixed(1)}%
              </span>
            </div>
            <div className="risk-meter-bar" style={{ marginBottom: '10px' }}>
              <div
                className="risk-meter-fill"
                style={{
                  width: `${Math.min(100, project.financial_risk_0_100)}%`,
                  backgroundColor: finColor
                }}
              />
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Sanction vs Disbursement analysis</div>
              <div>Rating: <strong style={{ color: finColor }}>{project.financial_risk_0_100 >= 80 ? 'Critical Risk (80–100)' : project.financial_risk_0_100 >= 60 ? 'High Risk (60–80)' : project.financial_risk_0_100 >= 40 ? 'Moderate (40–60)' : project.financial_risk_0_100 >= 20 ? 'Low-Moderate (20–40)' : 'Low Risk (0–20)'}</strong></div>
            </div>
          </div>

          {/* Payment Component */}
          <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>2. Payment Risk</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: payColor }}>
                {paymentRiskVal !== null ? `${paymentRiskVal.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="risk-meter-bar" style={{ marginBottom: '10px' }}>
              <div
                className="risk-meter-fill"
                style={{
                  width: `${paymentRiskVal !== null ? Math.min(100, paymentRiskVal) : 0}%`,
                  backgroundColor: payColor
                }}
              />
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Payment Record: <strong>{project.payment_data_available === 1 ? 'Available' : 'Pending Record'}</strong></div>
              <div>Signal: <strong>{project.payment_anomaly_flag ? 'Flagged for Review' : 'Normal'}</strong></div>
            </div>
          </div>

          {/* Execution Component */}
          <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>3. Execution Consistency</span>
              <span style={{ fontWeight: 800, fontSize: '16px', color: execColor }}>
                {project.execution_risk_0_100.toFixed(1)}%
              </span>
            </div>
            <div className="risk-meter-bar" style={{ marginBottom: '10px' }}>
              <div
                className="risk-meter-fill"
                style={{
                  width: `${Math.min(100, project.execution_risk_0_100)}%`,
                  backgroundColor: execColor
                }}
              />
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Consistency Check: <strong>{project.execution_consistency_flag === 1 ? 'Discrepancy Found' : 'Consistent'}</strong></div>
              <div>Disbursement: <strong>{project.execution_risk_0_100 > 0 ? 'Requires Verification' : 'Verified'}</strong></div>
            </div>
          </div>
        </div>


        {/* Audit Actions & Resolution */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {reviewStatus && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> {reviewStatus}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setReviewStatus('Work flagged for District Officer review.');
              }}
            >
              Request Field Inquiry
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setReviewStatus('Work marked as Reviewed.');
              }}
            >
              Mark Reviewed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
