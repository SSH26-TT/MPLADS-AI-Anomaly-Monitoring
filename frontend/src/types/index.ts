export interface Project {
  work_id: string;
  house?: string | null;
  mp_key?: string | null;
  state: string;
  ida?: string | null;
  work_category?: string | null;
  work_title: string;
  financial_year: string;

  financial_anomaly_score: number;
  financial_risk_0_100: number;

  payment_data_available: number;
  payment_anomaly_score?: number | null;
  payment_risk_0_100?: number | null;
  payment_anomaly_flag?: boolean | null;

  execution_risk_0_100: number;
  execution_consistency_flag: number;

  combined_base_risk: number;
  final_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  investigation_priority: 'NORMAL' | 'REVIEW' | 'HIGH_REVIEW' | 'CRITICAL_REVIEW';
  primary_risk_reason: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SystemSummary {
  total_projects: number;
  requiring_review: number;
  high_risk_projects: number;
  payment_anomalies: number;
  execution_consistency_issues: number;
  average_risk_score: number;
  risk_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    VERY_HIGH: number;
  };
  investigation_priority_distribution: {
    NORMAL: number;
    REVIEW: number;
    HIGH_REVIEW: number;
    CRITICAL_REVIEW?: number;
  };
  primary_risk_reason_distribution: Record<string, number>;
  payment_data_distribution: {
    Available: number;
    Unavailable: number;
  };
}

export interface RiskComponentDistribution {
  financial_risk_avg: number;
  payment_risk_avg: number;
  execution_risk_avg: number;
  combined_risk_avg: number;
  with_payment_data_count: number;
  without_payment_data_count: number;
}

export interface StateAnalytics {
  state: string;
  total_projects: number;
  requiring_review: number;
  high_risk_projects: number;
  avg_final_risk: number;
  avg_financial_risk: number;
  avg_payment_risk: number | null;
  avg_execution_risk: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
  very_high_risk: number;
}

export interface FinancialYearAnalytics {
  financial_year: string;
  total_projects: number;
  requiring_review: number;
  high_risk_projects: number;
  avg_final_risk: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
  very_high_risk: number;
}

export interface FilterOptions {
  states: string[];
  financial_years: string[];
  work_categories: string[];
  risk_levels: string[];
  investigation_priorities: string[];
  primary_risk_reasons: string[];
}

export interface ProjectFilters {
  page?: number;
  page_size?: number;
  search?: string;
  state?: string;
  financial_year?: string;
  work_category?: string;
  risk_level?: string;
  investigation_priority?: string;
  primary_risk_reason?: string;
  payment_data_available?: number;
  payment_anomaly_flag?: boolean;
  execution_consistency_flag?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
