from sqlalchemy import Column, String, Integer, Float, Boolean, Text, Index
from backend.app.database import Base

class MPLADSProject(Base):
    __tablename__ = "mplads_projects"

    work_id = Column(String(100), primary_key=True, index=True)
    house = Column(String(50), nullable=True)
    mp_key = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=False, index=True)
    ida = Column(String(255), nullable=True)
    work_category = Column(String(255), nullable=True, index=True)
    work_title = Column(Text, nullable=False)
    financial_year = Column(String(20), nullable=False, index=True)

    # Financial model signals
    financial_anomaly_score = Column(Float, nullable=False)
    financial_risk_0_100 = Column(Float, nullable=False)

    # Payment model signals
    payment_data_available = Column(Integer, nullable=False, index=True)  # 1 or 0
    payment_anomaly_score = Column(Float, nullable=True)
    payment_risk_0_100 = Column(Float, nullable=True)
    payment_anomaly_flag = Column(Boolean, nullable=True, index=True)

    # Execution risk signals
    execution_risk_0_100 = Column(Float, nullable=False)
    execution_consistency_flag = Column(Integer, nullable=False, index=True)

    # Combined final results
    combined_base_risk = Column(Float, nullable=False)
    final_risk_score = Column(Float, nullable=False, index=True)
    risk_level = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH, VERY_HIGH
    investigation_priority = Column(String(30), nullable=False, index=True)  # NORMAL, REVIEW, HIGH_REVIEW
    primary_risk_reason = Column(String(255), nullable=False, index=True)

    __table_args__ = (
        Index("idx_state_risk", "state", "risk_level"),
        Index("idx_fy_risk", "financial_year", "risk_level"),
        Index("idx_priority_risk", "investigation_priority", "final_risk_score"),
    )
