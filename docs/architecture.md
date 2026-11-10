# NetGuard AI - System Architecture Blueprint

## 1. Overview
**NetGuard AI** is a full-stack Machine Learning-powered Network Intrusion Detection System (NIDS) built for CSV network flow inspection. The platform classifies uploaded packet flow telemetry into two binary classes:
- **Class 0 — `NORMAL`**: Benign network traffic
- **Class 1 — `POTENTIAL INTRUSION`**: Malicious / anomalous traffic patterns

---

## 2. Component Architecture

```text
                    ┌────────────────────────────┐
                    │      Client Browser        │
                    │  React 18 + Tailwind CSS   │
                    └─────────────┬──────────────┘
                                  │  HTTP / JSON & Multipart CSV
                                  ▼
                    ┌────────────────────────────┐
                    │    FastAPI Gateway v1      │
                    │  (/api/v1/health, etc.)    │
                    └───────┬─────────────┬──────┘
                            │             │
              ORM / SQL     ▼             ▼   ML Inference
         ┌─────────────────────┐   ┌──────────────────────┐
         │   SQLite Database   │   │  Scikit-learn Engine │
         │ (predictions table) │   │ (netguard_model.joblib)
         └─────────────────────┘   └──────────────────────┘
```

### 2.1 Frontend Subsystem (`/frontend`)
- **Framework**: React 18 bundled with Vite 5.
- **Styling**: Tailwind CSS configured with custom dark cybersecurity panels and status semantics.
- **Routing**: React Router v6 with implemented routes:
  - `/` — Landing overview with live API health check and pipeline summary
  - `/dashboard` — Operations security overview with summary cards and traffic pie chart
  - `/analyze` — CSV network flow drag-and-drop upload, sample CSV loader, and per-flow result table
  - `/results` — Persisted prediction session history queried from SQLite
  - `/analytics` — Security telemetry trends (pie, bar, and area charts via Recharts)
  - `/model-performance` — Verified NSL-KDD test evaluation metrics, confusion matrix, and classifier comparison
- **Configuration**: Uses `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).

### 2.2 Backend Subsystem (`/backend`)
- **Web Framework**: FastAPI running on Uvicorn ASGI.
- **API Versioning**: REST endpoints served under `/api/v1`; OpenAPI Swagger UI mounted at `/docs` (with `/api/v1/docs` redirect).
- **CORS**: Configured via Pydantic Settings (`BACKEND_CORS_ORIGINS`), allowing Vite local origins.
- **Database Layer**: SQLAlchemy ORM with SQLite (`backend/netguard.db`), initialized automatically on application startup lifespan.
- **Service Layer**: `PredictionService` orchestrates CSV schema validation, ML pipeline inference via `NetGuardPredictor`, SQLite persistence, and telemetry aggregation.

### 2.3 Machine Learning Subsystem (`/ml`)
- **Data Lifecycle**:
  `NSL-KDD Raw Dataset → Data Cleaning → ColumnTransformer Preprocessing → Classifier Training & Evaluation → Joblib Model Serialization → FastAPI Inference`
- **Core Libraries**: Scikit-Learn, Pandas, NumPy, SciPy, Joblib.
- **Modular Scripts**:
  - `download_dataset.py`: Downloads official `KDDTrain+_20Percent.txt` and `KDDTest+.txt`.
  - `preprocess.py`: Header sanitization, numeric/infinite cleaning, 41-feature alignment, `ColumnTransformer` construction.
  - `train_model.py`: Compares Logistic Regression, Decision Tree, and Random Forest; selects and serializes the best model pipeline and metadata.
  - `evaluate_model.py`: Computes Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
  - `predict.py`: Loads `netguard_model.joblib` via `NetGuardPredictor` for batch DataFrame and single-flow inference.
  - `validate_ml_model.py`: Verifies serialized artifact integrity and sample inference output.

---

## 3. Database Schema: `predictions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for the analysis session |
| `file_name` | String(255) | Not Null, Indexed | Name of uploaded CSV capture file |
| `total_records` | Integer | Not Null, Default 0 | Total network flow entries evaluated |
| `normal_count` | Integer | Not Null, Default 0 | Count of benign traffic records |
| `intrusion_count` | Integer | Not Null, Default 0 | Count of intrusion records |
| `created_at` | DateTime(UTC) | Not Null | Timestamp of analysis session |
