import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FinancialYearAnalytics as FYData } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { getScoreColor } from '../utils/colors';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { CalendarRange, TrendingUp, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';


export const FinancialYearAnalytics: React.FC = () => {
  const [years, setYears] = useState<FYData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFYData() {
      setLoading(true);
      try {
        const data = await api.getFinancialYears();
        setYears(data);
      } catch (err) {
        console.error('Failed to load FY analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFYData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading Financial Year Analytics...
      </div>
    );
  }

  const chartData = years.map(y => ({
    year: y.financial_year,
    total: y.total_projects,
    review: y.requiring_review,
    highRisk: y.high_risk_projects,
    avgRisk: y.avg_final_risk
  }));

  return (
    <div>
      <DisclaimerBanner />

      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">Temporal Pattern Tracking</span>
          <h2>Financial Year Analytics</h2>
          <p>Multi-year evolution of monitored works, risk policy bands, and review indicators</p>
        </div>
      </div>

      {/* Yearly KPI Overview Cards */}
      <div className="stat-grid-row">
        {years.map((y) => (
          <div key={y.financial_year} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{y.financial_year}</span>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#F0FDF4', color: '#005A36' }}>
                <CalendarRange size={18} />
              </div>
            </div>
            <div className="stat-value">{y.total_projects.toLocaleString()}</div>
            <div className="stat-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px' }}>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>{y.high_risk_projects} High Risk</span>
                <span>•</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>{y.requiring_review} Review</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Avg Risk: <strong>{y.avg_final_risk.toFixed(1)}</strong> / 100
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-2">
        {/* Project Volume & Review Demand Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Workload & Review Demand by Year</h3>
              <p>Total recorded projects vs projects flagged for human review</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barFyTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="barFyReview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="barFyHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: 'var(--color-text-secondary)' }} />
                <Bar dataKey="total" name="Total Works" fill="url(#barFyTotal)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="review" name="Requires Review" fill="url(#barFyReview)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="highRisk" name="High Risk" fill="url(#barFyHigh)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Risk Score Trajectory */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Portfolio Risk Trajectory</h3>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip 
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
                          pointerEvents: 'none'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#F1F5F9' }}>
                            {label}: <span style={{ color: '#34D399' }}>{Number(payload[0].value).toFixed(2)}% Avg Risk</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: 'var(--color-text-secondary)' }} />
                <Line type="monotone" dataKey="avgRisk" name="Average Risk Score" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Year-by-Year Risk Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Financial Year Statistical Matrix</h3>
            <p>Annual breakdown of policy risk classifications</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Financial Year</th>
                <th>Total Monitored Works</th>
                <th>Requiring Review</th>
                <th>Review Rate</th>
                <th>High-Risk Works</th>
                <th>Avg Risk Score</th>
                <th>Low Risk Count</th>
                <th>Medium Risk Count</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.financial_year}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{y.financial_year}</td>
                  <td style={{ fontWeight: 700 }}>{y.total_projects.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#D97706' }}>{y.requiring_review.toLocaleString()}</td>
                  <td>{((y.requiring_review / y.total_projects) * 100).toFixed(2)}%</td>
                  <td style={{ fontWeight: 700, color: y.high_risk_projects > 0 ? '#DC2626' : 'inherit' }}>
                    {y.high_risk_projects.toLocaleString()}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: getScoreColor(y.avg_final_risk) }}>
                      {y.avg_final_risk.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>{y.low_risk.toLocaleString()}</td>
                  <td style={{ color: '#D97706', fontWeight: 600 }}>{y.medium_risk.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


