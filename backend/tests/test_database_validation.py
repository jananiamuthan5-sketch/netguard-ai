"""
NetGuard AI - Step 5 Database Validation Script
Inspects SQLite database schema and verifies real persistence integrity.
"""

import os
import sqlite3
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.database.session import SessionLocal
from app.api.routes.predictions import get_predictions


def test_database_integrity():
    print("=" * 65)
    print("STEP 5: DATABASE & SQLITE PERSISTENCE VALIDATION")
    print("=" * 65)

    db_path = os.path.join(backend_dir, "netguard.db")
    print(f"1. Checking SQLite DB file on disk: {db_path}")
    assert os.path.exists(db_path), f"Database file does not exist at {db_path}"
    print(f"   [PASS] DB file exists ({os.path.getsize(db_path)} bytes)")

    # 2. Inspect with native sqlite3
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(predictions);")
    columns = cursor.fetchall()
    print("\n2. SQLite Table Schema ('predictions'):")
    col_names = [col[1] for col in columns]
    for col in columns:
        cid, name, col_type, notnull, dflt_value, pk = col
        print(f"   Column: {name:<16} | Type: {col_type:<10} | NotNull: {bool(notnull)} | PK: {bool(pk)}")

    assert "id" in col_names
    assert "file_name" in col_names
    assert "total_records" in col_names
    assert "normal_count" in col_names
    assert "intrusion_count" in col_names
    assert "created_at" in col_names
    print("   [PASS] Schema contains all required fields.")

    # 3. Check records
    cursor.execute("SELECT id, file_name, total_records, normal_count, intrusion_count, created_at FROM predictions;")
    rows = cursor.fetchall()
    print(f"\n3. Verifying stored records (Count: {len(rows)}):")
    assert len(rows) > 0, "Expected at least 1 prediction record in database."

    for row in rows:
        p_id, fname, total, normal, intrusion, created_at = row
        print(f"   Session #{p_id}: file='{fname}', total={total}, normal={normal}, intrusion={intrusion}, at={created_at}")
        assert total > 0, "total_records must be > 0"
        assert normal + intrusion == total, "normal + intrusion must equal total"
        assert created_at is not None, "created_at must be populated"

    conn.close()
    print("   [PASS] Direct SQLite records verified.")

    # 4. Check via SQLAlchemy ORM & API route
    print("\n4. Checking via SQLAlchemy ORM & GET /api/v1/predictions...")
    db = SessionLocal()
    try:
        api_preds = get_predictions(skip=0, limit=100, db=db)
        assert len(api_preds) == len(rows)
        print(f"   [PASS] GET /api/v1/predictions returned all {len(api_preds)} persisted records.")
    finally:
        db.close()

    print("\n" + "=" * 65)
    print("STEP 5 DATABASE VALIDATION COMPLETED SUCCESSFULLY")
    print("=" * 65)


if __name__ == "__main__":
    test_database_integrity()

