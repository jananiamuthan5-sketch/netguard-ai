# NetGuard AI - Machine Learning Pipeline Specification

## 1. Classification Objectives
NetGuard AI executes binary classification on network traffic flow captures:
- **0: NORMAL / BENIGN TRAFFIC** - Verified legitimate network protocols and flows.
- **1: POTENTIAL INTRUSION / MALICIOUS TRAFFIC** - Known and zero-day threat attacks (DoS, Probe, R2L, U2R).

---

## 2. Real Benchmark Dataset
- **Dataset**: Official NSL-KDD Network Intrusion Detection Dataset (University of New Brunswick / Canadian Institute for Cybersecurity).
- **Training Subset**: `KDDTrain+_20Percent.txt` (25,192 records).
  - 13,449 Normal flows (53.4%)
  - 11,743 Intrusion flows (46.6%)
- **Test Set**: `KDDTest+.txt` (22,544 records).
  - 9,711 Normal flows (43.1%)
  - 12,833 Intrusion flows (56.9%)
- **Features**: 41 network flow attributes (3 categorical + 38 continuous/discrete numeric attributes).

---

## 3. Preprocessing Architecture
- **Missing & Infinite Values**:
  - Imputed using `SimpleImputer(strategy='median')` for numerical attributes.
  - Imputed using `SimpleImputer(strategy='constant', fill_value='other')` for categorical attributes.
- **Categorical Encoding**:
  - `OneHotEncoder(handle_unknown='ignore', sparse_output=False)` fitted strictly on training categories.
- **Numerical Normalization**:
  - `StandardScaler()` fitted strictly on training data to prevent data leakage.
- **Unified Pipeline**:
  - The preprocessing `ColumnTransformer` is encapsulated directly inside the serialized scikit-learn `Pipeline`, ensuring identical feature mapping during backend production inference.

---

## 4. Models Compared & Test Evaluation Results

All candidate models were trained on `KDDTrain+_20Percent.txt` and evaluated on the official test set `KDDTest+.txt` (22,544 unseen records):

| Model Candidate | Test Accuracy | Precision (Alert Purity) | Recall (Detection Rate) | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| **Logistic Regression** | 75.14% | 91.65% | 61.98% | 73.95% | 0.8092 |
| **Decision Tree (Selected)** | **82.26%** | **97.04%** | **71.00%** | **82.01%** | 0.7707 |
| **Random Forest** | 78.07% | 96.87% | 63.52% | 76.73% | 0.9641 |

### Selected Production Model: Decision Tree Classifier
- **Why Selected**:
  - Highest F1 Score (82.01%) and highest Threat Detection Recall (71.00%) on unseen network intrusions.
  - High Precision (97.04%) with 278 false alarms out of 9,711 normal flow tests (~2.86% false positive rate).
  - Lightweight tree-based pipeline suitable for fast batch CSV scoring via FastAPI.

### Confusion Matrix on Test Set (22,544 Records)
- **True Negatives (TN)**: 9,433 benign flows correctly classified.
- **False Positives (FP)**: 278 false alarms.
- **False Negatives (FN)**: 3,721 missed novel threat variations.
- **True Positives (TP)**: 9,112 attacks intercepted.

---

## 5. Artifacts & Persistence
- **Serialized Pipeline**: `ml/models/netguard_model.joblib`
- **Model Metadata**: `ml/models/model_metadata.json`
- **Sample Test Flow**: `ml/data/test_samples/sample_network_traffic.csv`
