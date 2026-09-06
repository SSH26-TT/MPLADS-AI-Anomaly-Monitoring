import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StateAnalytics as StateData, Project } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ScoreLegend } from '../components/ScoreLegend';
import { getScoreColor } from '../utils/colors';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MapPin, FolderGit2, AlertTriangle, AlertOctagon, TrendingUp, Eye, ArrowRight } from 'lucide-react';

interface StateAnalyticsProps {
  onSelectProject: (p: Project) => void;
  selectedState: string;
  onStateChange: (st: string) => void;
  onNavigate: (tab: string, filters?: any) => void;
}

const RISK_COLORS = {
  low: '#059669',
  medium: '#F59E0B',
  high: '#DC2626'
};

export const StateAnalytics: React.FC<StateAnalyticsProps> = ({
  onSelectProject,
  selectedState,
  onStateChange,
  onNavigate
}) => {
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStateWorks, setSelectedStateWorks] = useState<Project[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  // Active state for detailed analysis
  const [activeState, setActiveState] = useState<string>(selectedState !== 'ALL' ? selectedState : 'Maharashtra');

  useEffect(() => {
    async function loadStateData() {
      setLoading(true);
      try {
        const data = await api.getStates();
        setStates(data);
        if (data.length > 0 && selectedState === 'ALL') {
          setActiveState(data[0].state);
        }
      } catch (err) {
        console.error('Failed to load state analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStateData();
  }, []);

  useEffect(() => {
    if (selectedState && selectedState !== 'ALL') {
      setActiveState(selectedState);
    }
  }, [selectedState]);

  // Load sample high-priority works for selected state
  useEffect(() => {
    async function loadStateWorks() {
      if (!activeState) return;
      setWorksLoading(true);
      try {
        const res = await api.getWorks({
          state: activeState,
          page: 1,
          page_size: 5,
          sort_by: 'final_risk_score',
          sort_order: 'desc'
        });
        setSelectedStateWorks(res.items);
      } catch (err) {
        console.error('Failed to load state works:', err);
      } finally {
        setWorksLoading(false);
      }
    }
    loadStateWorks();
  }, [activeState]);

  const currentStateMetrics = states.find(s => s.state === activeState) || states[0];

  const statePieData = currentStateMetrics ? [
    { name: 'Low Risk', value: currentStateMetrics.low_risk, color: RISK_COLORS.low },
    { name: 'Medium Risk', value: currentStateMetrics.medium_risk, color: RISK_COLORS.medium },
    { name: 'High Risk', value: currentStateMetrics.high_risk, color: RISK_COLORS.high }
  ] : [];

  const top10StatesChartData = states.slice(0, 10).map(s => ({
    name: s.state.length > 12 ? s.state.substring(0, 10) + '..' : s.state,
    total: s.total_projects,
    review: s.requiring_review,
    avgRisk: s.avg_final_risk
  }));

  if (loading || !currentStateMetrics) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading State Wise Analytics...
      </div>
    );
  }

  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">Geographical Risk Analysis</span>
          <h2>State Wise Analysis</h2>
          <p>Distribution of MPLADS works, average risk scores, and review priorities across states</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Select State:</label>
          <select
            value={activeState}
            onChange={(e) => {
              setActiveState(e.target.value);
              onStateChange(e.target.value);
            }}
            className="select-control"
            style={{ fontWeight: 600, minWidth: '200px' }}
          >
            {states.map(s => (
              <option key={s.state} value={s.state}>{s.state} ({s.total_projects.toLocaleString()} works)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected State Metrics */}
      <div className="stat-grid-row">
        <StatCard
          title={`${activeState} - Total Works`}
          value={currentStateMetrics.total_projects}
          subtitle={`Ranked #${states.findIndex(s => s.state === activeState) + 1} by volume`}
          icon={<FolderGit2 size={20} />}
          iconBg="var(--color-primary-bg)"
          iconColor="var(--color-primary)"
        />

        <StatCard
          title="Projects Requiring Review"
          value={currentStateMetrics.requiring_review}
          subtitle={`${((currentStateMetrics.requiring_review / currentStateMetrics.total_projects) * 100).toFixed(1)}% of state works`}
          icon={<AlertTriangle size={20} />}
          iconBg="var(--risk-med-bg)"
          iconColor="var(--risk-med-text)"
        />

        <StatCard
          title="High-Risk Projects"
          value={currentStateMetrics.high_risk_projects}
          subtitle="Score 60–100"
          icon={<AlertOctagon size={20} />}
          iconBg="var(--risk-high-bg)"
          iconColor="var(--risk-high-text)"
        />

        <StatCard
          title="Average Risk Score"
          value={currentStateMetrics.avg_final_risk.toFixed(1)}
          subtitle="State Average (0-100)"
          icon={<TrendingUp size={20} />}
          iconBg="var(--color-bg-input)"
          iconColor="#2563EB"
        />
      </div>

      {/* Charts for Selected State vs Top States */}
      <div className="charts-grid-2">
        {/* Selected State Risk Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{activeState} - Risk Distribution</h3>
              <p>Breakdown across policy risk bands in this state</p>
            </div>
          </div>
          <div style={{ height: '230px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {statePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Projects']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-main)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)' }}>{currentStateMetrics.total_projects.toLocaleString()}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700 }}>WORKS</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
            {statePieData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                <span>{item.name}: <strong>{item.value.toLocaleString()}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 States Comparison Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Top 10 States by Workload</h3>
              <p>Comparative work count and prioritized review cases</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10StatesChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-main)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px', color: 'var(--color-text-secondary)' }} />
                <Bar dataKey="total" name="Total Works" fill="#005A36" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="review" name="Requires Review" fill="#DC2626" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Legend */}
      <div style={{ marginBottom: '16px' }}>
        <ScoreLegend />
      </div>

      {/* Selected State Top Priority Works */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3>Top Prioritized Works in {activeState}</h3>
            <p>Highest risk projects identified in this state</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('projects')}
          >
            <span>View All in {activeState}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Work ID</th>
                <th>Work Title</th>
                <th>Financial Year</th>
                <th style={{ textAlign: 'right' }}>Financial Risk</th>
                <th style={{ textAlign: 'right' }}>Payment Risk</th>
                <th style={{ textAlign: 'right' }}>Exec Risk</th>
                <th style={{ textAlign: 'right' }}>Final Risk</th>
                <th>Risk Level</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {worksLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Loading state works...</td>
                </tr>
              ) : selectedStateWorks.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>No works found for {activeState}</td>
                </tr>
              ) : (
                selectedStateWorks.map(work => {
                  const payRisk = typeof work.payment_risk_0_100 === 'number' ? work.payment_risk_0_100.toFixed(1) : null;
                  const finCol = getScoreColor(work.financial_risk_0_100);
                  const payCol = work.payment_data_available === 1 && typeof work.payment_risk_0_100 === 'number' ? getScoreColor(work.payment_risk_0_100) : 'var(--color-text-muted)';
                  const execCol = getScoreColor(work.execution_risk_0_100);
                  const finalCol = getScoreColor(work.final_risk_score);

                  return (
                    <tr key={work.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(work)}>
                      <td className="work-id-cell">{work.work_id}</td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {work.work_title}
                      </td>
                      <td>{work.financial_year}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: finCol }}>{work.financial_risk_0_100.toFixed(1)}%</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {payRisk !== null ? (
                          <span style={{ fontWeight: 700, color: payCol }}>{payRisk}%</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 400 }}>N/A</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: execCol }}>{work.execution_risk_0_100.toFixed(1)}%</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          <span style={{ fontWeight: 800, fontSize: '14.5px', color: finalCol }}>
                            {work.final_risk_score.toFixed(1)}%
                          </span>
                          <div style={{ width: '48px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, work.final_risk_score)}%`, height: '100%', backgroundColor: finalCol }} />
                          </div>
                        </div>
                      </td>
                      <td><RiskBadge level={work.risk_level} /></td>
                      <td><PriorityBadge priority={work.investigation_priority} /></td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(work);
                          }}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive All States Summary Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>All States & UTs Risk Overview</h3>
            <p>Comparative metrics across all 36 administrative jurisdictions</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>State / UT</th>
                <th style={{ textAlign: 'right' }}>Total Works</th>
                <th style={{ textAlign: 'right' }}>Requiring Review</th>
                <th style={{ textAlign: 'right' }}>High Risk</th>
                <th style={{ textAlign: 'right' }}>Avg Risk Score</th>
                <th style={{ textAlign: 'right' }}>Low Risk</th>
                <th style={{ textAlign: 'right' }}>Medium Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {states.map((st, idx) => (
                <tr key={st.state} style={{ backgroundColor: st.state === activeState ? 'var(--color-bg-input)' : 'inherit' }}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                  <td>
                    <strong>{st.state}</strong>
                    {st.state === activeState && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>[Selected]</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{st.total_projects.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#D97706' }}>
                    {st.requiring_review.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>
                    {st.high_risk_projects.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{ fontWeight: 700, color: getScoreColor(st.avg_final_risk) }}>
                        {st.avg_final_risk.toFixed(1)}%
                      </span>
                      <div style={{ width: '40px', height: '3px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, st.avg_final_risk)}%`, height: '100%', backgroundColor: getScoreColor(st.avg_final_risk) }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{st.low_risk.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{st.medium_risk.toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setActiveState(st.state);
                        onStateChange(st.state);
                      }}
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
