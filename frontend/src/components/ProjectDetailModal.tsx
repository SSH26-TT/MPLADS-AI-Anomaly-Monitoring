import React from 'react';
import { Project } from '../types';
import { RiskBadge } from './RiskBadge';
import { PriorityBadge } from './PriorityBadge';
import { getScoreColor } from '../utils/colors';
import { 
  X, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Layers, 
  FileText, 
  AlertOctagon,
  MapPin,
  Calendar,
  User,
  Landmark,
  Wallet,
  Building2,
  Compass
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

interface AuditFinding {
  title: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

// Helpers for clean formatting
const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      if (['mp', 'mla', 'dc', 'pwd', 'nh', 'ls', 'rs', 'fy', 'pcc', 'rcc', 'ut'].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const formatCategory = (cat?: string | null): string => {
  if (!cat) return 'General Infrastructure';
  const c = cat.trim().toUpperCase();
  if (c === 'NORMAL/OTHERS' || c === 'NORMAL / OTHERS') return 'Community & Social Infrastructure';
  if (c === 'DRINKING WATER FACILITY') return 'Drinking Water Facility';
  if (c === 'EDUCATION') return 'Education Infrastructure';
  if (c === 'ELECTRICITY FACILITY') return 'Electricity & Power Infrastructure';
  if (c === 'HEALTH AND FAMILY WELFARE') return 'Health & Family Welfare';
  if (c === 'IRRIGATION FACILITY') return 'Irrigation Facility';
  if (c === 'NON-CONVENTIONAL ENERGY SOURCES') return 'Non-Conventional Energy';
  if (c === 'OTHER PUBLIC FACILITIES') return 'Public Amenities & Infrastructure';
  if (c === 'ROADS, PATHWAYS AND BRIDGES') return 'Roads, Pathways & Bridges';
  if (c === 'SANITATION AND PUBLIC HEALTH') return 'Sanitation & Public Health';
  return toTitleCase(cat.replace(/_/g, ' '));
};

const formatAgencyLocation = (ida?: string | null, state?: string | null): string => {
  if (!ida || ida === state) return '';
  let cleaned = ida
    .replace(/_IDA/gi, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const match = cleaned.match(/^([^(]+)\(([^)]+)\)$/);
  if (match) {
    const district = match[1].trim();
    const agency = match[2].trim();
    return `${toTitleCase(agency)}, ${toTitleCase(district)}`;
  }

  cleaned = cleaned.replace(/[()]/g, '').trim();
  return toTitleCase(cleaned);
};

const formatClassification = (level?: string | null): string => {
  switch ((level || '').toUpperCase()) {
    case 'VERY_HIGH': return 'Very High';
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return level || 'Standard';
  }
};

const formatPriority = (prio?: string | null): string => {
  switch ((prio || '').toUpperCase()) {
    case 'CRITICAL_REVIEW': return 'Critical Review';
    case 'HIGH_REVIEW': return 'High Priority Review';
    case 'REVIEW': return 'Requires Review';
    case 'NORMAL': return 'Routine Lifecycle';
    default: return prio ? prio.replace(/_/g, ' ') : 'Routine Lifecycle';
  }
};

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<string | null>(null);

  if (!project) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(project.work_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentRiskVal = typeof project.payment_risk_0_100 === 'number' ? project.payment_risk_0_100 : null;

  // 5-tier color codes for bars and numbers
  const finColor = getScoreColor(project.financial_risk_0_100);
  const payColor = paymentRiskVal !== null ? getScoreColor(paymentRiskVal) : '#64748B';
  const delayRiskVal = typeof project.delay_risk_0_100 === 'number' ? project.delay_risk_0_100 : 0.0;
  const delayColor = getScoreColor(delayRiskVal);
  const execColor = getScoreColor(project.execution_risk_0_100);
  const finalColor = getScoreColor(project.final_risk_score);

  const formatRupees = (val?: number | null) => {
    if (val === undefined || val === null) return 'N/A';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  // Structured parser for audit observations with clean language
  const parseAuditFindings = (reasonStr: string): AuditFinding[] => {
    if (!reasonStr || reasonStr.includes('Standard lifecycle parameters') || reasonStr.includes('No major anomaly')) {
      return [
        {
          title: 'Standard Lifecycle Progression',
          description: 'Project adheres to standard financial allocation and milestone timelines with no operational flags.',
          category: 'Lifecycle Tracking',
          severity: 'low',
          icon: <CheckCircle2 size={15} color="#059669" />
        }
      ];
    }

    const clauses = reasonStr.split('|').map(s => s.trim()).filter(Boolean);
    return clauses.map((clause) => {
      const lower = clause.toLowerCase();

      if (lower.includes('disbursement lag') || lower.includes('initial disbursement')) {
        const daysMatch = clause.match(/(\d+)\s*days/i);
        const daysText = daysMatch ? `${daysMatch[1]} days` : 'extended period';
        return {
          title: 'Initial Fund Release Delay',
          description: `Initial disbursement delayed by ${daysText} following sanction approval.`,
          category: 'Payment Timeline',
          severity: 'high',
          icon: <Clock size={15} color="#DC2626" />
        };
      }

      if (lower.includes('financial outlier') || lower.includes('financial')) {
        return {
          title: 'Financial Allocation Variance',
          description: 'Substantial budget allocation variance identified against category benchmarks.',
          category: 'Financial Analysis',
          severity: 'high',
          icon: <DollarSign size={15} color="#DC2626" />
        };
      }

      if (lower.includes('unusual transaction') || lower.includes('disbursement sequence') || lower.includes('payment voucher')) {
        return {
          title: 'Disbursement Sequence Anomaly',
          description: 'Irregular installment release sequence identified across payment vouchers.',
          category: 'Transaction Chronology',
          severity: 'high',
          icon: <AlertTriangle size={15} color="#D97706" />
        };
      }

      if (lower.includes('delay') || lower.includes('stall')) {
        return {
          title: 'Milestone Schedule Risk',
          description: 'Significant milestone schedule stagnation and potential completion delay detected.',
          category: 'Project Timeline',
          severity: 'high',
          icon: <Clock size={15} color="#DC2626" />
        };
      }

      if (lower.includes('geotagged') || lower.includes('photo') || lower.includes('inspection')) {
        return {
          title: 'Site Inspection Documentation Missing',
          description: 'Mandatory geo-tagged physical site inspection photos pending verification.',
          category: 'Field Verification',
          severity: 'high',
          icon: <Layers size={15} color="#DC2626" />
        };
      }

      if (lower.includes('peer benchmark') || lower.includes('duration exceeds')) {
        return {
          title: 'Extended Execution Duration',
          description: 'Execution timeline significantly exceeds average duration for comparable works.',
          category: 'Benchmark Comparison',
          severity: 'medium',
          icon: <AlertOctagon size={15} color="#D97706" />
        };
      }

      if (lower.includes('exceed sanctioned') || lower.includes('allocation limit')) {
        return {
          title: 'Sanction Limit Variance',
          description: 'Total released payments exceed the administrative sanctioned limit.',
          category: 'Budget Compliance',
          severity: 'high',
          icon: <DollarSign size={15} color="#991B1B" />
        };
      }

      // Generic cleanup of leftover technical jargon or brackets
      let cleanDesc = clause
        .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/g, '')
        .replace(/\(\s*\d+%\s*\)/g, '')
        .replace(/^\(+|\)+$/g, '')
        .replace(/score/gi, 'status')
        .replace(/outlier/gi, 'variance')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        title: 'Administrative Observation',
        description: cleanDesc,
        category: 'Governance Review',
        severity: 'medium',
        icon: <FileText size={15} color="#2563EB" />
      };
    });
  };

  const auditFindings = parseAuditFindings(project.primary_risk_reason);
  const repClean = (project.mp_key || 'Representative').replace(/^(LS_|RS_)/i, '').replace(/_/g, ' ');
  const houseLabel = (project.house || '').toLowerCase().includes('rajya') ? 'Rajya Sabha' : 'Lok Sabha';
  const repFormatted = `${houseLabel} • ${toTitleCase(repClean)}`;

  const agencyFormatted = formatAgencyLocation(project.ida, project.state);
  const rawDesc = (project.work_description && project.work_description.trim().length > 0)
    ? project.work_description.trim()
    : project.work_title;
  
  // Clean description of outer brackets and proper formatting
  const displayDescription = rawDesc.replace(/^\(+|\)+$/g, '').trim();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '960px', 
          width: '100%', 
          padding: '16px 20px', 
          borderRadius: '12px',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto'
        }}
      >
        {/* Modal Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12.5px', color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '2px 8px', borderRadius: '5px', border: '1px solid var(--color-primary-border)' }}>
              {project.work_id}
            </span>
            <button
              onClick={handleCopyId}
              className="btn btn-outline btn-sm"
              style={{ padding: '2px 7px', fontSize: '11px', height: '22px' }}
            >
              {copied ? <Check size={11} color="#059669" /> : 'Copy ID'}
            </button>
            <RiskBadge level={project.risk_level} />
            <PriorityBadge priority={project.investigation_priority} />
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'var(--color-bg-input)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-main)', flexShrink: 0 }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Work Category, Title & Site Description Banner */}
        <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              background: 'var(--color-primary-bg)', 
              color: 'var(--color-primary)', 
              padding: '2px 8px', 
              borderRadius: '4px',
              border: '1px solid var(--color-primary-border)'
            }}>
              <Building2 size={12} />
              {formatCategory(project.work_category)}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {project.work_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            <Compass size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: 'var(--color-text-main)' }}>Site & Location Scope: </strong> 
              {displayDescription}
              {agencyFormatted && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginLeft: '6px' }}>
                  • {agencyFormatted}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Project Metadata Cards Grid (5 items) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--color-bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <MapPin size={11} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>State</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.state}</span>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <Calendar size={11} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Financial Year</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block' }}>{project.financial_year}</span>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <User size={11} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Representative</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={repFormatted}>
              {repFormatted}
            </span>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <Landmark size={11} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Sanction Amount</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}>{formatRupees(project.sanction_amount)}</span>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <Wallet size={11} />
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Disbursed Amount</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}>{formatRupees(project.total_disbursed_amount)}</span>
          </div>
        </div>

        {/* Overall Rating & Structured Review Analysis Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: '10px', marginBottom: '12px' }}>
          {/* Left: Overall Risk Score Card */}
          <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Risk Assessment
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0 2px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: finalColor, lineHeight: '1.1' }}>
                  {project.final_risk_score.toFixed(1)}%
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>/ 100</span>
              </div>
              <div className="risk-meter-bar" style={{ height: '5px', marginBottom: '6px' }}>
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${Math.min(100, project.final_risk_score)}%`,
                    backgroundColor: finalColor
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
              <div>Classification: <strong style={{ color: finalColor }}>{formatClassification(project.risk_level)}</strong></div>
              <div>Priority: <strong>{formatPriority(project.investigation_priority)}</strong></div>
            </div>
          </div>

          {/* Right: Key Audit Findings & Observations Panel */}
          <div style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>
                  Administrative Audit Observations
                </span>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: '1px 6px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                {auditFindings.length} {auditFindings.length === 1 ? 'Observation' : 'Observations'}
              </span>
            </div>

            {/* Structured Points List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
              {auditFindings.map((finding, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                  }}
                >
                  <div style={{ marginTop: '1px', flexShrink: 0 }}>
                    {finding.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '1px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {finding.title}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '9.5px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          padding: '1px 5px', 
                          borderRadius: '3px',
                          background: finding.severity === 'high' ? '#FEF2F2' : finding.severity === 'medium' ? '#FFFBEB' : '#ECFDF5',
                          color: finding.severity === 'high' ? '#DC2626' : finding.severity === 'medium' ? '#D97706' : '#059669',
                          border: `1px solid ${finding.severity === 'high' ? '#FECACA' : finding.severity === 'medium' ? '#FDE68A' : '#A7F3D0'}`
                        }}
                      >
                        {finding.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.35', margin: 0 }}>
                      {finding.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Core Evaluation Pillars */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', margin: 0 }}>
              Core Evaluation Pillars
            </h3>
            <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>
              Independent assessment across financial, payment, schedule, and field verification tracks
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {/* Pillar 1: Financial Allocation */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 10px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>1. Financial</span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: finColor }}>
                  {project.financial_risk_0_100.toFixed(1)}%
                </span>
              </div>
              <div className="risk-meter-bar" style={{ height: '4px', marginBottom: '6px' }}>
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${Math.min(100, project.financial_risk_0_100)}%`,
                    backgroundColor: finColor
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Tracking: <strong>Sanction vs Disbursed</strong></div>
                <div>Status: <strong style={{ color: finColor }}>{project.financial_risk_0_100 >= 60 ? 'Variance Detected' : 'Within Expected Norms'}</strong></div>
              </div>
            </div>

            {/* Pillar 2: Payment Flow */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 10px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>2. Payment</span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: payColor }}>
                  {paymentRiskVal !== null ? `${paymentRiskVal.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="risk-meter-bar" style={{ height: '4px', marginBottom: '6px' }}>
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${paymentRiskVal !== null ? Math.min(100, paymentRiskVal) : 0}%`,
                    backgroundColor: payColor
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Schedule: <strong>{project.payment_anomaly_flag ? 'Irregular Schedule' : 'Standard Flow'}</strong></div>
                <div>Records: <strong>{project.payment_data_available === 1 ? 'Recorded & Verified' : 'Pending Data'}</strong></div>
              </div>
            </div>

            {/* Pillar 3: Project Schedule */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 10px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>3. Schedule</span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: delayColor }}>
                  {delayRiskVal.toFixed(1)}%
                </span>
              </div>
              <div className="risk-meter-bar" style={{ height: '4px', marginBottom: '6px' }}>
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${Math.min(100, delayRiskVal)}%`,
                    backgroundColor: delayColor
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Timeline: <strong>{delayRiskVal >= 60 ? 'Potential Delay Risk' : delayRiskVal >= 35 ? 'Moderate Watch' : 'On Schedule'}</strong></div>
                <div>Milestone: <strong>Active Progress Tracking</strong></div>
              </div>
            </div>

            {/* Pillar 4: Physical Site Audit */}
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 10px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>4. Physical Site</span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: execColor }}>
                  {project.execution_risk_0_100.toFixed(1)}%
                </span>
              </div>
              <div className="risk-meter-bar" style={{ height: '4px', marginBottom: '6px' }}>
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${Math.min(100, project.execution_risk_0_100)}%`,
                    backgroundColor: execColor
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Site Photo: <strong>{project.execution_risk_0_100 > 0 ? 'Photo Discrepancy' : 'Fully Compliant'}</strong></div>
                <div>Inspection: <strong>{project.execution_risk_0_100 > 0 ? 'Site Verification Needed' : 'Verified'}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Actions & Resolution */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {reviewStatus && (
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={14} /> {reviewStatus}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-outline btn-sm"
              style={{ padding: '5px 12px', fontSize: '12px' }}
              onClick={() => {
                setReviewStatus('Work flagged for District Officer review & field verification.');
              }}
            >
              Request Field Inquiry
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ padding: '5px 12px', fontSize: '12px' }}
              onClick={() => {
                setReviewStatus('Work marked as Administratively Reviewed.');
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
