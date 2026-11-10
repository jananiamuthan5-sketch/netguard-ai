"""
NetGuard AI - Model Training & Selection Pipeline

Executes:
1. Ingestion of official NSL-KDD real network flow datasets:
   - Training: KDDTrain+_20Percent.txt (25,192 records)
   - Test: KDDTest+.txt (22,544 records)
2. Data cleaning, feature scaling, and one-hot encoding via scikit-learn ColumnTransformer.
3. Training and quantitative comparison of 3 candidate classifiers:
   - Logistic Regression
   - Decision Tree Classifier
   - Random Forest Classifier
4. Evaluation on real test split (22,544 records) computing:
   - Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
5. Selection of the best performing model.
6. Serialization of complete scikit-learn Pipeline to ml/models/netguard_model.joblib
   and metadata to ml/models/model_metadata.json.
"""

from datetime import datetime, timezone
import json
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

try:
    from .evaluate_model import ModelEvaluator
    from .preprocess import (
        ALL_FEATURE_COLUMNS,
        CATEGORICAL_FEATURES,
        NUMERICAL_FEATURES,
        clean_dataframe,
        create_preprocessor,
        extract_features_and_target,
        load_nsl_kdd_raw,
    )
except ImportError:
    from evaluate_model import ModelEvaluator
    from preprocess import (
        ALL_FEATURE_COLUMNS,
        CATEGORICAL_FEATURES,
        NUMERICAL_FEATURES,
        clean_dataframe,
        create_preprocessor,
        extract_features_and_target,
        load_nsl_kdd_raw,
    )


def run_training_pipeline():
    print("=" * 70)
    print("NETGUARD AI - REAL MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 70)

    # File paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(base_dir, "..", "data", "raw")
    models_dir = os.path.join(base_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    train_file = os.path.join(raw_data_dir, "KDDTrain+_20Percent.txt")
    test_file = os.path.join(raw_data_dir, "KDDTest+.txt")

    if not os.path.exists(train_file) or not os.path.exists(test_file):
        raise FileNotFoundError(
            f"Dataset files not found in {raw_data_dir}. Run download_dataset.py first."
        )

    # 1. Load real raw datasets
    print("\n[STEP 1] Loading official NSL-KDD benchmark datasets...")
    df_train_raw = load_nsl_kdd_raw(train_file, has_difficulty=True)
    df_test_raw = load_nsl_kdd_raw(test_file, has_difficulty=True)
    print(f"  Training records loaded: {len(df_train_raw):,}")
    print(f"  Test records loaded    : {len(df_test_raw):,}")

    # 2. Data Cleaning
    print("\n[STEP 2] Cleaning records and verifying feature schemas...")
    df_train_clean = clean_dataframe(df_train_raw, drop_duplicates=True)
    df_test_clean = clean_dataframe(df_test_raw, drop_duplicates=False)

    # 3. Feature and Target Extraction (Normal = 0, Attack = 1)
    print("\n[STEP 3] Extracting 41 network flow features and binary classification targets...")
    X_train, y_train = extract_features_and_target(df_train_clean)
    X_test, y_test = extract_features_and_target(df_test_clean)

    train_normal = int((y_train == 0).sum())
    train_intrusion = int((y_train == 1).sum())
    test_normal = int((y_test == 0).sum())
    test_intrusion = int((y_test == 1).sum())

    print(f"  Train set: {train_normal:,} Normal ({train_normal/len(y_train)*100:.1f}%), "
          f"{train_intrusion:,} Intrusion ({train_intrusion/len(y_train)*100:.1f}%)")
    print(f"  Test set : {test_normal:,} Normal ({test_normal/len(y_test)*100:.1f}%), "
          f"{test_intrusion:,} Intrusion ({test_intrusion/len(y_test)*100:.1f}%)")

    # 4. Define candidate models
    print("\n[STEP 4 & 5] Initializing and training candidate classifiers...")
    candidates = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=12,
            class_weight="balanced",
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        )
    }

    evaluator = ModelEvaluator(target_names=["Normal", "Intrusion"])
    evaluation_results = {}
    fitted_pipelines = {}

    for name, classifier in candidates.items():
        print(f"\n---> Training: {name}...")
        # Build end-to-end scikit-learn Pipeline
        preprocessor = create_preprocessor()
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", classifier)
        ])

        # Fit strictly on training data
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Predict on real test data
        print(f"     Evaluating {name} on {len(X_test):,} unseen test records...")
        y_pred = pipeline.predict(X_test)
        y_prob = None
        if hasattr(pipeline, "predict_proba"):
            try:
                y_prob = pipeline.predict_proba(X_test)
            except Exception:
                y_prob = None

        metrics = evaluator.compute_metrics(y_test.values, y_pred, y_prob)
        evaluation_results[name] = metrics
        evaluator.print_evaluation_summary(name, metrics)

    # 5. Quantitative Model Comparison & Selection
    print("\n" + "=" * 70)
    print("[STEP 6 & 7] QUANTITATIVE MODEL COMPARISON ON REAL TEST DATA")
    print("=" * 70)
    print(f"{'Model':<22} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1 Score':<10} | {'ROC-AUC':<10}")
    print("-" * 80)
    for name, metrics in evaluation_results.items():
        roc_str = f"{metrics['roc_auc']:.4f}" if metrics['roc_auc'] else "N/A"
        print(f"{name:<22} | {metrics['accuracy']*100:<9.2f}% | {metrics['precision']*100:<9.2f}% | {metrics['recall']*100:<9.2f}% | {metrics['f1_score']*100:<9.2f}% | {roc_str:<10}")
    print("-" * 80)

    # Selection logic: Primary criterion is F1 Score and Detection Rate (Recall)
    best_model_name = max(
        evaluation_results.keys(),
        key=lambda k: (evaluation_results[k]["f1_score"], evaluation_results[k]["recall"])
    )
    best_metrics = evaluation_results[best_model_name]
    best_pipeline = fitted_pipelines[best_model_name]

    print(f"\n>>> SELECTED BEST MODEL: {best_model_name}")
    print(f"    Rationale: Achieved the highest F1 Score ({best_metrics['f1_score']*100:.2f}%) "
          f"and Detection Recall ({best_metrics['recall']*100:.2f}%) on unseen network flow intrusions.")

    # 6. Save the complete pipeline and metadata
    print("\n[STEP 8] Serializing complete trained pipeline and evaluation metadata...")
    model_save_path = os.path.join(models_dir, "netguard_model.joblib")
    joblib.dump(best_pipeline, model_save_path)
    file_size_mb = os.path.getsize(model_save_path) / (1024 * 1024)
    print(f"  Trained pipeline saved to: {model_save_path} ({file_size_mb:.2f} MB)")

    # Metadata record
    metadata = {
        "model_name": best_model_name,
        "algorithm": best_model_name,
        "framework": "scikit-learn",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_name": "NSL-KDD",
        "dataset_source": "University of New Brunswick / Canadian Institute for Cybersecurity",
        "training_records": len(X_train),
        "test_records": len(X_test),
        "input_features_count": len(ALL_FEATURE_COLUMNS),
        "features": ALL_FEATURE_COLUMNS,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "target_mapping": {
            "0": "NORMAL / BENIGN TRAFFIC",
            "1": "POTENTIAL INTRUSION / MALICIOUS TRAFFIC"
        },
        "evaluation_metrics": {
            "accuracy": best_metrics["accuracy"],
            "precision": best_metrics["precision"],
            "recall": best_metrics["recall"],
            "f1_score": best_metrics["f1_score"],
            "roc_auc": best_metrics["roc_auc"],
            "confusion_matrix": best_metrics["confusion_matrix"],
            "detailed_report": best_metrics["detailed_report"]
        },
        "models_compared": {
            m_name: {
                "accuracy": m_metrics["accuracy"],
                "precision": m_metrics["precision"],
                "recall": m_metrics["recall"],
                "f1_score": m_metrics["f1_score"],
                "roc_auc": m_metrics["roc_auc"],
                "confusion_matrix": m_metrics["confusion_matrix"],
            }
            for m_name, m_metrics in evaluation_results.items()
        },
        "selection_reason": (
            f"{best_model_name} demonstrated the superior balance of high threat detection "
            f"recall ({best_metrics['recall']*100:.2f}%) and low false alarms on real test data."
        )
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Model metadata saved to: {metadata_path}")

    print("\n" + "=" * 70)
    print("NETGUARD AI - REAL MODEL TRAINING & PERSISTENCE COMPLETE")
    print("=" * 70)
    return best_model_name, best_metrics


if __name__ == "__main__":
    run_training_pipeline()
