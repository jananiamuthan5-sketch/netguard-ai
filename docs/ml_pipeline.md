# NetGuard AI - Machine Learning Pipeline Specification

## 1. Objectives & Threat Vectors
The NetGuard AI Machine Learning engine provides binary classification for network flow logs:
1. **0: Normal / Benign Traffic**
2. **1: Potential Intrusion / Malicious Traffic** (DoS, PortScan, BruteForce, Infiltration)

---

## 2. Pipeline Sequence

```
1. Raw Dataset Ingestion
       │  (CSV / PCAP / Flow records)
       ▼
2. Data Validation
       │  (Column consistency, type checks, missing values)
       ▼
3. Data Cleaning
       │  (NaN imputation, inf values removal, string stripping)
       ▼
4. Feature Processing
       │  (One-Hot / Target encoding, StandardScaler)
       ▼
5. Train / Test Split
       │  (Stratified 80/20 train/test split)
       ▼
6. Model Training
       │  (RandomForestClassifier, HistGradientBoosting)
       ▼
7. Model Evaluation
       │  (Confusion Matrix, Precision, Recall, ROC-AUC)
       ▼
8. Model Serialization
       │  (Joblib export to ml/models/)
       ▼
9. Prediction Service
          (FastAPI inference invocation)
```

---

## 3. Key Evaluation Metrics

In cybersecurity intrusion detection, classification accuracy alone is misleading due to severe class imbalance:
- **Precision**: $\frac{TP}{TP + FP}$ — Ensures alerts are legitimate, preventing analyst fatigue.
- **Recall (Detection Rate)**: $\frac{TP}{TP + FN}$ — Ensures actual intrusions are intercepted and not classified as benign.
- **F1-Score**: Harmonic balance between Precision and Recall.
- **ROC-AUC**: Overall discrimination capability across classification thresholds.
