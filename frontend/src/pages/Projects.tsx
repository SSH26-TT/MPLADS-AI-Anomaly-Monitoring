import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Project, FilterOptions, ProjectFilters } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Pagination } from '../components/Pagination';
import { getScoreColor } from '../utils/colors';
import { Search, RotateCcw, ArrowUpDown, RefreshCw } from 'lucide-react';

interface ProjectsProps {
  onSelectProject: (p: Project) => void;
  globalSearch: string;
  selectedState: string;
  initialFilters?: {
    risk_level?: string;
    investigation_priority?: string;
    payment_data_available?: string;
    state?: string;
  } | null;
}

export const Projects: React.FC<ProjectsProps> = ({ 
  onSelectProject, 
  globalSearch, 
  selectedState,
  initialFilters 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  // Filters State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState(globalSearch || '');
  const [stateFilter, setStateFilter] = useState(selectedState !== 'ALL' ? selectedState : (initialFilters?.state || 'ALL'));
  const [fyFilter, setFyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState(initialFilters?.risk_level || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(initialFilters?.investigation_priority || 'ALL');
  const [paymentAvailFilter, setPaymentAvailFilter] = useState<string>(initialFilters?.payment_data_available || 'ALL');
  const [sortBy, setSortBy] = useState('final_risk_score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Load filter options on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const opts = await api.getFilters();
        setFilterOptions(opts);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadFilters();
  }, []);

  // Sync global search and state filter
  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== search) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);

  useEffect(() => {
    if (selectedState && selectedState !== stateFilter) {
      setStateFilter(selectedState);
    }
  }, [selectedState]);

  // Sync initial navigation filters from dashboard clicks
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.risk_level !== undefined) {
        setRiskFilter(initialFilters.risk_level);
      }
      if (initialFilters.investigation_priority !== undefined) {
        setPriorityFilter(initialFilters.investigation_priority);
      }
      if (initialFilters.payment_data_available !== undefined) {
        setPaymentAvailFilter(initialFilters.payment_data_available);
      }
      if (initialFilters.state !== undefined) {
        setStateFilter(initialFilters.state);
      }
      setPage(1);
    }
  }, [initialFilters]);

  // Fetch works from backend API
  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ProjectFilters = {
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
        financial_year: fyFilter !== 'ALL' ? fyFilter : undefined,
        work_category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
        investigation_priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        payment_data_available: paymentAvailFilter === '1' ? 1 : paymentAvailFilter === '0' ? 0 : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const res = await api.getWorks(params);
      setProjects(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Failed to fetch works:', err);
      setError('Unable to load projects from server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, stateFilter, fyFilter, categoryFilter, riskFilter, priorityFilter, paymentAvailFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('ALL');
    setFyFilter('ALL');
    setCategoryFilter('ALL');
    setRiskFilter('ALL');
    setPriorityFilter('ALL');
    setPaymentAvailFilter('ALL');
    setSortBy('final_risk_score');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <span className="page-badge-tag">Registry & Monitoring</span>
          <h2>All Monitored MPLADS Projects</h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="filter-group" style={{ flex: '1 1 200px' }}>
          <label>Search Works</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Work ID, title, representative, district..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontFamily: 'inherit',
                color: 'var(--color-text-main)'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </div>
        </div>

        {filterOptions ? (
          <>
            <div className="filter-group">
              <label>State</label>
              <select
                value={stateFilter}
                onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                className="select-control"
              >
                <option value="ALL">All States</option>
                {filterOptions.states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Financial Year</label>
              <select
                value={fyFilter}
                onChange={(e) => { setFyFilter(e.target.value); setPage(1); }}
                className="select-control"
              >
                <option value="ALL">All Financial Years</option>
                {filterOptions.financial_years.map((fy) => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                className="select-control"
              >
                <option value="ALL">All Risk Levels</option>
                {filterOptions.risk_levels.map((r) => {
                  const label = r === 'VERY_HIGH' ? 'Very High' : r === 'HIGH' ? 'High' : r === 'MEDIUM' ? 'Medium' : r === 'LOW' ? 'Low' : r;
                  return <option key={r} value={r}>{label}</option>;
                })}
              </select>
            </div>

            <div className="filter-group">
              <label>Review Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="select-control"
              >
                <option value="ALL">All Priorities</option>
                {filterOptions.investigation_priorities.map((p) => {
                  const label = p === 'CRITICAL_REVIEW' ? 'Critical Review' : p === 'HIGH_REVIEW' ? 'High Priority Review' : p === 'REVIEW' ? 'Requires Review' : p === 'NORMAL' ? 'Normal' : p.replace(/_/g, ' ');
                  return <option key={p} value={p}>{label}</option>;
                })}
              </select>
            </div>

            <div className="filter-group">
              <label>Payment Record</label>
              <select
                value={paymentAvailFilter}
                onChange={(e) => { setPaymentAvailFilter(e.target.value); setPage(1); }}
                className="select-control"
              >
                <option value="ALL">All Projects</option>
                <option value="1">With Payment Data</option>
                <option value="0">Without Payment Data</option>
              </select>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            Loading filter options...
          </div>
        )}

        <div style={{ alignSelf: 'flex-end', marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={handleResetFilters} title="Reset all filters">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSortToggle('work_id')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Work ID {sortBy === 'work_id' && <ArrowUpDown size={12} />}
                </span>
              </th>
              <th onClick={() => handleSortToggle('state')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  State {sortBy === 'state' && <ArrowUpDown size={12} />}
                </span>
              </th>
              <th>FY</th>
              <th>Financial Risk</th>
              <th>Payment Risk</th>
              <th>Exec Risk</th>
              <th onClick={() => handleSortToggle('final_risk_score')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Final Risk {sortBy === 'final_risk_score' && <ArrowUpDown size={12} />}
                </span>
              </th>
              <th>Risk Level</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Filtering projects...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}>
                  <div>{error}</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} onClick={fetchWorks}>
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </button>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  No projects found matching your search.
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
                  <tr key={project.work_id} style={{ cursor: 'pointer' }} onClick={() => onSelectProject(project)} title="Click to view full project details & specific site description">
                    <td className="work-id-cell">{project.work_id}</td>
                    <td>{project.state}</td>
                    <td>{project.financial_year}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: finCol }}>
                        {project.financial_risk_0_100.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      {payRisk !== null ? (
                        <span style={{ fontWeight: 700, color: payCol }}>
                          {payRisk}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 400 }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: execCol }}>
                        {project.execution_risk_0_100.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', margin: '0 auto' }}>
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
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
