import React, { useEffect, useState } from 'react';
import { 
  FolderGit2, 
  AlertTriangle, 
  AlertOctagon, 
  CreditCard, 
  Layers, 
  ArrowRight, 
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { api } from '../services/api';
import { SystemSummary, Project, StateAnalytics } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { getScoreColor } from '../utils/colors';

interface DashboardProps {
  onNavigate: (tab: string, filterParams?: any) => void;
  onSelectProject: (p: Project) => void;
}

const RISK_COLORS = {
  LOW: '#059669',
  MEDIUM: '#F59E0B',
  HIGH: '#DC2626',
  VERY_HIGH: '#7F1D1D'
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectProject }) => {
  const cachedSummary = api.getCachedSummary();
  const cachedStates = api.getCachedStates() || [];

  const [summary, setSummary] = useState<SystemSummary | null>(cachedSummary);
  const [recentWorks, setRecentWorks] = useState<Project[]>([]);
  const [states, setStates] = useState<StateAnalytics[]>(cachedStates);
  const [selectedDonutState, setSelectedDonutState] = useState<string>('ALL');
  const [hoveredSlice, setHoveredSlice] = useState<any>(null);
  const [loading, setLoading] = useState(!cachedSummary);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      if (!summary) setLoading(true);
      setError(null);
      const [summaryData, recentMixData, statesData] = await Promise.all([
        api.getSummary(),
        api.getRecentMix().catch(async () => {
          const fallback = await api.getWorks({ page: 1, page_size: 8 });
          return fallback.items;
        }),
        api.getStates()
      ]);
      setSummary(summaryData);
      setRecentWorks(recentMixData);
      setStates(statesData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (!summary) {
        setError('Unable to connect to backend server. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !summary) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Loading MPLADS Monitoring Dashboard...</div>
        <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--color-text-muted)' }}>Fetching national records and portfolio indicators...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#DC2626', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>Connection Delay</div>
        <p style={{ fontSize: '14px', color: '#475569', marginTop: '8px', marginBottom: '16px' }}>{error || 'Unable to load dashboard data.'}</p>
        <button className="btn btn-primary btn-sm" onClick={loadDashboardData}>Retry Connection</button>
      </div>
    );
  }

  // Calculate dynamic Donut data based on selected state in the box
  let currentDonutTotal = summary.total_projects;
  let currentLow = summary.risk_distribution.LOW || 0;
  let currentMed = summary.risk_distribution.MEDIUM || 0;
  let currentHigh = summary.risk_distribution.HIGH || 0;
  let currentVeryHigh = summary.risk_distribution.VERY_HIGH || 0;
  let donutTitle = 'National – Risk Distribution';

  if (selectedDonutState !== 'ALL') {
    const matchedState = states.find(s => s.state === selectedDonutState);
    if (matchedState) {
      currentDonutTotal = matchedState.total_projects;
      currentLow = matchedState.low_risk;
      currentMed = matchedState.medium_risk;
      currentHigh = matchedState.high_risk;
      currentVeryHigh = matchedState.very_high_risk || 0;
      donutTitle = `${matchedState.state} – Risk Distribution`;
    }
  }

  const dynamicPieData = [
    { name: 'Low Risk', value: currentLow, color: RISK_COLORS.LOW, key: 'LOW' },
    { name: 'Medium Risk', value: currentMed, color: RISK_COLORS.MEDIUM, key: 'MEDIUM' },
    { name: 'High Risk', value: currentHigh, color: RISK_COLORS.HIGH, key: 'HIGH' },
    ...(currentVeryHigh > 0 ? [{ name: 'Very High Risk', value: currentVeryHigh, color: RISK_COLORS.VERY_HIGH, key: 'VERY_HIGH' }] : [])
  ];

  // Top 5 States by project count for Bar Chart
  const topStatesData = states.slice(0, 5).map(s => ({
    name: s.state.length > 14 ? s.state.substring(0, 12) + '...' : s.state,
    total: s.total_projects,
    review: s.requiring_review,
    highRisk: s.high_risk_projects
  }));

  return (
    <div>
      {/* Page Title */}
      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">National Overview</span>
          <h2>MPLADS Monitoring Dashboard</h2>
        </div>
        <div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('projects')}
          >
            <span>Explore All Works</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards (Clean Title & Number Only) */}
      <div className="stat-grid-row">
        <div 
          onClick={() => onNavigate('projects', { risk_level: 'ALL', investigation_priority: 'ALL' })}
          style={{ cursor: 'pointer' }}
          title="Click to view all monitored works"
        >
          <StatCard
            title="Total Monitored Works"
            value={summary.total_projects}
            icon={<FolderGit2 size={18} />}
            iconBg="var(--color-primary-bg)"
            iconColor="var(--color-primary)"
          />
        </div>

        <div 
          onClick={() => onNavigate('projects', { investigation_priority: 'REVIEW' })}
          style={{ cursor: 'pointer' }}
          title="Click to view works requiring review"
        >
          <StatCard
            title="Projects Requiring Review"
            value={summary.requiring_review}
            icon={<AlertTriangle size={18} />}
            iconBg="var(--risk-med-bg)"
            iconColor="var(--risk-med-text)"
          />
        </div>

        <div 
          onClick={() => onNavigate('projects', { payment_data_available: '1' })}
          style={{ cursor: 'pointer' }}
          title="Click to filter projects with payment tracking"
        >
          <StatCard
            title="Payment Anomaly Signals"
            value={summary.payment_anomalies}
            icon={<CreditCard size={18} />}
            iconBg="var(--color-bg-input)"
            iconColor="#2563EB"
          />
        </div>

        <div 
          onClick={() => onNavigate('projects', { risk_level: 'HIGH' })}
          style={{ cursor: 'pointer' }}
          title="Click to view schedule & execution alerts"
        >
          <StatCard
            title="Schedule & Execution Issues"
            value={summary.execution_consistency_issues}
            icon={<Layers size={18} />}
            iconBg="var(--risk-high-bg)"
            iconColor="var(--risk-high-text)"
          />
        </div>
      </div>

      {/* 4-Tier Risk Distribution Banner Cards (Clean Title & Number Only) */}
      <div className="risk-stat-grid">
        {/* Very High Risk */}
        <div 
          className="risk-kpi-card" 
          onClick={() => onNavigate('projects', { risk_level: 'VERY_HIGH' })}
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', cursor: 'pointer' }}
          title="Click to view all Very High Risk projects in All Works"
        >
          <div className="risk-kpi-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <ShieldAlert size={18} />
          </div>
          <div className="risk-kpi-info">
            <h4 style={{ color: '#991B1B' }}>Very High Risk</h4>
            <div className="val" style={{ color: '#7F1D1D' }}>{(summary.risk_distribution.VERY_HIGH || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* High Risk */}
        <div 
          className="risk-kpi-card high"
          onClick={() => onNavigate('projects', { risk_level: 'HIGH' })}
          style={{ cursor: 'pointer' }}
          title="Click to view all High-Risk projects in All Works"
        >
          <div className="risk-kpi-icon">
            <AlertOctagon size={18} />
          </div>
          <div className="risk-kpi-info">
            <h4>High-Risk Works</h4>
            <div className="val">{(summary.risk_distribution.HIGH || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Medium Risk */}
        <div 
          className="risk-kpi-card medium"
          onClick={() => onNavigate('projects', { risk_level: 'MEDIUM' })}
          style={{ cursor: 'pointer' }}
          title="Click to view all Medium-Risk projects in All Works"
        >
          <div className="risk-kpi-icon">
            <AlertTriangle size={18} />
          </div>
          <div className="risk-kpi-info">
            <h4>Medium-Risk Works</h4>
            <div className="val">{(summary.risk_distribution.MEDIUM || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Low Risk */}
        <div 
          className="risk-kpi-card low"
          onClick={() => onNavigate('projects', { risk_level: 'LOW' })}
          style={{ cursor: 'pointer' }}
          title="Click to view all Low-Risk projects in All Works"
        >
          <div className="risk-kpi-icon">
            <TrendingUp size={18} />
          </div>
          <div className="risk-kpi-info">
            <h4>Low-Risk Works</h4>
            <div className="val">{(summary.risk_distribution.LOW || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Charts Section: Equal Height & Compact */}
      <div className="charts-grid-2">
        {/* Risk Distribution Donut Chart with Side-by-Side 2x2 Labels (2 Left, 2 Right) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{donutTitle}</h3>
            </div>
            {/* Inline State Selector inside the Box */}
            <select
              value={selectedDonutState}
              onChange={(e) => setSelectedDonutState(e.target.value)}
              className="select-control"
              style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, minWidth: '150px' }}
            >
              <option value="ALL">All India (National)</option>
              {states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>

          <div className="donut-content-row">
            {/* Left 2 Labels: Low Risk & Medium Risk */}
            <div className="donut-labels-col">
              {dynamicPieData.filter(d => d.key === 'LOW' || d.key === 'MEDIUM').map(item => (
                <div 
                  key={item.key}
                  className={`donut-side-label ${hoveredSlice?.key === item.key ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredSlice(item)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => onNavigate('projects', { risk_level: item.key })}
                  title={`Click to view all ${item.name} in All Works`}
                >
                  <div className="donut-side-header">
                    <div className="donut-label-dot" style={{ backgroundColor: item.color }} />
                    <span className="donut-label-name">{item.name}</span>
                  </div>
                  <div className="donut-label-val" style={{ color: item.color }}>
                    {item.value.toLocaleString()} <span>({currentDonutTotal > 0 ? ((item.value / currentDonutTotal) * 100).toFixed(1) : '0'}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Donut Chart Ring */}
            <div className="donut-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setHoveredSlice(dynamicPieData[index])}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {dynamicPieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ 
                          cursor: 'pointer',
                          filter: hoveredSlice?.key === entry.key ? 'brightness(1.15) drop-shadow(0 0 5px rgba(0,0,0,0.3))' : 'none',
                          transition: 'filter 0.15s ease'
                        }}
                        onClick={() => onNavigate('projects', { risk_level: entry.key })}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-badge">
                <div className="donut-center-val">{currentDonutTotal.toLocaleString()}</div>
                <div className="donut-center-sub">WORKS</div>
              </div>
            </div>

            {/* Right 2 Labels: High Risk & Very High Risk */}
            <div className="donut-labels-col">
              {dynamicPieData.filter(d => d.key === 'HIGH' || d.key === 'VERY_HIGH').map(item => (
                <div 
                  key={item.key}
                  className={`donut-side-label ${hoveredSlice?.key === item.key ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredSlice(item)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => onNavigate('projects', { risk_level: item.key })}
                  title={`Click to view all ${item.name} in All Works`}
                >
                  <div className="donut-side-header">
                    <div className="donut-label-dot" style={{ backgroundColor: item.color }} />
                    <span className="donut-label-name">{item.name}</span>
                  </div>
                  <div className="donut-label-val" style={{ color: item.color }}>
                    {item.value.toLocaleString()} <span>({currentDonutTotal > 0 ? ((item.value / currentDonutTotal) * 100).toFixed(1) : '0'}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top States Distribution Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Top States by Monitored Projects</h3>
            </div>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('state-analytics')}
            >
              All States →
            </button>
          </div>
          <div style={{ height: '185px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStatesData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="barGradReview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="barGradHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          background: 'rgba(15, 23, 42, 0.94)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(8px)',
                          pointerEvents: 'none',
                          minWidth: '140px'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '11.5px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '3px', marginBottom: '4px', color: '#F1F5F9' }}>
                            {label}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {payload.map((item: any) => (
                              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#CBD5E1', fontSize: '10.5px' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color || item.fill }} />
                                  {item.name}:
                                </span>
                                <strong style={{ color: '#FFFFFF', fontSize: '11px' }}>{Number(item.value).toLocaleString()}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px', color: 'var(--color-text-secondary)' }} />
                <Bar dataKey="total" name="Total Works" fill="url(#barGradTotal)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="review" name="Requires Review" fill="url(#barGradReview)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="highRisk" name="High Risk" fill="url(#barGradHigh)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Monitored Works Table (Representative Mix of All Risk Tiers) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <h3>Recent Monitored Works</h3>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('projects')}
          >
            <span>Explore All Works</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Work ID</th>
                <th>State</th>
                <th>Financial Year</th>
                <th>Overall Risk Score</th>
                <th>Risk Level</th>
                <th>Investigation Priority</th>
              </tr>
            </thead>
            <tbody>
              {recentWorks.map((project) => {
                const finalCol = getScoreColor(project.final_risk_score);
                return (
                  <tr key={project.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(project)} title="Click to view full project details & specific site description">
                    <td className="work-id-cell">{project.work_id}</td>
                    <td>{project.state}</td>
                    <td>{project.financial_year}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', minWidth: '70px', margin: '0 auto' }}>
                        <span style={{ fontWeight: 800, fontSize: '14.5px', color: finalCol }}>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
