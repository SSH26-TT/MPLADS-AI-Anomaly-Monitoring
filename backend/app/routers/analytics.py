from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.models.project import MPLADSProject
from backend.app.schemas.project import StateAnalytics, FinancialYearAnalytics

router = APIRouter(prefix="/api", tags=["Analytics & Aggregate Metrics"])

# In-memory caches for instant responses
_STATES_CACHE = None
_FY_CACHE = None
_REASONS_CACHE = None

@router.get("/states", response_model=List[StateAnalytics])
def get_state_analytics(db: Session = Depends(get_db)):
    global _STATES_CACHE
    if _STATES_CACHE is not None:
        return _STATES_CACHE

    results = db.query(
        MPLADSProject.state.label("state"),
        func.count(MPLADSProject.work_id).label("total_projects"),
        func.sum(case((MPLADSProject.investigation_priority.in_(["REVIEW", "HIGH_REVIEW", "CRITICAL_REVIEW"]), 1), else_=0)).label("requiring_review"),
        func.sum(case((MPLADSProject.risk_level.in_(["HIGH", "VERY_HIGH"]), 1), else_=0)).label("high_risk_projects"),
        func.avg(MPLADSProject.final_risk_score).label("avg_final_risk"),
        func.avg(MPLADSProject.financial_risk_0_100).label("avg_financial_risk"),
        func.avg(MPLADSProject.payment_risk_0_100).label("avg_payment_risk"),
        func.avg(MPLADSProject.execution_risk_0_100).label("avg_execution_risk"),
        func.sum(case((MPLADSProject.risk_level == "LOW", 1), else_=0)).label("low_risk"),
        func.sum(case((MPLADSProject.risk_level == "MEDIUM", 1), else_=0)).label("medium_risk"),
        func.sum(case((MPLADSProject.risk_level == "HIGH", 1), else_=0)).label("high_risk"),
        func.sum(case((MPLADSProject.risk_level == "VERY_HIGH", 1), else_=0)).label("very_high_risk")
    ).group_by(MPLADSProject.state).order_by(func.count(MPLADSProject.work_id).desc()).all()

    analytics = []
    for r in results:
        analytics.append(
            StateAnalytics(
                state=r.state,
                total_projects=r.total_projects,
                requiring_review=int(r.requiring_review or 0),
                high_risk_projects=int(r.high_risk_projects or 0),
                avg_final_risk=round(float(r.avg_final_risk or 0.0), 2),
                avg_financial_risk=round(float(r.avg_financial_risk or 0.0), 2),
                avg_payment_risk=round(float(r.avg_payment_risk or 0.0), 2) if r.avg_payment_risk is not None else None,
                avg_execution_risk=round(float(r.avg_execution_risk or 0.0), 2),
                low_risk=int(r.low_risk or 0),
                medium_risk=int(r.medium_risk or 0),
                high_risk=int(r.high_risk or 0),
                very_high_risk=int(r.very_high_risk or 0)
            )
        )
    _STATES_CACHE = analytics
    return _STATES_CACHE

@router.get("/financial-years", response_model=List[FinancialYearAnalytics])
def get_financial_year_analytics(db: Session = Depends(get_db)):
    global _FY_CACHE
    if _FY_CACHE is not None:
        return _FY_CACHE

    results = db.query(
        MPLADSProject.financial_year.label("financial_year"),
        func.count(MPLADSProject.work_id).label("total_projects"),
        func.sum(case((MPLADSProject.investigation_priority.in_(["REVIEW", "HIGH_REVIEW", "CRITICAL_REVIEW"]), 1), else_=0)).label("requiring_review"),
        func.sum(case((MPLADSProject.risk_level.in_(["HIGH", "VERY_HIGH"]), 1), else_=0)).label("high_risk_projects"),
        func.avg(MPLADSProject.final_risk_score).label("avg_final_risk"),
        func.sum(case((MPLADSProject.risk_level == "LOW", 1), else_=0)).label("low_risk"),
        func.sum(case((MPLADSProject.risk_level == "MEDIUM", 1), else_=0)).label("medium_risk"),
        func.sum(case((MPLADSProject.risk_level == "HIGH", 1), else_=0)).label("high_risk"),
        func.sum(case((MPLADSProject.risk_level == "VERY_HIGH", 1), else_=0)).label("very_high_risk")
    ).group_by(MPLADSProject.financial_year).order_by(MPLADSProject.financial_year.asc()).all()

    analytics = []
    for r in results:
        analytics.append(
            FinancialYearAnalytics(
                financial_year=r.financial_year,
                total_projects=r.total_projects,
                requiring_review=int(r.requiring_review or 0),
                high_risk_projects=int(r.high_risk_projects or 0),
                avg_final_risk=round(float(r.avg_final_risk or 0.0), 2),
                low_risk=int(r.low_risk or 0),
                medium_risk=int(r.medium_risk or 0),
                high_risk=int(r.high_risk or 0),
                very_high_risk=int(r.very_high_risk or 0)
            )
        )
    _FY_CACHE = analytics
    return _FY_CACHE

@router.get("/risk-reasons")
def get_risk_reasons(db: Session = Depends(get_db)):
    global _REASONS_CACHE
    if _REASONS_CACHE is not None:
        return _REASONS_CACHE

    results = db.query(
        MPLADSProject.primary_risk_reason,
        func.count(MPLADSProject.work_id).label("count"),
        func.avg(MPLADSProject.final_risk_score).label("avg_risk")
    ).group_by(MPLADSProject.primary_risk_reason).order_by(func.count(MPLADSProject.work_id).desc()).all()

    total = db.query(func.count(MPLADSProject.work_id)).scalar() or 1
    _REASONS_CACHE = [
        {
            "reason": r[0],
            "count": r[1],
            "percentage": round((r[1] / total) * 100, 2),
            "avg_risk": round(float(r[2] or 0.0), 2)
        }
        for r in results
    ]
    return _REASONS_CACHE
