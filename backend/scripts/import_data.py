import os
import sys
import time
import pandas as pd
from sqlalchemy import text, inspect

# Add workspace root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.project import MPLADSProject

def find_csv_path():
    candidates = [
        os.path.join(BASE_DIR, "mplads_final_master_risk.csv"),
        os.path.join(os.path.dirname(BASE_DIR), "mplads_final_master_risk.csv"),
        "mplads_final_master_risk.csv",
        "../mplads_final_master_risk.csv",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
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
    df['execution_consistency_flag'] = df['execution_consistency_flag'].astype(int)

    # Create tables
    print("Re-creating database tables with indexes...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Importing records into database in chunks...")
    chunk_size = 10000

    df.to_sql(
        name="mplads_projects",
        con=engine,
        if_exists="append",
        index=False,
        chunksize=chunk_size,
        method=None
    )

    elapsed = time.time() - start_time
    print(f"[OK] Successfully imported {len(df)} records in {elapsed:.2f}s!")

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

        assert total_in_db == 98755, "Row count mismatch in DB!"
        assert low_count == 96821, "LOW risk count mismatch!"
        assert medium_count == 1744, "MEDIUM risk count mismatch!"
        assert high_count == 190, "HIGH risk count mismatch!"
        assert normal_prio == 96607, "NORMAL priority count mismatch!"
        assert review_prio == 2090, "REVIEW priority count mismatch!"
        assert high_review_prio == 58, "HIGH_REVIEW priority count mismatch!"

        print("[SUCCESS] ALL VERIFICATION CHECKS PASSED PERFECTLY!")
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_to_db()
