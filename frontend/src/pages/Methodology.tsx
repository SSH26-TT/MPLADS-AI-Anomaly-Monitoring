import React, { useEffect, useState } from 'react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ShieldCheck, Scale, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { SystemSummary } from '../types';

export const Methodology: React.FC = () => {
  const [summary, setSummary] = useState<SystemSummary | null>(api.getCachedSummary());

  useEffect(() => {
    if (!summary) {
      api.getSummary().then(setSummary).catch(() => {});
    }
  }, [summary]);

  const lowCount = summary?.risk_distribution.LOW ?? 84905;
  const medCount = summary?.risk_distribution.MEDIUM ?? 11415;
  const highCount = summary?.risk_distribution.HIGH ?? 2061;
  const veryHighCount = summary?.risk_distribution.VERY_HIGH ?? 0;

  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">Monitoring Framework</span>
          <h2>Risk Evaluation & Administrative Guidelines</h2>
          <p>Standard assessment criteria for MPLADS monitoring, project oversight, and review prioritization</p>
        </div>
      </div>

      {/* Core Principle Alert */}
      <div style={{ background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary-border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <ShieldCheck size={24} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Administrative Decision Support Notice</h3>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
          The MPLADS monitoring platform functions as an <strong>administrative decision-support system</strong>.
          An elevated risk rating indicates a <strong>statistical variance or operational anomaly</strong> that warrants administrative review.
          Risk scores highlight priority cases for field inspections and do not constitute proof of irregularity or wrongdoing.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Financial */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>1. Financial Allocation</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DISBURSEMENT RATIOS</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
            Monitors relationships between sanction amounts, disbursed totals, and category benchmarks.
          </p>
          <div style={{ fontSize: '11.5px', background: 'var(--color-bg-input)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Focus:</strong> Fund Allocation Norms
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>2. Payment Flow</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TRANSACTION CHRONOLOGY</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
            Assesses milestone disbursement intervals, tranche sequencing, and transaction schedules.
          </p>
          <div style={{ fontSize: '11.5px', background: 'var(--color-bg-input)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Focus:</strong> Disbursement Milestones
          </div>
        </div>

        {/* Timeline & Delay */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>3. Project Schedule</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TIMELINE PROGRESSION</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
            Tracks completion milestones, project duration vs work category norms, and projected completion status.
          </p>
          <div style={{ fontSize: '11.5px', background: 'var(--color-bg-input)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Focus:</strong> Schedule Adherence
          </div>
        </div>

        {/* Physical Execution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>4. Physical Site Audit</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>FIELD VERIFICATION</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
            Validates inspection photo documentation, geo-tagging compliance, and physical status consistency.
          </p>
          <div style={{ fontSize: '11.5px', background: 'var(--color-bg-input)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Focus:</strong> Site Documentation Check
          </div>
        </div>
      </div>

      {/* Policy Bands Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Policy Risk Classifications</h3>
            <p>Score bands and administrative follow-up protocols</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Classification</th>
                <th>Score Range</th>
                <th style={{ textAlign: 'right' }}>Monitored Works</th>
                <th>Administrative Protocol</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-low">LOW</span></td>
                <td>0.00 – 39.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{lowCount.toLocaleString()}</td>
                <td style={{ fontSize: '12px' }}>Standard routine monitoring</td>
              </tr>
              <tr>
                <td><span className="badge badge-medium">MEDIUM</span></td>
                <td>40.00 – 59.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{medCount.toLocaleString()}</td>
                <td style={{ fontSize: '12px' }}>Periodic milestone review & progress checks</td>
              </tr>
              <tr>
                <td><span className="badge badge-high">HIGH</span></td>
                <td>60.00 – 79.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{highCount.toLocaleString()}</td>
                <td style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>Priority review queue for district authorities</td>
              </tr>
              {veryHighCount > 0 && (
                <tr>
                  <td><span className="badge badge-high" style={{ background: '#7F1D1D', color: '#fff' }}>VERY HIGH</span></td>
                  <td>80.00 – 100.00</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{veryHighCount.toLocaleString()}</td>
                  <td style={{ fontSize: '12px', color: '#991B1B', fontWeight: 700 }}>Immediate field inspection</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
