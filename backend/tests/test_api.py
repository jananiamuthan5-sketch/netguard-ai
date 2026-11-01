"""
NetGuard AI - Backend API & Database Unit Tests
"""

import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import init_db, SessionLocal
from app.models.prediction import Prediction


def test_api_health_check():
    """
    Verifies that GET /api/v1/health returns 200 and matches required contract:
    {
      "status": "healthy",
      "service": "NetGuard AI API"
    }
    """
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {
            "status": "healthy",
            "service": "NetGuard AI API",
        }


def test_root_endpoint():
    """
    Verifies root endpoint service discovery.
    """
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "health" in data
        assert "docs" in data


def test_database_structure_and_no_fake_data():
    """
    Verifies that the SQLite database initializes and Prediction table is empty (no fake records).
    """
    init_db()
    db = SessionLocal()
    try:
        count = db.query(Prediction).count()
        assert count == 0, f"Expected 0 prediction records in Phase 1, found {count}"
    finally:
        db.close()


def test_placeholder_endpoints():
    """
    Verifies all Phase 2 placeholder endpoints return 200 OK and informative payloads.
    """
    with TestClient(app) as client:
        for path in ["/api/v1/analysis", "/api/v1/predictions", "/api/v1/analytics", "/api/v1/model"]:
            response = client.get(path)
            assert response.status_code == 200
            json_data = response.json()
            assert "phase" in json_data
            assert "Phase 1 Foundation" in json_data["phase"]


if __name__ == "__main__":
    test_api_health_check()
    test_root_endpoint()
    test_database_structure_and_no_fake_data()
    test_placeholder_endpoints()
    print("All unit tests passed successfully!")
