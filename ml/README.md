# NetGuard AI - Machine Learning Engine Foundation

Welcome to the **NetGuard AI** Machine Learning subsystem. This module provides the pipeline architecture for training and serving machine learning models that detect network intrusions from packet and flow logs.

---

## 🎯 Classification Objective

NetGuard AI performs binary classification on network traffic flow records:

1. **Class 0: NORMAL / BENIGN TRAFFIC** - Legitimate network communications (HTTP, DNS, standard TCP/UDP handshakes).
2. **Class 1: POTENTIAL INTRUSION / MALICIOUS TRAFFIC** - Malicious activities including DoS/DDoS, Port Scans, Brute Force, and unauthorized access attempts.

---

## 🔄 End-to-End ML Pipeline Architecture

The planned pipeline follows standard cybersecurity machine learning best practices:

```
[ Raw Dataset ]
      │
      ▼
[ Data Validation ]      --> Verify feature columns, data types, and record integrity
      │
      ▼
[ Data Cleaning ]        --> Handle missing/NaN values, strip anomalies, remove duplicates
      │
      ▼
[ Feature Processing ]   --> One-Hot/Ordinal encoding for protocols, StandardScaler for flow counts
      │
      ▼
[ Train/Test Split ]     --> Stratified split to preserve benign vs. malicious traffic distribution
      │
      ▼
[ Model Training ]       --> Train classifiers (Random Forest, Gradient Boosting, etc.)
      │
      ▼
[ Model Evaluation ]     --> Assess Precision, Recall (Detection Rate), F1-Score, ROC-AUC
      │
      ▼
[ Save Best Model ]      --> Serialize model artifact and preprocessor transformers via Joblib
      │
      ▼
[ Prediction Engine ]    --> Real-time single flow and batch CSV inference served via FastAPI
```

---

## 📁 Directory Structure

```
ml/
├── data/
│   ├── raw/             # Raw dataset archives (e.g., CSV, PCAP) - untracked by Git
│   └── processed/       # Cleaned, engineered feature datasets ready for training
├── models/              # Serialized model binaries (.joblib) and transformer artifacts
├── notebooks/           # Jupyter notebooks for Exploratory Data Analysis (EDA) and prototyping
├── src/
│   ├── preprocess.py    # Validation, cleaning, and feature engineering transformers
│   ├── train_model.py   # Model training, hyperparameter optimization, and serialization
│   ├── evaluate_model.py# Evaluation metrics (precision, recall, ROC-AUC, confusion matrix)
│   └── predict.py       # Inference engine for single and batch predictions
└── README.md            # Subsystem documentation (this file)
```

---

## 📊 Target Datasets for Phase 2

For Phase 2 training, the following benchmark cybersecurity datasets are recommended:
- **NSL-KDD**: Refined benchmark dataset solving synthetic duplication issues in original KDD'99.
- **CIC-IDS2017 / CIC-IDS2018**: Modern Canadian Institute for Cybersecurity network flow datasets with 80+ network traffic features and diverse contemporary attack vectors.

---

## 🛡️ Phase 1 Implementation Principles

- **No Fake Predictions**: The foundation contains structured classes and functions without mocking artificial predictions.
- **No Mock Accuracies**: Model metrics are only reported when real training and cross-validation are executed.
- **Production-Ready Structure**: Clean modular separation enables rapid plug-and-play model training in Phase 2.
