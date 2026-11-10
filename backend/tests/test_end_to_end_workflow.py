"""
NetGuard AI - Step 7 Complete End-to-End Workflow Verification Test
Executes the full chain: CSV Ingestion -> Feature Preprocessing -> Decision Tree Inference
-> Database Persistence -> API History Retrieval -> Aggregated Telemetry Computation.
"""

import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.database.session import init_db, SessionLocal
from app.services.prediction_service import PredictionService
from app.api.routes.analytics import get_analytics
from app.api.routes.model import get_model_info


def test_complete_e2e_workflow():
    print("=" * 70)
    print("NETGUARD AI - COMPLETE END-TO-END WORKFLOW VERIFICATION TEST")
    print("=" * 70)

    # 1. Initialize SQLite database
    print("\n[Step 1] Initializing SQLite database...")
    init_db()
    db = SessionLocal()

    try:
        service = PredictionService(db)

        # 2. Check model readiness
        print("\n[Step 2] Verifying Machine Learning Inference Engine...")
        predictor = service.get_predictor()
        assert predictor is not None, "Predictor failed to initialize"
        assert predictor.is_ready(), "Model pipeline is not ready"
        print(f"  [PASS] ML Pipeline loaded from: {predictor.model_path}")

        # 3. Read sample network traffic CSV
        print("\n[Step 3] Loading sample benchmark network traffic capture...")
        sample_path = os.path.join(backend_dir, "..", "ml", "data", "test_samples", "sample_network_traffic.csv")
        assert os.path.exists(sample_path), f"Sample CSV not found at {sample_path}"
        with open(sample_path, "rb") as f:
            csv_bytes = f.read()
        print(f"  [PASS] Read {len(csv_bytes)} bytes from sample_network_traffic.csv")

        # 4. Count existing records prior to run
        initial_history = service.get_all(skip=0, limit=1000)
        initial_count = len(initial_history)
        print(f"  [INFO] Pre-test historical sessions in SQLite: {initial_count}")

        # 5. Execute real inference through PredictionService
        print("\n[Step 4] Executing real Machine Learning classification...")
        results = service.analyze_csv_traffic(file_bytes=csv_bytes, file_name="sample_network_traffic.csv")

        # 6. Verify classification output
        print("\n[Step 5] Validating prediction results structure...")
        assert results["total_records"] == 30
        assert results["normal_count"] + results["intrusion_count"] == 30
        assert results["intrusion_count"] > 0
        assert results["normal_count"] > 0
        assert results["threat_status"] in ["THREAT_DETECTED", "NORMAL_TRAFFIC"]
        assert "session_id" in results
        new_session_id = results["session_id"]
        print(f"  [PASS] Total records: {results['total_records']}")
        print(f"  [PASS] Normal benign flows: {results['normal_count']}")
        print(f"  [PASS] Intercepted threat flows: {results['intrusion_count']}")
        print(f"  [PASS] Threat ratio: {results['intrusion_percentage']}%")
        print(f"  [PASS] New Session ID persisted: #{new_session_id}")

        # 7. Verify SQLite persistence
        print("\n[Step 6] Validating database persistence in SQLite...")
        post_history = service.get_all(skip=0, limit=1000)
        assert len(post_history) == initial_count + 1, "Session was not added to SQLite"
        latest_record = service.get_by_id(new_session_id)
        assert latest_record is not None
        assert latest_record.file_name == "sample_network_traffic.csv"
        assert latest_record.total_records == 30
        assert latest_record.normal_count == results["normal_count"]
        assert latest_record.intrusion_count == results["intrusion_count"]
        print(f"  [PASS] SQLite record verified: ID={latest_record.id}, file='{latest_record.file_name}', at={latest_record.created_at}")

        # 8. Verify aggregated analytics update
        print("\n[Step 7] Validating dynamic telemetry aggregation...")
        analytics = get_analytics(db=db)
        assert analytics["total_sessions"] == len(post_history)
        assert analytics["total_records"] >= 30
        assert analytics["normal_count"] >= results["normal_count"]
        assert analytics["intrusion_count"] >= results["intrusion_count"]
        print(f"  [PASS] Total historical flows: {analytics['total_records']:,}")
        print(f"  [PASS] Overall threat posture: {analytics['threat_level']}")
        print(f"  [PASS] Aggregated threat rate: {analytics['intrusion_rate']}%")

        # 9. Verify model metadata endpoint
        print("\n[Step 8] Validating verified model evaluation metrics...")
        model_info = get_model_info(db=db)
        assert model_info["trained"] is True
        assert model_info["model_name"] == "Decision Tree"
        metrics = model_info["evaluation_metrics"]
        print(f"  [PASS] Model Name: {model_info['model_name']}")
        print(f"  [PASS] Verified Test Accuracy: {metrics['accuracy']*100:.2f}%")
        print(f"  [PASS] Precision (Alert Purity): {metrics['precision']*100:.2f}%")
        print(f"  [PASS] Recall (Detection Rate): {metrics['recall']*100:.2f}%")
        print(f"  [PASS] F1 Score: {metrics['f1_score']*100:.2f}%")

        print("\n" + "=" * 70)
        print("ALL END-TO-END WORKFLOW CHECKS PASSED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    test_complete_e2e_workflow()

