import os
import sys
import time
import pandas as pd
from sqlalchemy import text, inspect

# Add workspace root and project directories to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
WORKSPACE_DIR = os.path.dirname(PROJECT_DIR)

for p in [PROJECT_DIR, WORKSPACE_DIR, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Create an alias if needed
try:
    from backend.app.database import engine, Base, SessionLocal
    from backend.app.models.project import MPLADSProject
except ImportError:
    from app.database import engine, Base, SessionLocal
    from app.models.project import MPLADSProject

def find_csv_path():
    candidates = [
        os.path.join(BACKEND_DIR, "mplads_final_master_risk.csv"),
        os.path.join(PROJECT_DIR, "Data & Models", "mplads_final_master_risk.csv"),
        os.path.join(PROJECT_DIR, "mplads_final_master_risk.csv"),
        os.path.join(PROJECT_DIR, "Notebooks", "Execution & Risk_Score", "mplads_final_master_risk.csv"),
        os.path.join(os.path.abspath(os.path.join(BACKEND_DIR, "..", "..")), "mplads_final_master_risk.csv"),
        os.path.join(os.path.abspath(os.path.join(BACKEND_DIR, "..", "..")), "data", "MPLADS_BACKEND_DATA", "mplads_final_master_risk.csv"),
        "mplads_final_master_risk.csv",
        "Data & Models/mplads_final_master_risk.csv",
        "../Data & Models/mplads_final_master_risk.csv",
        "../../mplads_final_master_risk.csv",
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    raise FileNotFoundError("Could not locate mplads_final_master_risk.csv in expected locations.")


def import_csv_to_db():
    start_time = time.time()
    csv_file = find_csv_path()
    print(f"Loading authoritative dataset from: {csv_file}")

    df = pd.read_csv(csv_file)
    print(f"CSV read complete. Shape: {df.shape}")

    # Validate row count
    if len(df) != 98755:
        print(f"WARNING: Expected 98,755 rows, got {len(df)}")
    else:
        print("[OK] Verified exact row count: 98,755")

    # Validate work_id uniqueness
    unique_ids = df['work_id'].nunique()
    if unique_ids != len(df):
        raise ValueError(f"work_id is not unique! {unique_ids} unique out of {len(df)}")
    print("[OK] Verified work_id uniqueness (100% unique)")

    # Data type cleaning & null normalization
    df['work_category'] = df['work_category'].fillna('Uncategorized')
    df['payment_data_available'] = df['payment_data_available'].astype(int)
    if 'execution_consistency_flag' not in df.columns:
        df['execution_consistency_flag'] = (df['execution_risk_0_100'] > 0).astype(int)
    else:
        df['execution_consistency_flag'] = df['execution_consistency_flag'].astype(int)

    # Ensure all expected columns exist
    expected_cols = [
        'work_id', 'house', 'mp_key', 'state', 'ida', 'work_category', 'work_title', 'financial_year',
        'sanction_amount', 'total_disbursed_amount', 'financial_risk_0_100', 'payment_data_available',
        'payment_risk_0_100', 'payment_anomaly_flag', 'delay_risk_0_100', 'execution_risk_0_100',
        'execution_consistency_flag', 'final_risk_score', 'risk_level', 'investigation_priority', 'primary_risk_reason'
    ]
    for col in expected_cols:
        if col not in df.columns:
            if col == 'sanction_amount' or col == 'total_disbursed_amount':
                df[col] = 0.0
            elif col == 'delay_risk_0_100':
                df[col] = 0.0
            else:
                df[col] = None

    # Keep only relevant columns
    df_db = df[[c for c in expected_cols if c in df.columns]].copy()

    # Create tables
    print("Re-creating database tables with indexes...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Importing records into database in chunks...")
    chunk_size = 10000

    df_db.to_sql(
        name="mplads_projects",
        con=engine,
        if_exists="append",
        index=False,
        chunksize=chunk_size,
        method=None
    )

    elapsed = time.time() - start_time
    print(f"[OK] Successfully imported {len(df_db)} records in {elapsed:.2f}s!")

    # Verify directly from DB
    db = SessionLocal()
    try:
        total_in_db = db.query(MPLADSProject).count()
        low_count = db.query(MPLADSProject).filter(MPLADSProject.risk_level == "LOW").count()
        medium_count = db.query(MPLADSProject).filter(MPLADSProject.risk_level == "MEDIUM").count()
        high_count = db.query(MPLADSProject).filter(MPLADSProject.risk_level == "HIGH").count()
        normal_prio = db.query(MPLADSProject).filter(MPLADSProject.investigation_priority == "NORMAL").count()
        review_prio = db.query(MPLADSProject).filter(MPLADSProject.investigation_priority == "REVIEW").count()
        high_review_prio = db.query(MPLADSProject).filter(MPLADSProject.investigation_priority == "HIGH_REVIEW").count()

        print("\n================ DATABASE INTEGRITY VERIFICATION ================")
        print(f"Total Rows in DB: {total_in_db} (Target: 98,755)")
        print(f"Risk Levels: LOW={low_count}, MEDIUM={medium_count}, HIGH={high_count}")
        print(f"Investigation Priorities: NORMAL={normal_prio}, REVIEW={review_prio}, HIGH_REVIEW={high_review_prio}")
        print("=================================================================\n")

        assert total_in_db == 98755, f"Row count mismatch in DB! Expected 98755, got {total_in_db}"
        print("[SUCCESS] ALL VERIFICATION CHECKS PASSED PERFECTLY!")
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_to_db()
