from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.project import MPLADSProject
from backend.app.schemas.project import FilterOptions

router = APIRouter(prefix="/api", tags=["Filter Metadata"])

@router.get("/filters", response_model=FilterOptions)
def get_filters(db: Session = Depends(get_db)):
    states = [s[0] for s in db.query(MPLADSProject.state).distinct().order_by(MPLADSProject.state.asc()).all() if s[0]]
    fys = [f[0] for f in db.query(MPLADSProject.financial_year).distinct().order_by(MPLADSProject.financial_year.asc()).all() if f[0]]
    categories = [c[0] for c in db.query(MPLADSProject.work_category).distinct().order_by(MPLADSProject.work_category.asc()).all() if c[0]]
    risk_levels = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
    priorities = ["NORMAL", "REVIEW", "HIGH_REVIEW", "CRITICAL_REVIEW"]
    reasons = [r[0] for r in db.query(MPLADSProject.primary_risk_reason).distinct().order_by(MPLADSProject.primary_risk_reason.asc()).all() if r[0]]

    return FilterOptions(
        states=states,
        financial_years=fys,
        work_categories=categories,
        risk_levels=risk_levels,
        investigation_priorities=priorities,
        primary_risk_reasons=reasons
    )
