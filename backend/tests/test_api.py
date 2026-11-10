"""
NetGuard AI - Backend API & Database Unit Tests
Part of Phase 3: Real Machine Learning Pipeline & Backend Integration
"""

import os
import sys

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.database.session import init_db, SessionLocal
from app.api.routes.health import get_health
from app.api.routes.analysis import get_analysis_info
from app.api.routes.predictions import get_predictions
from app.api.routes.analytics import get_analytics
from app.api.routes.model import get_model_info
from app.services.prediction_service import PredictionService


def test_api_health_check():
    """Verifies that health check returns healthy status."""
    res = get_health()
    assert res.status == "healthy"
    assert res.service == "NetGuard AI API"
    print("[PASS] test_api_health_check")


def test_analysis_endpoint_info():
    """Verifies that GET /api/v1/analysis returns service descriptor."""
    info = get_analysis_info()
    assert info["status"] == "ready"
    assert "CSV" in info["supported_format"]
    print("[PASS] test_analysis_endpoint_info")


def test_model_metadata_endpoint():
    """Verifies that GET /api/v1/model returns verified training metrics."""
    init_db()
    db = SessionLocal()
    try:
        model_info = get_model_info(db)
        assert model_info["trained"] is True
        assert model_info["model_name"] == "Decision Tree"
        assert "evaluation_metrics" in model_info
        metrics = model_info["evaluation_metrics"]
        assert metrics["accuracy"] > 0.75
        assert metrics["f1_score"] > 0.75
        assert "confusion_matrix" in metrics
        cm = metrics["confusion_matrix"]
        assert cm["tp"] > 0 and cm["tn"] > 0
        print("[PASS] test_model_metadata_endpoint")
    finally:
        db.close()


def test_real_traffic_analysis_and_persistence():
    """Verifies end-to-end inference on sample network traffic and database persistence."""
    init_db()
    db = SessionLocal()
    try:
        service = PredictionService(db)
        sample_path = os.path.join(backend_dir, "..", "ml", "data", "test_samples", "sample_network_traffic.csv")
        with open(sample_path, "rb") as f:
            file_bytes = f.read()

        results = service.analyze_csv_traffic(file_bytes=file_bytes, file_name="sample_network_traffic.csv")
        assert results["total_records"] == 30
        assert results["normal_count"] + results["intrusion_count"] == 30
        assert "session_id" in results
        assert results["session_id"] >= 1
        assert len(results["records"]) > 0

        # Verify predictions history in SQLite
        history = get_predictions(skip=0, limit=10, db=db)
        assert len(history) >= 1
        latest = history[0]
        assert latest.file_name == "sample_network_traffic.csv"

        # Verify aggregated analytics
        analytics = get_analytics(db=db)
        assert analytics["total_sessions"] >= 1
        assert analytics["total_records"] >= 30
        assert analytics["normal_count"] > 0
        assert analytics["intrusion_count"] > 0
        assert analytics["threat_level"] in ["LOW", "MODERATE", "ELEVATED"]

        print("[PASS] test_real_traffic_analysis_and_persistence")
    finally:
        db.close()


if __name__ == "__main__":
    test_api_health_check()
    test_analysis_endpoint_info()
    test_model_metadata_endpoint()
    test_real_traffic_analysis_and_persistence()
    print("\nALL BACKEND & ML TESTS PASSED WITH 100% SUCCESS!")
