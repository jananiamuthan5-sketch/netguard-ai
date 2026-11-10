"""
NetGuard AI - Prediction & Telemetry Service Layer
Coordinates database persistence and machine learning inference.
"""

from datetime import datetime, timezone
import io
import json
import os
import sys
from typing import Any, Dict, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.models.prediction import Prediction

# Ensure workspace root is in python path to load ML package
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

try:
    from ml.src.predict import NetGuardPredictor
    from ml.src.preprocess import ALL_FEATURE_COLUMNS
except ImportError:
    NetGuardPredictor = None
    ALL_FEATURE_COLUMNS = []


class PredictionService:
    """
    Service class handling network traffic flow analysis, database transactions,
    aggregated telemetry, and ML model metadata.
    """

    _predictor_instance = None

    def __init__(self, db: Session):
        self.db = db

    @classmethod
    def get_predictor(cls):
        """Lazy-loads and caches the singleton predictor instance."""
        if cls._predictor_instance is None and NetGuardPredictor is not None:
            model_path = os.path.join(workspace_root, "ml", "models", "netguard_model.joblib")
            if os.path.exists(model_path):
                cls._predictor_instance = NetGuardPredictor(model_path=model_path)
        return cls._predictor_instance

    def analyze_csv_traffic(
        self,
        file_bytes: bytes,
        file_name: str
    ) -> Dict[str, Any]:
        """
        Parses uploaded network traffic CSV, validates schema, executes
        real machine learning inference, and persists the analysis session to SQLite.
        """
        if not file_name.lower().endswith(".csv"):
            raise ValueError(f"Invalid file format '{file_name}'. Only CSV (.csv) files are supported.")

        if not file_bytes or len(file_bytes.strip()) == 0:
            raise ValueError("The uploaded CSV file is empty. Please provide valid network flow records.")

        predictor = self.get_predictor()
        if predictor is None or not predictor.is_ready():
            raise RuntimeError(
                "Machine Learning inference pipeline is not loaded. Ensure the model has been trained."
            )

        # Parse CSV into DataFrame
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception as e:
            raise ValueError(f"Could not parse CSV file: {str(e)}")

        if df.empty or len(df) == 0:
            raise ValueError("CSV contains no network traffic flow records to analyze.")

        # Check for column coverage
        df_cols_lower = {str(c).strip().lower(): c for c in df.columns}
        has_protocol = "protocol_type" in df_cols_lower or "protocol" in df_cols_lower
        has_bytes = "src_bytes" in df_cols_lower or "bytes" in df_cols_lower
        has_service = "service" in df_cols_lower
        has_duration = "duration" in df_cols_lower

        # If CSV was uploaded without headers (e.g. raw KDD lines), try matching by column count
        if not (has_protocol or has_bytes or has_service or has_duration):
            if len(df.columns) in [41, 42, 43]:
                # Re-read with standard column names
                col_names = list(ALL_FEATURE_COLUMNS)
                if len(df.columns) >= 42:
                    col_names.append("label")
                if len(df.columns) >= 43:
                    col_names.append("difficulty")
                df = pd.read_csv(io.BytesIO(file_bytes), names=col_names, header=None)
            else:
                raise ValueError(
                    "CSV file does not contain recognized network flow features (e.g., duration, protocol_type, service, flag, src_bytes). Please ensure you are uploading network traffic capture data."
                )

        # Execute real prediction pipeline
        results = predictor.predict_dataframe(df, max_record_details=100)

        # Persist session summary to SQLite
        db_record = Prediction(
            file_name=file_name,
            total_records=results["total_records"],
            normal_count=results["normal_count"],
            intrusion_count=results["intrusion_count"],
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(db_record)
        self.db.commit()
        self.db.refresh(db_record)

        # Attach database record metadata to response
        results["session_id"] = db_record.id
        results["file_name"] = db_record.file_name
        results["created_at"] = db_record.created_at.isoformat()

        return results

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Prediction]:
        """Retrieves history of past prediction sessions ordered newest first."""
        return (
            self.db.query(Prediction)
            .order_by(Prediction.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, prediction_id: int) -> Optional[Prediction]:
        """Retrieves a single prediction session by ID."""
        return self.db.query(Prediction).filter(Prediction.id == prediction_id).first()

    def get_analytics_summary(self) -> Dict[str, Any]:
        """
        Computes aggregated cybersecurity statistics from real database records.
        """
        records = self.db.query(Prediction).order_by(Prediction.created_at.asc()).all()

        total_sessions = len(records)
        if total_sessions == 0:
            return {
                "total_sessions": 0,
                "total_records": 0,
                "normal_count": 0,
                "intrusion_count": 0,
                "intrusion_rate": 0.0,
                "threat_level": "NORMAL",
                "sessions": [],
            }

        total_records = sum(r.total_records for r in records)
        total_normal = sum(r.normal_count for r in records)
        total_intrusions = sum(r.intrusion_count for r in records)
        intrusion_rate = (
            round((total_intrusions / total_records) * 100, 2)
            if total_records > 0
            else 0.0
        )

        sessions_data = [
            {
                "id": r.id,
                "file_name": r.file_name,
                "total": r.total_records,
                "normal": r.normal_count,
                "intrusion": r.intrusion_count,
                "intrusion_rate": round((r.intrusion_count / r.total_records * 100), 1) if r.total_records > 0 else 0.0,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]

        # Determine overall threat status
        threat_level = "ELEVATED" if intrusion_rate > 20 else "MODERATE" if intrusion_rate > 5 else "LOW"

        return {
            "total_sessions": total_sessions,
            "total_records": total_records,
            "normal_count": total_normal,
            "intrusion_count": total_intrusions,
            "intrusion_rate": intrusion_rate,
            "threat_level": threat_level,
            "sessions": sessions_data,
        }

    def get_model_metadata(self) -> Dict[str, Any]:
        """
        Reads real evaluation metrics and parameters from model_metadata.json.
        """
        metadata_file = os.path.join(workspace_root, "ml", "models", "model_metadata.json")
        model_joblib_file = os.path.join(workspace_root, "ml", "models", "netguard_model.joblib")

        if not os.path.exists(model_joblib_file) or not os.path.exists(metadata_file):
            return {
                "trained": False,
                "status": "Untrained",
                "message": "Model has not been trained yet. Execute training pipeline.",
            }

        try:
            with open(metadata_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            data["trained"] = True
            data["status"] = "Active"
            return data
        except Exception:
            return {
                "trained": False,
                "status": "Error",
                "message": "Failed to read model evaluation metadata.",
            }
