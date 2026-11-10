"""
NetGuard AI - ML Model & Pipeline Validation Script
Verifies artifact integrity, feature mappings, and inference consistency.
"""

import json
import os
import sys
import joblib
import pandas as pd

# Add workspace root to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, root_dir)

from ml.src.predict import NetGuardPredictor
from ml.src.preprocess import (
    ALL_FEATURE_COLUMNS,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
)


def validate_ml():
    print("=" * 65)
    print("STEP 2: MACHINE LEARNING PIPELINE VALIDATION")
    print("=" * 65)

    # 1. Check artifact exists
    model_path = os.path.join(root_dir, "ml", "models", "netguard_model.joblib")
    print(f"1. Checking model artifact existence at: {model_path}")
    assert os.path.exists(model_path), f"Missing model artifact at {model_path}"
    file_size_kb = os.path.getsize(model_path) / 1024
    print(f"   [PASS] Artifact exists ({file_size_kb:.2f} KB)")

    # 2. Successfully load model
    print("2. Loading serialized model with joblib...")
    pipeline = joblib.load(model_path)
    print(f"   [PASS] Pipeline loaded: {type(pipeline).__name__}")

    # 3. Complete preprocessing pipeline is included
    print("3. Checking pipeline stages and transformers...")
    assert hasattr(pipeline, "named_steps"), "Pipeline missing named_steps"
    assert "preprocessor" in pipeline.named_steps, "Pipeline missing 'preprocessor' step"
    assert "classifier" in pipeline.named_steps, "Pipeline missing 'classifier' step"
    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]
    print(f"   [PASS] Preprocessor: {type(preprocessor).__name__}")
    print(f"   [PASS] Classifier: {type(classifier).__name__} ({classifier})")

    # 4. Required input features verification
    print("4. Verifying required input features...")
    print(f"   Total expected features: {len(ALL_FEATURE_COLUMNS)}")
    assert len(ALL_FEATURE_COLUMNS) == 41, f"Expected 41 features, got {len(ALL_FEATURE_COLUMNS)}"
    assert len(CATEGORICAL_FEATURES) == 3
    assert len(NUMERICAL_FEATURES) == 38
    print("   [PASS] 3 categorical + 38 numerical features defined and matched.")

    # 5 & 6. Test inference & confidence on sample test data
    print("5 & 6. Validating NetGuardPredictor inference and confidence scoring...")
    predictor = NetGuardPredictor(model_path=model_path)
    assert predictor.is_ready()

    sample_csv_path = os.path.join(root_dir, "ml", "data", "test_samples", "sample_network_traffic.csv")
    assert os.path.exists(sample_csv_path), "Sample CSV missing"
    df_sample = pd.read_csv(sample_csv_path)
    print(f"   Loaded sample CSV with shape: {df_sample.shape}")
    assert df_sample.shape[1] == 41, f"Expected 41 columns in sample CSV, got {df_sample.shape[1]}"

    results = predictor.predict_dataframe(df_sample)
    print(f"   Inference output:")
    print(f"     Total Records : {results['total_records']}")
    print(f"     Normal Count  : {results['normal_count']}")
    print(f"     Intrusion Count: {results['intrusion_count']}")
    print(f"     Intrusion %   : {results['intrusion_percentage']}%")
    print(f"     Threat Status : {results['threat_status']}")

    assert results["total_records"] == len(df_sample)
    assert results["normal_count"] + results["intrusion_count"] == len(df_sample)
    assert results["intrusion_count"] > 0
    assert results["normal_count"] > 0

    # Verify per-record confidence scores
    records = results["records"]
    assert len(records) > 0
    for r in records[:5]:
        assert "confidence" in r
        assert 0.0 <= r["confidence"] <= 100.0
        assert r["severity"] in ["BENIGN", "MEDIUM", "HIGH", "CRITICAL"]
        print(f"     Record #{r['id']}: {r['protocol']}/{r['service']} -> {r['prediction']} ({r['confidence']}%, severity: {r['severity']})")

    print("\n   [PASS] Model inference and confidence scoring verified.")

    # 7. Check metadata record
    metadata_path = os.path.join(root_dir, "ml", "models", "model_metadata.json")
    print(f"7. Verifying model metadata file: {metadata_path}")
    assert os.path.exists(metadata_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    print(f"   Algorithm: {meta.get('algorithm')}")
    print(f"   Dataset: {meta.get('dataset_name')}")
    print(f"   Accuracy: {meta.get('evaluation_metrics', {}).get('accuracy')}")
    print(f"   Recall (Detection Rate): {meta.get('evaluation_metrics', {}).get('recall')}")
    print("   [PASS] Metadata verified.")

    print("\n" + "=" * 65)
    print("STEP 2 ML VALIDATION COMPLETED SUCCESSFULLY WITH 0 ERRORS")
    print("=" * 65)


if __name__ == "__main__":
    validate_ml()
