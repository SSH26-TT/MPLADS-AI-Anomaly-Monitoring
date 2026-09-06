from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class ProjectDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    work_id: str
    house: Optional[str] = None
    mp_key: Optional[str] = None
    state: str
    ida: Optional[str] = None
    work_category: Optional[str] = None
    work_title: str
    financial_year: str

    financial_anomaly_score: float
    financial_risk_0_100: float

    payment_data_available: int
    payment_anomaly_score: Optional[float] = None
    payment_risk_0_100: Optional[float] = None
    payment_anomaly_flag: Optional[bool] = None

    execution_risk_0_100: float
    execution_consistency_flag: int

    combined_base_risk: float
    final_risk_score: float
    risk_level: str
    investigation_priority: str
    primary_risk_reason: str

class PaginatedProjectsResponse(BaseModel):
    items: List[ProjectDetail]
    total: int
    page: int
    page_size: int
    total_pages: int

class SystemSummary(BaseModel):
    total_projects: int
    requiring_review: int
    high_risk_projects: int
    payment_anomalies: int
    execution_consistency_issues: int
    average_risk_score: float
    risk_distribution: Dict[str, int]
    investigation_priority_distribution: Dict[str, int]
    primary_risk_reason_distribution: Dict[str, int]
    payment_data_distribution: Dict[str, int]

class RiskComponentDistribution(BaseModel):
    financial_risk_avg: float
    payment_risk_avg: float
    execution_risk_avg: float
    combined_risk_avg: float
    with_payment_data_count: int
    without_payment_data_count: int

class StateAnalytics(BaseModel):
    state: str
    total_projects: int
    requiring_review: int
    high_risk_projects: int
    avg_final_risk: float
    avg_financial_risk: float
    avg_payment_risk: Optional[float] = None
    avg_execution_risk: float
    low_risk: int
    medium_risk: int
    high_risk: int
    very_high_risk: int

class FinancialYearAnalytics(BaseModel):
    financial_year: str
    total_projects: int
    requiring_review: int
    high_risk_projects: int
    avg_final_risk: float
    low_risk: int
    medium_risk: int
    high_risk: int
    very_high_risk: int

class FilterOptions(BaseModel):
    states: List[str]
    financial_years: List[str]
    work_categories: List[str]
    risk_levels: List[str]
    investigation_priorities: List[str]
    primary_risk_reasons: List[str]
