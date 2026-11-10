"""
NetGuard AI - Model Evaluation Module

Calculates critical cybersecurity metrics from real test predictions:
- Accuracy
- Precision
- Recall (Detection Rate)
- F1-Score
- ROC-AUC
- Confusion Matrix (TN, FP, FN, TP)
"""

from typing import Any, Dict, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


class ModelEvaluator:
    """
    Evaluates binary network intrusion classification models on test datasets.
    """

    def __init__(self, target_names: Optional[list] = None):
        self.target_names = target_names or ["Normal", "Intrusion"]

    def compute_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """
        Calculates all required cybersecurity classification performance metrics.
        """
        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        roc_auc = None
        if y_prob is not None:
            try:
                # If 2D probability array is passed, extract positive column
                if len(y_prob.shape) > 1 and y_prob.shape[1] > 1:
                    roc_auc = float(roc_auc_score(y_true, y_prob[:, 1]))
                else:
                    roc_auc = float(roc_auc_score(y_true, y_prob))
            except Exception:
                roc_auc = None

        # Compute confusion matrix [[TN, FP], [FN, TP]]
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = int(cm[0][0]), int(cm[0][1]), int(cm[1][0]), int(cm[1][1])

        report_dict = classification_report(
            y_true, y_pred, target_names=self.target_names, output_dict=True, zero_division=0
        )

        metrics = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
            "confusion_matrix": {
                "tn": tn,
                "fp": fp,
                "fn": fn,
                "tp": tp,
            },
            "detailed_report": report_dict,
        }

        return metrics

    def print_evaluation_summary(self, model_name: str, metrics: Dict[str, Any]) -> None:
        """
        Prints a structured cybersecurity evaluation report.
        """
        cm = metrics["confusion_matrix"]
        print("\n" + "=" * 65)
        print(f"NETGUARD AI - REAL MODEL EVALUATION REPORT: {model_name}")
        print("=" * 65)
        print(f"  Accuracy                : {metrics['accuracy'] * 100:.2f}%")
        print(f"  Precision (Alert Purity): {metrics['precision'] * 100:.2f}%")
        print(f"  Recall (Detection Rate) : {metrics['recall'] * 100:.2f}%")
        print(f"  F1 Score (Harmonic Mean): {metrics['f1_score'] * 100:.2f}%")
        if metrics.get("roc_auc") is not None:
            print(f"  ROC-AUC Score           : {metrics['roc_auc']:.4f}")
        print("\n--- Confusion Matrix ---")
        print(f"  True Negatives  (Benign Traffic Verified) : {cm['tn']:,}")
        print(f"  False Positives (False Alarms)            : {cm['fp']:,}")
        print(f"  False Negatives (Missed Threat Intrusions): {cm['fn']:,}")
        print(f"  True Positives  (Intrusions Intercepted)  : {cm['tp']:,}")
        print("=" * 65)
