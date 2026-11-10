"""
NetGuard AI - Model Prediction & Inference Engine

Loads the serialized scikit-learn Pipeline and executes inference on
incoming network flow records (batch CSV or single flow dictionary).
"""

import os
from typing import Any, Dict, Optional
import joblib
import numpy as np
import pandas as pd

try:
    from .preprocess import (
        clean_dataframe,
        extract_features_and_target,
    )
except ImportError:
    from preprocess import (
        clean_dataframe,
        extract_features_and_target,
    )

LABEL_MAPPING = {
    0: "NORMAL",
    1: "POTENTIAL INTRUSION",
}


class NetGuardPredictor:
    """
    Production inference engine for NetGuard AI network flow classification.
    """

    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.model_path = os.path.join(base_dir, "..", "models", "netguard_model.joblib")
        else:
            self.model_path = model_path

        self.pipeline = None
        self._load_pipeline()

    def _load_pipeline(self) -> None:
        """Loads serialized scikit-learn pipeline from disk."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Trained model not found at '{self.model_path}'. "
                "Execute 'train_model.py' to generate model artifacts first."
            )
        self.pipeline = joblib.load(self.model_path)

    def is_ready(self) -> bool:
        """Returns True if model pipeline is loaded and ready."""
        return self.pipeline is not None

    def predict_dataframe(
        self,
        df: pd.DataFrame,
        max_record_details: int = 100
    ) -> Dict[str, Any]:
        """
        Executes real inference on a pandas DataFrame of network flow records.

        Args:
            df: DataFrame containing network flow attributes.
            max_record_details: Maximum individual records to return for UI inspection table.

        Returns:
            Dictionary with batch statistics, counts, percentages, and inspected records.
        """
        if not self.is_ready():
            raise RuntimeError("NetGuard model pipeline is not loaded.")

        if df.empty:
            raise ValueError("Input network traffic dataset is empty.")

        # Clean input records without dropping duplicates (we must analyze every submitted flow)
        cleaned_df = clean_dataframe(df, drop_duplicates=False)
        X_eval, _ = extract_features_and_target(cleaned_df)

        # Run pipeline inference
        y_preds = self.pipeline.predict(X_eval)

        # Estimate probabilities
        if hasattr(self.pipeline, "predict_proba"):
            try:
                y_probs = self.pipeline.predict_proba(X_eval)
                intrusion_probs = y_probs[:, 1]
            except Exception:
                intrusion_probs = np.where(y_preds == 1, 0.95, 0.05)
        else:
            intrusion_probs = np.where(y_preds == 1, 0.95, 0.05)

        total_records = int(len(y_preds))
        intrusion_count = int(np.sum(y_preds == 1))
        normal_count = int(total_records - intrusion_count)
        intrusion_percentage = round((intrusion_count / total_records) * 100, 2) if total_records > 0 else 0.0

        # Build detailed record list for client table inspection
        records_detail = []
        limit = min(total_records, max_record_details)
        for i in range(limit):
            pred_class = int(y_preds[i])
            prob = float(intrusion_probs[i])
            confidence = prob if pred_class == 1 else (1.0 - prob)

            # Determine threat risk severity
            if pred_class == 1:
                severity = "CRITICAL" if prob >= 0.85 else "HIGH" if prob >= 0.65 else "MEDIUM"
            else:
                severity = "BENIGN"

            val_src = cleaned_df.get("src_bytes", pd.Series([0] * total_records)).iloc[i]
            val_dst = cleaned_df.get("dst_bytes", pd.Series([0] * total_records)).iloc[i]
            src_bytes_val = int(val_src) if pd.notna(val_src) else 0
            dst_bytes_val = int(val_dst) if pd.notna(val_dst) else 0

            record_summary = {
                "id": i + 1,
                "protocol": str(cleaned_df.get("protocol_type", pd.Series(["unknown"] * total_records)).iloc[i]),
                "service": str(cleaned_df.get("service", pd.Series(["unknown"] * total_records)).iloc[i]),
                "flag": str(cleaned_df.get("flag", pd.Series(["unknown"] * total_records)).iloc[i]),
                "src_bytes": src_bytes_val,
                "dst_bytes": dst_bytes_val,
                "prediction": LABEL_MAPPING[pred_class],
                "is_intrusion": bool(pred_class == 1),
                "confidence": round(confidence * 100, 1),
                "threat_score": round(prob * 100, 1),
                "severity": severity,
            }
            records_detail.append(record_summary)

        return {
            "total_records": total_records,
            "normal_count": normal_count,
            "intrusion_count": intrusion_count,
            "intrusion_percentage": intrusion_percentage,
            "threat_status": "THREAT_DETECTED" if intrusion_count > 0 else "NORMAL_TRAFFIC",
            "evaluated_sample_count": len(records_detail),
            "records": records_detail,
        }

    def predict_single(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes inference for a single network flow record.
        """
        df = pd.DataFrame([flow])
        batch_result = self.predict_dataframe(df, max_record_details=1)
        record = batch_result["records"][0]
        return {
            "prediction": record["prediction"],
            "is_intrusion": record["is_intrusion"],
            "confidence": record["confidence"],
            "threat_score": record["threat_score"],
            "severity": record["severity"],
        }
