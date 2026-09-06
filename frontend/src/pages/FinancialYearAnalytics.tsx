import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FinancialYearAnalytics as FYData } from '../types';
import { StatCard } from '../components/StatCard';
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
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="total" name="Total Works" fill="#005A36" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="review" name="Requires Review" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="highRisk" name="High Risk" fill="#DC2626" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Risk Score Trajectory */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Average Detected Risk Trajectory</h3>
              <p>Changes in mean anomaly scores across fiscal periods</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 40]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="avgRisk" name="Average Risk Score (0-100)" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Legend Banner */}
      <div style={{ marginBottom: '16px' }}>
        <ScoreLegend />
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
                <th style={{ textAlign: 'right' }}>Total Monitored Works</th>
                <th style={{ textAlign: 'right' }}>Requiring Review</th>
                <th style={{ textAlign: 'right' }}>Review Rate</th>
                <th style={{ textAlign: 'right' }}>High-Risk Works</th>
                <th style={{ textAlign: 'right' }}>Avg Risk Score</th>
                <th style={{ textAlign: 'right' }}>Low Risk Count</th>
                <th style={{ textAlign: 'right' }}>Medium Risk Count</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.financial_year}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{y.financial_year}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{y.total_projects.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#D97706' }}>{y.requiring_review.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{((y.requiring_review / y.total_projects) * 100).toFixed(2)}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: y.high_risk_projects > 0 ? '#DC2626' : 'inherit' }}>
                    {y.high_risk_projects.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: getScoreColor(y.avg_final_risk) }}>
                      {y.avg_final_risk.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{y.low_risk.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{y.medium_risk.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


