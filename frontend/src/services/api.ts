import { 
  Project, 
  PaginatedResponse, 
  SystemSummary, 
  RiskComponentDistribution, 
  StateAnalytics, 
  FinancialYearAnalytics, 
  FilterOptions,
  ProjectFilters
} from '../types';

const API_BASE = '/api';

export const api = {
  async getSummary(): Promise<SystemSummary> {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    return res.json();
  },

  async getRiskDistribution(): Promise<{ total: number; distribution: Array<{ risk_level: string; count: number; percentage: number }> }> {
    const res = await fetch(`${API_BASE}/risk-distribution`);
    if (!res.ok) throw new Error(`Failed to fetch risk distribution: ${res.statusText}`);
    return res.json();
  },

  async getRiskComponents(): Promise<RiskComponentDistribution> {
    const res = await fetch(`${API_BASE}/risk-components`);
    if (!res.ok) throw new Error(`Failed to fetch risk components: ${res.statusText}`);
    return res.json();
  },

  async getWorks(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.page_size) params.set('page_size', filters.page_size.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.state && filters.state !== 'ALL') params.set('state', filters.state);
    if (filters.financial_year && filters.financial_year !== 'ALL') params.set('financial_year', filters.financial_year);
    if (filters.work_category && filters.work_category !== 'ALL') params.set('work_category', filters.work_category);
    if (filters.risk_level && filters.risk_level !== 'ALL') params.set('risk_level', filters.risk_level);
    if (filters.investigation_priority && filters.investigation_priority !== 'ALL') params.set('investigation_priority', filters.investigation_priority);
    if (filters.primary_risk_reason && filters.primary_risk_reason !== 'ALL') params.set('primary_risk_reason', filters.primary_risk_reason);
    if (filters.payment_data_available !== undefined) params.set('payment_data_available', filters.payment_data_available.toString());
    if (filters.payment_anomaly_flag !== undefined) params.set('payment_anomaly_flag', filters.payment_anomaly_flag.toString());
    if (filters.execution_consistency_flag !== undefined) params.set('execution_consistency_flag', filters.execution_consistency_flag.toString());
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_order) params.set('sort_order', filters.sort_order);

    const res = await fetch(`${API_BASE}/works?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch works: ${res.statusText}`);
    return res.json();
  },

  async getWorkById(workId: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/works/${encodeURIComponent(workId)}`);
    if (!res.ok) throw new Error(`Failed to fetch work details: ${res.statusText}`);
    return res.json();
  },

  async getHighRiskWorks(page = 1, pageSize = 25, state?: string, financialYear?: string): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (state && state !== 'ALL') params.set('state', state);
    if (financialYear && financialYear !== 'ALL') params.set('financial_year', financialYear);
    
    const res = await fetch(`${API_BASE}/high-risk?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch high-risk works: ${res.statusText}`);
    return res.json();
  },

  async getStates(): Promise<StateAnalytics[]> {
    const res = await fetch(`${API_BASE}/states`);
    if (!res.ok) throw new Error(`Failed to fetch state analytics: ${res.statusText}`);
    return res.json();
  },

  async getFinancialYears(): Promise<FinancialYearAnalytics[]> {
    const res = await fetch(`${API_BASE}/financial-years`);
    if (!res.ok) throw new Error(`Failed to fetch financial years: ${res.statusText}`);
    return res.json();
  },

  async getRiskReasons(): Promise<Array<{ reason: string; count: number; percentage: number; avg_risk: number }>> {
    const res = await fetch(`${API_BASE}/risk-reasons`);
    if (!res.ok) throw new Error(`Failed to fetch risk reasons: ${res.statusText}`);
    return res.json();
  },

  async getFilters(): Promise<FilterOptions> {
    const res = await fetch(`${API_BASE}/filters`);
    if (!res.ok) throw new Error(`Failed to fetch filter options: ${res.statusText}`);
    return res.json();
  }
};
