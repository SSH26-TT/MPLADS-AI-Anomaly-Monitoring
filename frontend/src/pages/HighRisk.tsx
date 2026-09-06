import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Pagination } from '../components/Pagination';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ScoreLegend } from '../components/ScoreLegend';
import { getScoreColor } from '../utils/colors';
import { AlertTriangle, AlertOctagon, Layers, CreditCard, Eye, ShieldAlert, RefreshCw } from 'lucide-react';


interface HighRiskProps {
  onSelectProject: (p: Project) => void;
  selectedState: string;
}

export const HighRisk: React.FC<HighRiskProps> = ({ onSelectProject, selectedState }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL_REVIEW' | 'HIGH_RISK' | 'HIGH_PRIO' | 'EXECUTION' | 'PAYMENT'>('ALL_REVIEW');

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
        filters.risk_level = 'HIGH';
      } else if (activeQuickFilter === 'HIGH_PRIO') {
        filters.investigation_priority = 'HIGH_REVIEW';
      } else if (activeQuickFilter === 'EXECUTION') {
        filters.execution_consistency_flag = 1;
      } else if (activeQuickFilter === 'PAYMENT') {
        filters.payment_anomaly_flag = true;
      } else {
        filters.investigation_priority = 'REVIEW';
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

  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag" style={{ color: '#DC2626' }}>Review Priority Queue</span>
          <h2>Projects Requiring Human Review</h2>
          <p>Prioritized MPLADS projects with unusual financial patterns, payment flags, or execution discrepancies</p>
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
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>2,090</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Flagged for inspection</div>
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
            <AlertOctagon size={15} /> High Risk Projects
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>190</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Score 60–100</div>
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
            <ShieldAlert size={15} /> High Priority
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>58</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Top attention required</div>
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
            <Layers size={15} /> Execution Discrepancies
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>105</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Payment/Sanction mismatch</div>
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
            <CreditCard size={15} /> Payment Anomalies
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>129</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>Unusual disbursement pattern</div>
        </button>
      </div>

      {/* Score Legend Banner */}
      <div style={{ marginBottom: '16px' }}>
        <ScoreLegend />
      </div>

      {/* High-Risk Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Work ID</th>
              <th>Work Title</th>
              <th>State</th>
              <th>FY</th>
              <th style={{ textAlign: 'right' }}>Financial Risk</th>
              <th style={{ textAlign: 'right' }}>Payment Risk</th>
              <th style={{ textAlign: 'right' }}>Exec Risk</th>
              <th style={{ textAlign: 'right' }}>Final Risk</th>
              <th>Risk Level</th>
              <th>Priority</th>
              <th>Primary Review Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Loading prioritized review queue...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}>
                  <div>{error}</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} onClick={fetchPriorityQueue}>
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </button>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  No prioritized works found under this filter.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const payRisk = typeof project.payment_risk_0_100 === 'number' ? project.payment_risk_0_100.toFixed(1) : null;
                const finCol = getScoreColor(project.financial_risk_0_100);
                const payCol = project.payment_data_available === 1 && typeof project.payment_risk_0_100 === 'number' ? getScoreColor(project.payment_risk_0_100) : 'var(--color-text-muted)';
                const execCol = getScoreColor(project.execution_risk_0_100);
                const finalCol = getScoreColor(project.final_risk_score);

                return (
                  <tr key={project.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(project)}>
                    <td className="work-id-cell">{project.work_id}</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.work_title}
                    </td>
                    <td>{project.state}</td>
                    <td>{project.financial_year}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: finCol }}>
                        {project.financial_risk_0_100.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {payRisk !== null ? (
                        <span style={{ fontWeight: 700, color: payCol }}>
                          {payRisk}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 400 }}>N/A</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: execCol }}>
                        {project.execution_risk_0_100.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: finalCol }}>
                          {project.final_risk_score.toFixed(1)}%
                        </span>
                        <div style={{ width: '48px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
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
                    <td style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--color-text-main)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.primary_risk_reason}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                        title="Inspect case details"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>
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
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
      />
    </div>
  );
};
