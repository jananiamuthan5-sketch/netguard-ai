# NetGuard AI — Machine Learning Subsystem

This module implements the Machine Learning pipeline for **NetGuard AI**: dataset download, preprocessing, multi-model training and benchmarking, model evaluation, pipeline serialization, and real inference served via FastAPI.

---

## Dataset

- **Dataset Name**: **NSL-KDD** (Network Security Laboratory — Knowledge Discovery in Databases)
- **Source / Reference**: University of New Brunswick (UNB) / Canadian Institute for Cybersecurity (retrieved via [`ml/src/download_dataset.py`](src/download_dataset.py) from the public `defcom17/NSL_KDD` mirror).
- **Files Used**:
  - **Training Set** (`ml/data/raw/KDDTrain+_20Percent.txt`): **25,192** flow records
  - **Evaluation Test Set** (`ml/data/raw/KDDTest+.txt`): **22,544** unseen flow records
  - *(Raw dataset files are untracked via `.gitignore` and can be downloaded at any time.)*
- **Binary Classification Target**:
  - **`0` (`NORMAL`)**: Legitimate network traffic labeled `normal`
  - **`1` (`POTENTIAL INTRUSION`)**: Attack categories (`DoS`, `Probe`, `R2L`, `U2R` subcategories collapsed to intrusion class `1`)

> **Demo vs. Training Data Separation**: `ml/data/test_samples/sample_network_traffic.csv` (30 unlabelled flow captures) is reserved strictly for API testing and UI uploads—never used for model training.

---

## Data Preprocessing

Implemented in [`ml/src/preprocess.py`](src/preprocess.py) and executed identically during training and inference:

1. **`clean_dataframe(df, drop_duplicates=...)`**:
   - Strips and lowercases column headers (`col.strip().lower()`)
   - Drops duplicate rows during training (`drop_duplicates=True`), while keeping all submitted flows during inference (`drop_duplicates=False`)
   - Trims and lowercases string values in categorical fields
   - Coerces numeric columns via `pd.to_numeric(..., errors="coerce")` and converts `+inf` / `-inf` to `NaN`
2. **`create_preprocessor()` (`ColumnTransformer`)**:
   - **Numerical pipeline**: `SimpleImputer(strategy="median")` &rarr; `StandardScaler()`
   - **Categorical pipeline**: `SimpleImputer(strategy="constant", fill_value="other")` &rarr; `OneHotEncoder(handle_unknown="ignore", sparse_output=False)`
   - Fitted strictly on `KDDTrain+_20Percent.txt` inside the Scikit-learn `Pipeline` to prevent data leakage.

---

## Feature Handling

`extract_features_and_target(df)` extracts and aligns the exact 41 NSL-KDD features (`ALL_FEATURE_COLUMNS`):
- Matches uploaded columns case-insensitively.
- Fills any absent optional columns cleanly (`0.0` for numeric columns, `"other"` for categorical columns) so trained transformer dimensions match at inference time.
- Extracts binary target (`0` or `1`) if a `label` column exists.

---

## Model Training

Implemented in [`ml/src/train_model.py`](src/train_model.py):
- Trains three class-weighted classifiers wrapped inside unified `Pipeline(preprocessor, classifier)` objects on `KDDTrain+_20Percent.txt`:
  1. `LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)`
  2. `DecisionTreeClassifier(max_depth=12, class_weight="balanced", random_state=42)`
  3. `RandomForestClassifier(n_estimators=100, max_depth=15, class_weight="balanced", random_state=42, n_jobs=-1)`
- Evaluates each pipeline on all **22,544** unseen flows in `KDDTest+.txt` and selects the candidate maximizing `(f1_score, recall)`.

---

## Model Evaluation

All metrics below are real measurements recorded in [`ml/models/model_metadata.json`](models/model_metadata.json) via [`ml/src/evaluate_model.py`](src/evaluate_model.py):

| Model Candidate | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Selected |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 75.14% | 91.65% | 61.98% | 73.95% | 0.8092 | — |
| **Decision Tree** | **82.26%** | **97.04%** | **71.00%** | **82.01%** | **0.7707** | **Yes** |
| Random Forest | 78.07% | 96.87% | 63.52% | 76.73% | 0.9641 | — |

### Confusion Matrix — Decision Tree (22,544 Test Records)
- **True Negatives (TN)**: `9,433`
- **False Positives (FP)**: `278`
- **False Negatives (FN)**: `3,721`
- **True Positives (TP)**: `9,112`

---

## Saved Model

- **Trained Pipeline Artifact**: `ml/models/netguard_model.joblib` (~22.5 KB, contains both fitted `ColumnTransformer` and `DecisionTreeClassifier`)
- **Evaluation & Schema Metadata**: `ml/models/model_metadata.json`

---

## How to Retrain

Run from the repository root with your virtual environment activated:

```bash
# 1. Ensure ML dependencies are installed
pip install -r ml/requirements.txt

# 2. Download NSL-KDD train and test datasets into ml/data/raw/
python ml/src/download_dataset.py

# 3. Train, evaluate, select best pipeline, and save artifacts
python ml/src/train_model.py

# 4. Verify saved model artifact and inference output
python ml/src/validate_ml_model.py
```

---

## Required Input Features

The model expects **41 network flow features**:
- **3 Categorical Features**: `protocol_type`, `service`, `flag`
- **38 Numerical Features**: `duration`, `src_bytes`, `dst_bytes`, `land`, `wrong_fragment`, `urgent`, `hot`, `num_failed_logins`, `logged_in`, `num_compromised`, `root_shell`, `su_attempted`, `num_root`, `num_file_creations`, `num_shells`, `num_access_files`, `num_outbound_cmds`, `is_host_login`, `is_guest_login`, `count`, `srv_count`, `serror_rate`, `srv_serror_rate`, `rerror_rate`, `srv_rerror_rate`, `same_srv_rate`, `diff_srv_rate`, `srv_diff_host_rate`, `dst_host_count`, `dst_host_srv_count`, `dst_host_same_srv_rate`, `dst_host_diff_srv_rate`, `dst_host_same_src_port_rate`, `dst_host_srv_diff_host_rate`, `dst_host_serror_rate`, `dst_host_srv_serror_rate`, `dst_host_rerror_rate`, `dst_host_srv_rerror_rate`

*(Note: Backend CSV ingestion also accepts headerless 41–43 column NSL-KDD text captures and assigns standard headers automatically.)*

---

## How Inference Works

Handled by [`NetGuardPredictor`](src/predict.py) and [`PredictionService`](../backend/app/services/prediction_service.py):

```text
CSV Input
   ↓
Validation (extension, size <= 50 MB, non-empty, network feature check)
   ↓
Preprocessing (clean_dataframe: lowercase headers, coerce numerics, inf -> NaN)
   ↓
Feature Alignment (extract_features_and_target across 41 NSL-KDD attributes)
   ↓
Trained Model (netguard_model.joblib: ColumnTransformer + DecisionTreeClassifier)
   ↓
Prediction (NORMAL / POTENTIAL INTRUSION + predict_proba confidence + severity tier)
```

Severity tiers assigned per record:
- `BENIGN` for Class `0` (`NORMAL`)
- `CRITICAL` for Class `1` with probability &ge; `0.85`
- `HIGH` for Class `1` with probability &ge; `0.65`
- `MEDIUM` for Class `1` with probability &lt; `0.65`
