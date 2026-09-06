from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.project import MPLADSProject
from backend.app.schemas.project import SystemSummary, RiskComponentDistribution

router = APIRouter(prefix="/api", tags=["Summary & Risk Engine Overview"])

# In-memory caches for instant response times
_SUMMARY_CACHE = None
_RISK_DIST_CACHE = None
_RISK_COMP_CACHE = None

@router.get("/summary", response_model=SystemSummary)
def get_system_summary(db: Session = Depends(get_db)):
    global _SUMMARY_CACHE
    if _SUMMARY_CACHE is not None:
        return _SUMMARY_CACHE

    total = db.query(func.count(MPLADSProject.work_id)).scalar() or 0

    # Priorities
    review_count = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.investigation_priority.in_(["REVIEW", "HIGH_REVIEW", "CRITICAL_REVIEW"]))\
        .scalar() or 0

    # High risk
    high_risk_count = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.risk_level.in_(["HIGH", "VERY_HIGH"]))\
        .scalar() or 0

    # Specific anomalies
    payment_anomalies_count = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.payment_anomaly_flag == True)\
        .scalar() or 0

    execution_issues_count = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.execution_consistency_flag == 1)\
        .scalar() or 0

    # Average score
    avg_score = db.query(func.avg(MPLADSProject.final_risk_score)).scalar() or 0.0

    # Risk distribution
    risk_rows = db.query(MPLADSProject.risk_level, func.count(MPLADSProject.work_id))\
        .group_by(MPLADSProject.risk_level).all()
    risk_dist = {row[0]: row[1] for row in risk_rows}
    for level in ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]:
        if level not in risk_dist:
            risk_dist[level] = 0

    # Investigation priority distribution
    prio_rows = db.query(MPLADSProject.investigation_priority, func.count(MPLADSProject.work_id))\
        .group_by(MPLADSProject.investigation_priority).all()
    prio_dist = {row[0]: row[1] for row in prio_rows}

    # Primary risk reason distribution
    reason_rows = db.query(MPLADSProject.primary_risk_reason, func.count(MPLADSProject.work_id))\
        .group_by(MPLADSProject.primary_risk_reason).all()
    reason_dist = {row[0]: row[1] for row in reason_rows}

    # Payment data availability
    payment_avail_rows = db.query(MPLADSProject.payment_data_available, func.count(MPLADSProject.work_id))\
        .group_by(MPLADSProject.payment_data_available).all()
    payment_dist = {
        "Available": sum(r[1] for r in payment_avail_rows if r[0] == 1),
        "Unavailable": sum(r[1] for r in payment_avail_rows if r[0] == 0)
    }

    _SUMMARY_CACHE = SystemSummary(
        total_projects=total,
        requiring_review=review_count,
        high_risk_projects=high_risk_count,
        payment_anomalies=payment_anomalies_count,
        execution_consistency_issues=execution_issues_count,
        average_risk_score=round(float(avg_score), 2),
        risk_distribution=risk_dist,
        investigation_priority_distribution=prio_dist,
        primary_risk_reason_distribution=reason_dist,
        payment_data_distribution=payment_dist
    )
    return _SUMMARY_CACHE

@router.get("/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    global _RISK_DIST_CACHE
    if _RISK_DIST_CACHE is not None:
        return _RISK_DIST_CACHE

    rows = db.query(MPLADSProject.risk_level, func.count(MPLADSProject.work_id))\
        .group_by(MPLADSProject.risk_level).all()
    total = db.query(func.count(MPLADSProject.work_id)).scalar() or 1
    dist = []
    for level in ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]:
        count = next((r[1] for r in rows if r[0] == level), 0)
        dist.append({
            "risk_level": level,
            "count": count,
            "percentage": round((count / total) * 100, 2)
        })
    _RISK_DIST_CACHE = {"total": total, "distribution": dist}
    return _RISK_DIST_CACHE

@router.get("/risk-components", response_model=RiskComponentDistribution)
def get_risk_components(db: Session = Depends(get_db)):
    global _RISK_COMP_CACHE
    if _RISK_COMP_CACHE is not None:
        return _RISK_COMP_CACHE

    financial_avg = db.query(func.avg(MPLADSProject.financial_risk_0_100)).scalar() or 0.0
    payment_avg = db.query(func.avg(MPLADSProject.payment_risk_0_100))\
        .filter(MPLADSProject.payment_data_available == 1).scalar() or 0.0
    execution_avg = db.query(func.avg(MPLADSProject.execution_risk_0_100)).scalar() or 0.0
    combined_avg = db.query(func.avg(MPLADSProject.final_risk_score)).scalar() or 0.0

    with_payment = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.payment_data_available == 1).scalar() or 0
    without_payment = db.query(func.count(MPLADSProject.work_id))\
        .filter(MPLADSProject.payment_data_available == 0).scalar() or 0

    _RISK_COMP_CACHE = RiskComponentDistribution(
        financial_risk_avg=round(float(financial_avg), 2),
        payment_risk_avg=round(float(payment_avg), 2),
        execution_risk_avg=round(float(execution_avg), 2),
        combined_risk_avg=round(float(combined_avg), 2),
        with_payment_data_count=with_payment,
        without_payment_data_count=without_payment
    )
    return _RISK_COMP_CACHE
