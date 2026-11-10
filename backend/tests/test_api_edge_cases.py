"""
NetGuard AI - Step 4 Backend API Edge Cases & Comprehensive Verification
Tests all 7 endpoints and positive/negative test cases synchronously.
"""

import io
import os
import sys
from fastapi import HTTPException, UploadFile

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.database.session import init_db, SessionLocal
from app.api.routes.health import get_health
from app.api.routes.analysis import get_analysis_info, analyze_traffic
from app.api.routes.predictions import get_predictions, get_prediction_by_id
from app.api.routes.analytics import get_analytics
from app.api.routes.model import get_model_info


def run_edge_case_tests():
    print("=" * 65)
    print("STEP 4: BACKEND API VALIDATION & EDGE CASE TESTING")
    print("=" * 65)

    init_db()
    db = SessionLocal()

    try:

        # 1. GET /api/v1/health
        print("\n1. Testing GET /api/v1/health...")
        h = get_health()
        assert h.status == "healthy"
        assert h.service == "NetGuard AI API"
        print("   [PASS] 200 OK - Health response valid.")

        # 2. GET /api/v1/analysis
        print("\n2. Testing GET /api/v1/analysis...")
        a_info = get_analysis_info()
        assert a_info["status"] == "ready"
        assert "CSV" in a_info["supported_format"]
        print("   [PASS] 200 OK - Analysis spec valid.")

        # 3. GET /api/v1/model
        print("\n3. Testing GET /api/v1/model...")
        m_info = get_model_info(db)
        assert m_info["trained"] is True
        assert m_info["model_name"] == "Decision Tree"
        assert m_info["evaluation_metrics"]["accuracy"] > 0.70
        print(f"   [PASS] 200 OK - Model metadata returned: {m_info['model_name']} (Acc: {m_info['evaluation_metrics']['accuracy']*100:.2f}%)")

        # 4. Valid CSV Analysis: POST /api/v1/analysis
        print("\n4. Testing POST /api/v1/analysis (Valid Sample CSV)...")
        sample_path = os.path.join(backend_dir, "..", "ml", "data", "test_samples", "sample_network_traffic.csv")
        with open(sample_path, "rb") as f:
            valid_bytes = f.read()

        file_valid = UploadFile(filename="sample_network_traffic.csv", file=io.BytesIO(valid_bytes))
        result_valid = analyze_traffic(file=file_valid, db=db)
        assert result_valid["total_records"] == 30
        assert result_valid["normal_count"] + result_valid["intrusion_count"] == 30
        assert result_valid["session_id"] >= 1
        valid_id = result_valid["session_id"]
        print(f"   [PASS] 200 OK - Parsed 30 records (Session #{valid_id}: {result_valid['normal_count']} normal, {result_valid['intrusion_count']} intrusions).")

        # 5. GET /api/v1/predictions and GET /api/v1/predictions/{id}
        print("\n5. Testing GET /api/v1/predictions and GET /api/v1/predictions/{id}...")
        history = get_predictions(skip=0, limit=10, db=db)
        assert len(history) >= 1
        print(f"   [PASS] 200 OK - Retrieved {len(history)} prediction sessions from SQLite.")

        single_pred = get_prediction_by_id(valid_id, db=db)
        assert single_pred.id == valid_id
        assert single_pred.file_name == "sample_network_traffic.csv"
        print(f"   [PASS] 200 OK - Retrieved single prediction session #{valid_id}.")

        # 6. GET /api/v1/predictions/999999 (Non-existent ID)
        print("\n6. Testing GET /api/v1/predictions/{id} (Invalid non-existent ID)...")
        try:
            get_prediction_by_id(999999, db=db)
            assert False, "Should have raised 404"
        except HTTPException as e:
            assert e.status_code == 404
            print(f"   [PASS] 404 Not Found as expected: '{e.detail}'")

        # 7. GET /api/v1/analytics
        print("\n7. Testing GET /api/v1/analytics...")
        analytics = get_analytics(db=db)
        assert analytics["total_sessions"] >= 1
        assert analytics["total_records"] >= 30
        assert analytics["threat_level"] in ["LOW", "MODERATE", "ELEVATED"]
        print(f"   [PASS] 200 OK - Analytics computed: {analytics['total_records']} flows across {analytics['total_sessions']} sessions (Threat Level: {analytics['threat_level']}).")

        # --- INVALID CASES TESTING ---
        print("\n--- Testing Invalid Cases ---")

        # Invalid Case 1: No filename
        print("8. Invalid Case: Empty filename...")
        try:
            analyze_traffic(file=UploadFile(filename="", file=io.BytesIO(b"data")), db=db)
            assert False, "Should have raised 400"
        except HTTPException as e:
            assert e.status_code == 400
            print(f"   [PASS] 400 Bad Request: '{e.detail}'")

        # Invalid Case 2: Non-CSV file (.txt / .exe / .pdf)
        print("9. Invalid Case: Non-CSV file (.pdf)...")
        try:
            analyze_traffic(file=UploadFile(filename="malware.pdf", file=io.BytesIO(b"%PDF-1.4...")), db=db)
            assert False, "Should have raised 400"
        except HTTPException as e:
            assert e.status_code == 400
            print(f"   [PASS] 400 Bad Request: '{e.detail}'")

        # Invalid Case 3: Empty CSV file (0 bytes)
        print("10. Invalid Case: Empty CSV file (0 bytes)...")
        try:
            analyze_traffic(file=UploadFile(filename="empty.csv", file=io.BytesIO(b"")), db=db)
            assert False, "Should have raised 400"
        except HTTPException as e:
            assert e.status_code == 400
            print(f"   [PASS] 400 Bad Request: '{e.detail}'")

        # Invalid Case 4: CSV with missing required network columns (e.g. employee list)
        print("11. Invalid Case: CSV with irrelevant non-network columns...")
        dummy_csv = b"name,age,email\nAlice,30,alice@example.com\nBob,25,bob@example.com\n"
        try:
            analyze_traffic(file=UploadFile(filename="employees.csv", file=io.BytesIO(dummy_csv)), db=db)
            assert False, "Should have raised 422"
        except HTTPException as e:
            assert e.status_code == 422
            print(f"   [PASS] 422 Unprocessable Entity: '{e.detail}'")

        # Invalid Case 5: CSV with invalid data values (corrupted/NaN numerical columns)
        print("12. Invalid Case: CSV with corrupted values...")
        corrupt_csv = (
            b"duration,protocol_type,service,flag,src_bytes,dst_bytes\n"
            b"corrupt,tcp,http,SF,invalid_bytes,nan\n"
            b"99999999999999999999,udp,other,REJ,-99999,inf\n"
        )
        res_corrupt = analyze_traffic(file=UploadFile(filename="corrupt.csv", file=io.BytesIO(corrupt_csv)), db=db)
        assert res_corrupt["total_records"] == 2
        print(f"   [PASS] 200 OK - Gracefully cleaned and classified corrupted values into normal/intrusion predictions.")

        # Invalid Case 6: File exceeding maximum size
        print("13. Invalid Case: File size limit check (exceeds 50MB)...")
        oversized_bytes = b"0" * (50 * 1024 * 1024 + 10)
        try:
            analyze_traffic(file=UploadFile(filename="giant.csv", file=io.BytesIO(oversized_bytes)), db=db)
            assert False, "Should have raised 413"
        except HTTPException as e:
            assert e.status_code == 413
            print(f"   [PASS] 413 Payload Too Large: '{e.detail}'")

        print("\n" + "=" * 65)
        print("ALL 13 API TEST CASES (VALID & INVALID) PASSED WITH 100% SUCCESS")
        print("=" * 65)

    finally:
        db.close()


if __name__ == "__main__":
    run_edge_case_tests()
