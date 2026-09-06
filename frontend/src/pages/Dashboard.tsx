import React, { useEffect, useState } from 'react';
import { 
  FolderGit2, 
  AlertTriangle, 
  AlertOctagon, 
  CreditCard, 
  Layers, 
  ArrowRight, 
  TrendingUp
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
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { getScoreColor } from '../utils/colors';
import { ScoreLegend } from '../components/ScoreLegend';

interface DashboardProps {
  onNavigate: (tab: string, filterParams?: any) => void;
  onSelectProject: (p: Project) => void;
}


const RISK_COLORS = {
  LOW: '#059669',
  MEDIUM: '#F59E0B',
  HIGH: '#DC2626',
  VERY_HIGH: '#991B1B'
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectProject }) => {
  const cachedSummary = api.getCachedSummary();
  const cachedStates = api.getCachedStates() || [];

  const [summary, setSummary] = useState<SystemSummary | null>(cachedSummary);
  const [topHighRisk, setTopHighRisk] = useState<Project[]>([]);
  const [states, setStates] = useState<StateAnalytics[]>(cachedStates);
  const [selectedDonutState, setSelectedDonutState] = useState<string>('ALL');
  const [loading, setLoading] = useState(!cachedSummary);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      if (!summary) setLoading(true);
      setError(null);
      const [summaryData, highRiskData, statesData] = await Promise.all([
        api.getSummary(),
        api.getHighRiskWorks(1, 6),
        api.getStates()
      ]);
      setSummary(summaryData);
      setTopHighRisk(highRiskData.items);
      setStates(statesData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (!summary) {
        setError('Unable to connect to backend server. Please ensure the backend is running or give the cloud instance 20-30s to boot up.');
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
        <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--color-text-muted)' }}>Fetching records and risk indicators...</p>
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
  let currentLow = summary.risk_distribution.LOW;
  let currentMed = summary.risk_distribution.MEDIUM;
  let currentHigh = summary.risk_distribution.HIGH;
  let donutTitle = 'National – Risk Distribution';

  if (selectedDonutState !== 'ALL') {
    const matchedState = states.find(s => s.state === selectedDonutState);
    if (matchedState) {
      currentDonutTotal = matchedState.total_projects;
      currentLow = matchedState.low_risk;
      currentMed = matchedState.medium_risk;
      currentHigh = matchedState.high_risk;
      donutTitle = `${matchedState.state} – Risk Distribution`;
    }
  }

  const dynamicPieData = [
    { name: 'Low Risk', value: currentLow, color: RISK_COLORS.LOW, key: 'LOW' },
    { name: 'Medium Risk', value: currentMed, color: RISK_COLORS.MEDIUM, key: 'MEDIUM' },
    { name: 'High Risk', value: currentHigh, color: RISK_COLORS.HIGH, key: 'HIGH' }
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
      <DisclaimerBanner />

      {/* Page Title */}
      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">National Overview</span>
          <h2>MPLADS Monitoring Dashboard</h2>
          <p>Automated risk monitoring and review prioritization for 98,755 recorded projects</p>
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

      {/* Top 4 KPI Cards */}
      <div className="stat-grid-row">
        <StatCard
          title="Total Monitored Works"
          value={summary.total_projects}
          subtitle="All recorded projects"
          icon={<FolderGit2 size={20} />}
          iconBg="var(--color-primary-bg)"
          iconColor="var(--color-primary)"
          tag="National"
          tagBg="var(--color-primary-bg)"
          tagColor="var(--color-primary)"
        />

        <StatCard
          title="Projects Requiring Review"
          value={summary.requiring_review}
          subtitle="Prioritized for verification"
          icon={<AlertTriangle size={20} />}
          iconBg="var(--risk-med-bg)"
          iconColor="var(--risk-med-text)"
          tag={`${((summary.requiring_review / summary.total_projects) * 100).toFixed(1)}%`}
          tagBg="var(--risk-med-bg)"
          tagColor="var(--risk-med-text)"
        />

        <StatCard
          title="Payment Anomaly Signals"
          value={summary.payment_anomalies}
          subtitle="Disbursement inconsistencies"
          icon={<CreditCard size={20} />}
          iconBg="var(--color-bg-input)"
          iconColor="#2563EB"
          tag="Financial Track"
          tagBg="var(--color-bg-input)"
          tagColor="#2563EB"
        />

        <StatCard
          title="Execution Discrepancies"
          value={summary.execution_consistency_issues}
          subtitle="Zero payment or sanction variance"
          icon={<Layers size={20} />}
          iconBg="var(--risk-high-bg)"
          iconColor="var(--risk-high-text)"
          tag="Audit Check"
          tagBg="var(--risk-high-bg)"
          tagColor="var(--risk-high-text)"
        />
      </div>

      {/* Risk Level Distribution Banner Cards */}
      <div className="risk-stat-grid">
        <div className="risk-kpi-card high">
          <div className="risk-kpi-icon">
            <AlertOctagon size={24} />
          </div>
          <div className="risk-kpi-info">
            <h4>High-Risk Works</h4>
            <div className="val">{summary.risk_distribution.HIGH.toLocaleString()}</div>
            <p>Score 60–100 • Requires priority verification</p>
          </div>
        </div>

        <div className="risk-kpi-card medium">
          <div className="risk-kpi-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="risk-kpi-info">
            <h4>Medium-Risk Works</h4>
            <div className="val">{summary.risk_distribution.MEDIUM.toLocaleString()}</div>
            <p>Score 40–59.99 • Standard close monitoring</p>
          </div>
        </div>

        <div className="risk-kpi-card low">
          <div className="risk-kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="risk-kpi-info">
            <h4>Low-Risk Works</h4>
            <div className="val">{summary.risk_distribution.LOW.toLocaleString()}</div>
            <p>Score 0–39.99 • Routine progress tracking</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid-2">
        {/* Risk Distribution Donut Chart with Inline State Selector */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{donutTitle}</h3>
              <p>Breakdown across policy risk bands in selected scope</p>
            </div>
            {/* Inline State Selector inside the Box */}
            <select
              value={selectedDonutState}
              onChange={(e) => setSelectedDonutState(e.target.value)}
              className="select-control"
              style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: 600, minWidth: '160px' }}
            >
              <option value="ALL">All India (National)</option>
              {states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
          </div>
 
           <div style={{ height: '240px', position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={dynamicPieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={65}
                   outerRadius={95}
                   paddingAngle={3}
                   dataKey="value"
                   isAnimationActive={false}
                 >
                   {dynamicPieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip
                   formatter={(value: any) => [Number(value).toLocaleString(), 'Projects']}
                   contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-main)', fontSize: '12px' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
               <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                 {currentDonutTotal.toLocaleString()}
               </div>
               <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>WORKS</div>
             </div>
           </div>
 
           <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
             {dynamicPieData.map((item) => (
               <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                 <span>
                   {item.name}: <strong>{item.value.toLocaleString()}</strong> ({currentDonutTotal > 0 ? ((item.value / currentDonutTotal) * 100).toFixed(1) : '0'}%)
                 </span>
               </div>
             ))}
           </div>
         </div>
 
         {/* Top States Distribution Bar Chart */}
         <div className="card">
           <div className="card-header">
             <div>
               <h3>Top States by Monitored Projects</h3>
               <p>Project volume and review priorities in top jurisdictions</p>
             </div>
             <button 
               className="btn btn-outline btn-sm"
               onClick={() => onNavigate('state-analytics')}
             >
               All States →
             </button>
           </div>
           <div style={{ height: '260px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={topStatesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                 <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                 <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-main)', fontSize: '12px' }}
                 />
                 <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: 'var(--color-text-secondary)' }} />
                 <Bar dataKey="total" name="Total Works" fill="#005A36" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                 <Bar dataKey="review" name="Requires Review" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                 <Bar dataKey="highRisk" name="High Risk" fill="#DC2626" radius={[4, 4, 0, 0]} isAnimationActive={false} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>

      {/* Score Legend Bar */}
      <div style={{ marginBottom: '18px' }}>
        <ScoreLegend />
      </div>

      {/* High-Risk / Priority Review Preview Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3>Projects Requiring Attention</h3>
            <p>Highest risk projects identified for review</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('high-risk')}
          >
            <span>View All Priority Cases</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Work ID</th>
                <th>Work Title</th>
                <th>State</th>
                <th>Financial Year</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Investigation Priority</th>
                <th>Primary Review Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topHighRisk.map((project) => {
                const finalCol = getScoreColor(project.final_risk_score);
                return (
                  <tr key={project.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(project)}>
                    <td className="work-id-cell">{project.work_id}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.work_title}
                    </td>
                    <td>{project.state}</td>
                    <td>{project.financial_year}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '70px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14.5px', color: finalCol }}>
                          {project.final_risk_score.toFixed(1)}%
                        </span>
                        <div style={{ width: '100%', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
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
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.primary_risk_reason}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                      >
                        View Details
                      </button>
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
