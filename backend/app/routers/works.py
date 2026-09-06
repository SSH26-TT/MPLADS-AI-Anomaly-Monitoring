from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from backend.app.database import get_db
from backend.app.models.project import MPLADSProject
from backend.app.schemas.project import ProjectDetail, PaginatedProjectsResponse

router = APIRouter(prefix="/api", tags=["Projects & Risk Exploration"])

@router.get("/works", response_model=PaginatedProjectsResponse)
def get_works(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term in work ID, title, MP key, or IDA"),
    state: Optional[str] = Query(None, description="Filter by State"),
    financial_year: Optional[str] = Query(None, description="Filter by Financial Year"),
    work_category: Optional[str] = Query(None, description="Filter by Work Category"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level (LOW, MEDIUM, HIGH, VERY_HIGH)"),
    investigation_priority: Optional[str] = Query(None, description="Filter by Investigation Priority (NORMAL, REVIEW, HIGH_REVIEW)"),
    primary_risk_reason: Optional[str] = Query(None, description="Filter by Primary Risk Reason"),
    payment_data_available: Optional[int] = Query(None, description="Filter by Payment Data Availability (1 or 0)"),
    payment_anomaly_flag: Optional[bool] = Query(None, description="Filter by Payment Anomaly Flag"),
    execution_consistency_flag: Optional[int] = Query(None, description="Filter by Execution Consistency Flag (1 or 0)"),
    sort_by: Optional[str] = Query("final_risk_score", description="Field to sort by"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    query = db.query(MPLADSProject)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                MPLADSProject.work_id.ilike(term),
                MPLADSProject.work_title.ilike(term),
                MPLADSProject.mp_key.ilike(term),
                MPLADSProject.ida.ilike(term),
                MPLADSProject.state.ilike(term)
            )
        )

    # Exact filters
    if state and state.strip() and state != "ALL":
        query = query.filter(MPLADSProject.state == state.strip())

    if financial_year and financial_year.strip() and financial_year != "ALL":
        query = query.filter(MPLADSProject.financial_year == financial_year.strip())

    if work_category and work_category.strip() and work_category != "ALL":
        query = query.filter(MPLADSProject.work_category == work_category.strip())

    if risk_level and risk_level.strip() and risk_level != "ALL":
        query = query.filter(MPLADSProject.risk_level == risk_level.strip())

    if investigation_priority and investigation_priority.strip() and investigation_priority != "ALL":
        query = query.filter(MPLADSProject.investigation_priority == investigation_priority.strip())

    if primary_risk_reason and primary_risk_reason.strip() and primary_risk_reason != "ALL":
        query = query.filter(MPLADSProject.primary_risk_reason == primary_risk_reason.strip())

    if payment_data_available is not None:
        query = query.filter(MPLADSProject.payment_data_available == payment_data_available)

    if payment_anomaly_flag is not None:
        query = query.filter(MPLADSProject.payment_anomaly_flag == payment_anomaly_flag)

    if execution_consistency_flag is not None:
        query = query.filter(MPLADSProject.execution_consistency_flag == execution_consistency_flag)

    # Total matching count
    total = query.count()

    # Sorting
    valid_sort_fields = {
        "final_risk_score": MPLADSProject.final_risk_score,
        "financial_risk_0_100": MPLADSProject.financial_risk_0_100,
        "payment_risk_0_100": MPLADSProject.payment_risk_0_100,
        "execution_risk_0_100": MPLADSProject.execution_risk_0_100,
        "work_id": MPLADSProject.work_id,
        "state": MPLADSProject.state,
        "financial_year": MPLADSProject.financial_year,
        "risk_level": MPLADSProject.risk_level,
        "investigation_priority": MPLADSProject.investigation_priority
    }

    sort_col = valid_sort_fields.get(sort_by, MPLADSProject.final_risk_score)
    if sort_order and sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    # Pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedProjectsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/works/{work_id:path}", response_model=ProjectDetail)
def get_work_by_id(work_id: str, db: Session = Depends(get_db)):
    project = db.query(MPLADSProject).filter(MPLADSProject.work_id == work_id).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{work_id}' not found.")
    return project

@router.get("/high-risk", response_model=PaginatedProjectsResponse)
def get_high_risk_works(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    state: Optional[str] = Query(None),
    financial_year: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MPLADSProject).filter(
        or_(
            MPLADSProject.risk_level.in_(["HIGH", "VERY_HIGH", "MEDIUM"]),
            MPLADSProject.investigation_priority.in_(["HIGH_REVIEW", "REVIEW"]),
            MPLADSProject.execution_consistency_flag == 1,
            MPLADSProject.payment_anomaly_flag == True
        )
    )

    if state and state.strip() and state != "ALL":
        query = query.filter(MPLADSProject.state == state.strip())
    if financial_year and financial_year.strip() and financial_year != "ALL":
        query = query.filter(MPLADSProject.financial_year == financial_year.strip())

    total = query.count()
    query = query.order_by(desc(MPLADSProject.final_risk_score))
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedProjectsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
