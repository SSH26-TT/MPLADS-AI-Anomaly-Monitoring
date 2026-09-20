import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project, SystemSummary } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Pagination } from '../components/Pagination';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { getScoreColor } from '../utils/colors';
import { AlertTriangle, AlertOctagon, Layers, CreditCard, ShieldAlert, RefreshCw } from 'lucide-react';

interface HighRiskProps {
  onSelectProject: (p: Project) => void;
  selectedState: string;
}

export const HighRisk: React.FC<HighRiskProps> = ({ onSelectProject, selectedState }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<SystemSummary | null>(api.getCachedSummary());
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL_REVIEW' | 'HIGH_RISK' | 'HIGH_PRIO' | 'EXECUTION' | 'PAYMENT'>('ALL_REVIEW');

  useEffect(() => {
    if (!summary) {
      api.getSummary().then(setSummary).catch(() => {});
    }
  }, [summary]);

  const fetchPriorityQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      let filters: any = {
        page,
        page_size: pageSize,
        state: selectedState !== 'ALL' ? selectedState : undefined,
        sort_by: 'final_risk_score',
        sort_order: 'desc'
      };

      if (activeQuickFilter === 'HIGH_RISK') {
        filters.risk_level = 'HIGH,VERY_HIGH';
      } else if (activeQuickFilter === 'HIGH_PRIO') {
        filters.investigation_priority = 'HIGH_REVIEW,CRITICAL_REVIEW';
      } else if (activeQuickFilter === 'EXECUTION') {
        filters.execution_consistency_flag = 1;
      } else if (activeQuickFilter === 'PAYMENT') {
        filters.payment_anomaly_flag = true;
      } else {
        filters.investigation_priority = 'REVIEW,HIGH_REVIEW,CRITICAL_REVIEW';
      }

      const res = await api.getWorks(filters);
      setProjects(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Failed to load priority works:', err);
      setError('Unable to load priority works from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityQueue();
  }, [page, pageSize, activeQuickFilter, selectedState]);

  const allReviewCount = summary?.requiring_review ?? 26184;
  const highRiskCount = ((summary?.risk_distribution?.HIGH ?? 2061) + (summary?.risk_distribution?.VERY_HIGH ?? 374));
  const highPrioCount = ((summary?.investigation_priority_distribution?.HIGH_REVIEW ?? 16105) + (summary?.investigation_priority_distribution?.CRITICAL_REVIEW ?? 487));
  const execIssuesCount = summary?.execution_consistency_issues ?? 17561;
  const paymentIssuesCount = summary?.payment_anomalies ?? 3297;

  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag" style={{ color: '#DC2626' }}>Review Priority Queue</span>
          <h2>Projects Requiring Administrative Review</h2>
          <p>Prioritized MPLADS projects with financial variances, milestone payment alerts, or schedule delays</p>
        </div>
      </div>

      {/* Quick Filter Segmented Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => { setActiveQuickFilter('ALL_REVIEW'); setPage(1); }}
          style={{
            background: activeQuickFilter === 'ALL_REVIEW' ? '#005A36' : 'var(--color-bg-card)',
            color: activeQuickFilter === 'ALL_REVIEW' ? '#FFFFFF' : 'var(--color-text-main)',
            border: `1px solid ${activeQuickFilter === 'ALL_REVIEW' ? '#005A36' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <AlertTriangle size={15} /> All Requiring Review
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{allReviewCount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Flagged review queue</div>
        </button>

        <button
          onClick={() => { setActiveQuickFilter('HIGH_RISK'); setPage(1); }}
          style={{
            background: activeQuickFilter === 'HIGH_RISK' ? '#DC2626' : 'var(--color-bg-card)',
            color: activeQuickFilter === 'HIGH_RISK' ? '#FFFFFF' : 'var(--color-text-main)',
            border: `1px solid ${activeQuickFilter === 'HIGH_RISK' ? '#DC2626' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <AlertOctagon size={15} /> High & Very High Risk
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{highRiskCount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Priority Inspection Queue</div>
        </button>

        <button
          onClick={() => { setActiveQuickFilter('HIGH_PRIO'); setPage(1); }}
          style={{
            background: activeQuickFilter === 'HIGH_PRIO' ? '#991B1B' : 'var(--color-bg-card)',
            color: activeQuickFilter === 'HIGH_PRIO' ? '#FFFFFF' : 'var(--color-text-main)',
            border: `1px solid ${activeQuickFilter === 'HIGH_PRIO' ? '#991B1B' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <ShieldAlert size={15} /> High Priority Cases
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{highPrioCount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Administrative priority</div>
        </button>

        <button
          onClick={() => { setActiveQuickFilter('EXECUTION'); setPage(1); }}
          style={{
            background: activeQuickFilter === 'EXECUTION' ? '#D97706' : 'var(--color-bg-card)',
            color: activeQuickFilter === 'EXECUTION' ? '#FFFFFF' : 'var(--color-text-main)',
            border: `1px solid ${activeQuickFilter === 'EXECUTION' ? '#D97706' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Layers size={15} /> Schedule / Site Alerts
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{execIssuesCount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Timeline & photo checks</div>
        </button>

        <button
          onClick={() => { setActiveQuickFilter('PAYMENT'); setPage(1); }}
          style={{
            background: activeQuickFilter === 'PAYMENT' ? '#2563EB' : 'var(--color-bg-card)',
            color: activeQuickFilter === 'PAYMENT' ? '#FFFFFF' : 'var(--color-text-main)',
            border: `1px solid ${activeQuickFilter === 'PAYMENT' ? '#2563EB' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <CreditCard size={15} /> Payment Flow Flags
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{paymentIssuesCount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Milestone sequence variance</div>
        </button>
      </div>

      {/* High-Risk Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Work ID</th>
              <th>State</th>
              <th>FY</th>
              <th style={{ textAlign: 'right' }}>Sanction Amount</th>
              <th style={{ textAlign: 'right' }}>Total Disbursed</th>
              <th style={{ textAlign: 'right' }}>Overall Risk Score</th>
              <th>Risk Level</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Loading prioritized review queue...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}>
                  {error}
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  No priority projects found matching the current filter.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const finalCol = getScoreColor(project.final_risk_score);
                const formatRupees = (val?: number | null) => {
                  if (val === undefined || val === null) return 'N/A';
                  return '₹' + Number(val).toLocaleString('en-IN');
                };

                return (
                  <tr key={project.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(project)} title="Click to view full project details & specific site description">
                    <td className="work-id-cell">{project.work_id}</td>
                    <td>{project.state}</td>
                    <td>{project.financial_year}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupees(project.sanction_amount)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupees(project.total_disbursed_amount)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13.5px', color: finalCol }}>
                          {project.final_risk_score.toFixed(1)}%
                        </span>
                        <div style={{ width: '60px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, project.final_risk_score)}%`, height: '100%', backgroundColor: finalCol }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <RiskBadge level={project.risk_level} />
                    </td>
                    <td>
                      <PriorityBadge priority={project.investigation_priority} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
      />
    </div>
  );
};
