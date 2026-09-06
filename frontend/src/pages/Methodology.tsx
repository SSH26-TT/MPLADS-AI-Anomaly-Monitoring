import React from 'react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { BookOpen, ShieldCheck, Scale, Cpu, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">Risk Evaluation Guidelines</span>
          <h2>Evaluation Framework & Guidelines</h2>
          <p>Standard assessment criteria for MPLADS monitoring and review prioritization</p>
        </div>
      </div>

      {/* Core Principle Alert */}
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#005A36', marginBottom: '8px' }}>
          <ShieldCheck size={24} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Mandatory Monitoring Notice</h3>
        </div>
        <p style={{ fontSize: '14px', color: '#065F46', lineHeight: '1.6' }}>
          The MPLADS monitoring system is designed as an <strong>administrative decision-support tool</strong>.
          An elevated risk score or flagged record indicates a <strong>statistically unusual pattern or data variance</strong> that warrants review.
          It <strong>DOES NOT</strong> establish or prove wrongdoing, corruption, or misuse of funds.
        </p>
      </div>

      {/* 3 Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
        {/* Financial */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>1. Financial Analysis</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DISBURSEMENT RATIOS</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
            Evaluates unusual relationships between sanction amounts, disbursed totals, and payment intervals.
          </p>
          <div style={{ fontSize: '12px', background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Share:</strong> 50.0% (Standard) / 62.5% (Pending Payment Data)
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>2. Payment Tracking</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TRANSACTION PATTERNS</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
            Monitors disbursement intervals, sequence numbers, and vendor payment distributions across works.
          </p>
          <div style={{ fontSize: '12px', background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Share:</strong> 30.0% (when recorded)
          </div>
        </div>

        {/* Execution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>3. Execution Consistency</h4>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ADMINISTRATIVE CHECKS</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
            Highlights records with zero recorded disbursements upon completion or disbursements exceeding sanctions.
          </p>
          <div style={{ fontSize: '12px', background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <strong>Assessment Share:</strong> 20.0% (Standard) / 37.5% (Pending Payment Data)
          </div>
        </div>
      </div>

      {/* Policy Bands */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Policy Risk Classifications</h3>
            <p>Score ranges and standard verification protocol</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Classification</th>
                <th>Score Range</th>
                <th style={{ textAlign: 'right' }}>Monitored Works</th>
                <th>Standard Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-low">LOW</span></td>
                <td>0.00 – 39.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>96,821</td>
                <td style={{ fontSize: '12px' }}>Standard routine monitoring</td>
              </tr>
              <tr>
                <td><span className="badge badge-medium">MEDIUM</span></td>
                <td>40.00 – 59.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>1,744</td>
                <td style={{ fontSize: '12px' }}>Periodic milestone review</td>
              </tr>
              <tr>
                <td><span className="badge badge-high">HIGH</span></td>
                <td>60.00 – 79.99</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>190</td>
                <td style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>Priority verification queue</td>
              </tr>
              <tr>
                <td><span className="badge badge-high" style={{ background: '#7F1D1D', color: '#fff' }}>VERY HIGH</span></td>
                <td>80.00 – 100.00</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>0</td>
                <td style={{ fontSize: '12px' }}>Immediate escalation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
