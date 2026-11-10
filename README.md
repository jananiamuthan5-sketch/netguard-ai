# NetGuard AI

## AI-Powered Network Intrusion Detection System

**NetGuard AI** is a full-stack Machine Learning-powered cybersecurity application designed to analyze network flow traffic data and identify potential network intrusions. Built with a React + Vite frontend, a FastAPI REST backend, SQLite persistence, and a Scikit-learn classification pipeline trained on the official **NSL-KDD** benchmark dataset, NetGuard AI inspects CSV network traffic captures and classifies flows into **`NORMAL`** or **`POTENTIAL INTRUSION`** with model confidence scoring.

---

## Project Overview

NetGuard AI processes offline network traffic logs through an automated end-to-end pipeline:

```text
CSV Network Traffic
        ↓
Data Validation
        ↓
Feature Preprocessing
        ↓
Machine Learning Model
        ↓
Intrusion Prediction
        ↓
SQLite History
        ↓
Dashboard & Analytics
```

1. **Upload**: Users submit CSV network flow capture files (or load the included sample NSL-KDD test capture) through the web interface or REST API.
2. **Validation**: FastAPI validates file extension (`.csv`), non-empty payloads, 50 MB size limits, and network flow schema coverage.
3. **Preprocessing**: Input records pass through the unified Scikit-learn preprocessing transformer (missing/infinite sanitization, median imputation, numeric scaling, and categorical one-hot encoding).
4. **Inference**: The serialized Decision Tree pipeline outputs binary predictions (`NORMAL` or `POTENTIAL INTRUSION`), per-flow confidence percentages, and risk severity ratings.
5. **Persistence & Analytics**: Session summaries are saved to SQLite via SQLAlchemy ORM and dynamically power historical logs and Recharts visualizations.

---

## Features

- **Network Traffic CSV Upload**: Drag-and-drop `.csv` upload with client/server validation (up to 50 MB) and a one-click sample NSL-KDD capture loader.
- **ML-Based Intrusion Detection**: Executes real batch inference using a trained Scikit-learn `Pipeline` (`ColumnTransformer` + `DecisionTreeClassifier`) stored in `ml/models/netguard_model.joblib`.
- **Binary Threat Classification**: Distinguishes benign communications (`NORMAL`) from malicious patterns (`POTENTIAL INTRUSION`) across 41 NSL-KDD network flow attributes.
- **Prediction Confidence & Severity Scoring**: Computes probability confidence scores via `predict_proba` and assigns per-record severity levels (`BENIGN`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Analysis History**: Stores every completed analysis run in SQLite (`predictions` table) for audit review on the Detection Results page.
- **Security Analytics**: Aggregates historical sessions into interactive pie, bar, and timeline charts with dynamic threat posture indexing (`LOW`, `MODERATE`, `ELEVATED`).
- **Model Performance Metrics**: Displays verified NSL-KDD test evaluation metrics, confusion matrix breakdowns, and candidate model comparisons pulled from `GET /api/v1/model`.
- **Responsive Cybersecurity Dashboard**: Dark-themed interface built with Tailwind CSS, adaptive sidebar navigation, and real-time backend health checks.

---

## Technology Stack

### Frontend
- **React 18** — Component-based UI framework
- **Vite 5** — Fast development server and bundler
- **Tailwind CSS 3** — Utility-first styling with dark cybersecurity theme tokens
- **React Router DOM v6** — Client-side multi-view routing
- **Recharts** — Responsive pie, bar, and area telemetry visualizations
- **Lucide React** — Security and UI iconography

### Backend
- **Python 3.10+** (verified on Python 3.14)
- **FastAPI** — High-performance REST API framework with automatic OpenAPI/Swagger documentation
- **Uvicorn** — ASGI server
- **SQLAlchemy 2.0** — ORM and SQLite database session management
- **SQLite** — Zero-configuration relational storage for prediction sessions
- **Pydantic v2 & Pydantic Settings** — Request/response schemas and environment configuration

### Machine Learning
- **Pandas & NumPy** — Tabular ingestion, validation, and array manipulation
- **Scikit-learn & SciPy** — Preprocessing transformers (`ColumnTransformer`, `SimpleImputer`, `StandardScaler`, `OneHotEncoder`), classifiers, and evaluation metrics
- **Joblib** — Pipeline serialization and low-overhead loading

---

## Project Architecture

```text
Frontend (React + Vite + Tailwind + Recharts)
        ↓ API Requests (/api/v1)
FastAPI Backend
        ↓
ML Inference Service (PredictionService + NetGuardPredictor)
        ↓
Trained Model (ml/models/netguard_model.joblib)

FastAPI Backend
        ↓
SQLite Database (SQLAlchemy ORM — backend/netguard.db)
        ↓
Prediction History & Analytics
```

### Folder Responsibilities

| Folder | Role |
| :--- | :--- |
| [`frontend/`](frontend) | React + Vite client UI, API service wrapper (`VITE_API_BASE_URL`), telemetry charts, and CSV upload pages. |
| [`backend/`](backend) | FastAPI REST API routes, Pydantic schemas, SQLAlchemy SQLite database configuration, `PredictionService`, and automated tests. |
| [`ml/`](ml) | Dataset ingestion, data cleaning & preprocessing pipeline, multi-model training/evaluation, inference engine, and saved artifacts. |
| [`docs/`](docs) | Architectural specifications, API contract documentation, and ML pipeline notes. |

---

## Machine Learning Pipeline

The machine learning workflow in [`ml/src/`](ml/src) executes the following end-to-end stages:

1. **Dataset Preparation**: `download_dataset.py` retrieves the official **NSL-KDD** dataset splits from the Canadian Institute for Cybersecurity / UNB mirror:
   - Training set: `KDDTrain+_20Percent.txt` (**25,192** records)
   - Evaluation test set: `KDDTest+.txt` (**22,544** unseen records)
2. **Data Validation**: Verifies expected 41-feature schemas and maps raw NSL-KDD labels into binary targets (`normal` &rarr; `0`, all attack subcategories &rarr; `1`).
3. **Data Cleaning**: `clean_dataframe()` standardizes column headers (`.strip().lower()`), normalizes categorical text, converts invalid numeric strings via `pd.to_numeric(..., errors="coerce")`, converts `inf`/`-inf` to `NaN`, and drops exact duplicates on the training set.
4. **Feature Processing**: `create_preprocessor()` builds a Scikit-learn `ColumnTransformer` processing:
   - **38 Numerical Features**: `SimpleImputer(strategy="median")` + `StandardScaler()`
   - **3 Categorical Features** (`protocol_type`, `service`, `flag`): `SimpleImputer(strategy="constant", fill_value="other")` + `OneHotEncoder(handle_unknown="ignore")`
5. **Train / Test Separation**: Preprocessing transformers fit strictly on the official training split (`KDDTrain+_20Percent.txt`) and transform the independent test set (`KDDTest+.txt`) without data leakage.
6. **Model Training**: `train_model.py` trains three class-balanced candidate classifiers (`Logistic Regression`, `Decision Tree`, and `Random Forest`) wrapped inside full end-to-end Scikit-learn `Pipeline` objects.
7. **Model Evaluation**: `evaluate_model.py` scores every candidate pipeline on all **22,544** unseen test records using Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix counts.
8. **Best Model Selection**: Selects the top model maximizing `(f1_score, recall)`. **Decision Tree** (`max_depth=12`, `class_weight="balanced"`) achieved the best overall balance and was selected.
9. **Model Persistence**: Saves the fitted end-to-end pipeline (preprocessor + classifier) to `ml/models/netguard_model.joblib` and full metrics/metadata to `ml/models/model_metadata.json`.
10. **Real Inference**: `NetGuardPredictor` loads `netguard_model.joblib` once and scores incoming CSV captures via identical preprocessing steps.

---

## Model Evaluation

All metrics below are **real empirical measurements** computed by `ml/src/train_model.py` on the unseen **NSL-KDD `KDDTest+.txt`** benchmark (**22,544 records**), read programmatically from [`ml/models/model_metadata.json`](ml/models/model_metadata.json) and exposed via `GET /api/v1/model`:

### Candidate Classifier Comparison

| Model Candidate | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Selected |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 75.14% | 91.65% | 61.98% | 73.95% | 0.8092 | No |
| **Decision Tree** | **82.26%** | **97.04%** | **71.00%** | **82.01%** | **0.7707** | **Active Model** |
| Random Forest | 78.07% | 96.87% | 63.52% | 76.73% | 0.9641 | No |

### Active Production Model Confusion Matrix (`Decision Tree` on 22,544 Test Flows)

- **True Negatives (TN)**: `9,433` (Benign traffic verified normal)
- **False Positives (FP)**: `278` (False alarms — 2.86% false positive rate)
- **False Negatives (FN)**: `3,721` (Missed novel/zero-day attack variations)
- **True Positives (TP)**: `9,112` (Malicious intrusions accurately intercepted)

---

## Installation and Setup

### Prerequisites
- **Python**: `3.10+`
- **Node.js**: `18+` and **npm** `9+`

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd "NetGuard AI"
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

### 3. Create Python Virtual Environment
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

### 4. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

Optional local configuration override:
```bash
cp .env.example .env
```

### 5. Train the ML Model (Optional — Pre-trained Artifact Included)
A pre-trained pipeline (`ml/models/netguard_model.joblib`) and verified metadata (`ml/models/model_metadata.json`) are included in the repository. To re-download NSL-KDD and retrain from scratch, run from the repository root:
```bash
python ml/src/download_dataset.py
python ml/src/train_model.py
python ml/src/validate_ml_model.py
```

### 6. Start the Backend
From the `backend/` folder (with `venv` activated):
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*(Or from the repository root: `uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000`.)*

Verify backend endpoints:
- Health check: `http://127.0.0.1:8000/api/v1/health`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs` (also redirected from `/api/v1/docs`)

### 7. Install Frontend Dependencies
Open a second terminal, navigate to `frontend/`, and install packages:
```bash
cd frontend
npm install
```

Optional environment variable override (`VITE_API_BASE_URL`):
```bash
cp .env.example .env
```

### 8. Start the Frontend
```bash
npm run dev
```
Open your browser to **`http://localhost:5173`**.

---

## API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs` when the backend is running.

### Implemented Endpoints

| Method & Path | Purpose | Input | Output | Validation & Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **`GET /api/v1/health`** | Operational health check for UI/monitoring | None | `{"status": "healthy", "service": "NetGuard AI API"}` | Returns HTTP 200 when FastAPI is running. |
| **`GET /api/v1/analysis`** | Returns schema expectation metadata for upload UI | None | JSON specification object | Indicates ready status and CSV format expectation. |
| **`POST /api/v1/analysis`** | Analyzes network traffic CSV & saves session | `multipart/form-data` with field `file` (`.csv`) | `session_id`, `file_name`, `created_at`, counts, `threat_status`, and classified `records` | Rejects missing filename (`400`), non-CSV (`400`), empty file (`400`), files >50 MB (`413`), and unrecognized schemas (`422`). Cleans `NaN`/`Inf` values safely. |
| **`GET /api/v1/predictions`** | Retrieves persisted historical analysis sessions | Optional `skip` (`>=0`), `limit` (`1-500`) | JSON array of `PredictionResponse` objects ordered newest first | Queries SQLite `predictions` table via SQLAlchemy. |
| **`GET /api/v1/predictions/{id}`** | Retrieves a specific prediction session by ID | Integer path parameter `prediction_id` | Single `PredictionResponse` JSON object | Returns `404 Not Found` if ID does not exist. |
| **`GET /api/v1/analytics`** | Aggregates cumulative traffic & threat telemetry | None | `total_sessions`, `total_records`, counts, `intrusion_rate`, `threat_level`, and `sessions` timeline | Computed dynamically from SQLite records (`LOW`, `MODERATE`, `ELEVATED`). |
| **`GET /api/v1/model`** | Returns active ML model metrics & feature schema | None | `trained`, `model_name`, `dataset_name`, `evaluation_metrics`, `models_compared` | Reads directly from `ml/models/model_metadata.json`. |

---

## Running Automated Tests

Run the test scripts from the repository root using the backend virtual environment:
```bash
# Validate ML artifact & inference
backend/venv/Scripts/python ml/src/validate_ml_model.py

# Unit tests for API routes & persistence
backend/venv/Scripts/python backend/tests/test_api.py

# Positive & negative edge-case tests (13 cases)
backend/venv/Scripts/python backend/tests/test_api_edge_cases.py

# Direct SQLite schema & persistence check
backend/venv/Scripts/python backend/tests/test_database_validation.py

# End-to-end integration test
backend/venv/Scripts/python backend/tests/test_end_to_end_workflow.py

# Verify production frontend bundle
npm --prefix frontend run build
```

---

## Project Structure

```text
NetGuard AI/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI entrypoint, CORS, Swagger docs, lifespan DB init
│   │   ├── api/
│   │   │   ├── api.py               # v1 router registration
│   │   │   └── routes/
│   │   │       ├── analysis.py      # GET/POST /api/v1/analysis
│   │   │       ├── analytics.py     # GET /api/v1/analytics
│   │   │       ├── health.py        # GET /api/v1/health
│   │   │       ├── model.py         # GET /api/v1/model
│   │   │       └── predictions.py   # GET /api/v1/predictions & /{id}
│   │   ├── core/
│   │   │   └── config.py            # Pydantic settings & absolute SQLite path
│   │   ├── database/
│   │   │   └── session.py           # SQLAlchemy engine, SessionLocal, init_db
│   │   ├── models/
│   │   │   └── prediction.py        # Prediction SQLAlchemy ORM model
│   │   ├── schemas/
│   │   │   ├── health.py            # HealthCheck Pydantic schema
│   │   │   └── prediction.py        # Analysis, Prediction, Analytics, Model schemas
│   │   └── services/
│   │       └── prediction_service.py# CSV parsing, ML orchestration & DB queries
│   └── tests/
│       ├── test_api.py
│       ├── test_api_edge_cases.py
│       ├── test_database_validation.py
│       └── test_end_to_end_workflow.py
├── docs/
│   ├── api_spec.md
│   ├── architecture.md
│   └── ml_pipeline.md
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── public/
│   │   ├── robots.txt
│   │   └── sample_network_traffic.csv
│   └── src/
│       ├── App.jsx                  # Client routing table
│       ├── index.css
│       ├── main.jsx
│       ├── components/              # AppLayout, Header, Sidebar, MetricCard, StatusBadge, etc.
│       ├── hooks/
│       │   └── useApiHealth.js      # Live backend connectivity polling
│       ├── pages/                   # LandingPage, DashboardPage, AnalyzePage, ResultsPage, AnalyticsPage, ModelPerformancePage, NotFoundPage
│       ├── services/
│       │   └── api.js               # REST client using VITE_API_BASE_URL
│       └── utils/
│           └── constants.js
└── ml/
    ├── README.md                    # Detailed ML pipeline documentation
    ├── requirements.txt
    ├── data/
    │   ├── processed/.gitkeep
    │   ├── raw/.gitkeep
    │   └── test_samples/
    │       ├── README.md
    │       └── sample_network_traffic.csv
    ├── models/
    │   ├── .gitkeep
    │   ├── model_metadata.json      # Real test set metrics & feature lists
    │   └── netguard_model.joblib    # Serialized Decision Tree pipeline
    ├── notebooks/.gitkeep
    └── src/
        ├── __init__.py
        ├── download_dataset.py      # Fetches NSL-KDD KDDTrain+_20Percent & KDDTest+
        ├── preprocess.py            # Data sanitization & ColumnTransformer builder
        ├── train_model.py           # Trains, evaluates, selects & saves best pipeline
        ├── evaluate_model.py        # Accuracy, Precision, Recall, F1, ROC-AUC, CM
        ├── predict.py               # NetGuardPredictor batch & single inference API
        └── validate_ml_model.py     # Artifact integrity verification
```

---

## Limitations

- **Offline CSV Batch Analysis Only**: NetGuard AI evaluates exported CSV network flow records and does **not** perform live packet sniffing (`libpcap`/promiscuous interface capture) or continuous network socket monitoring.
- **NSL-KDD Feature Schema Dependency**: Input CSV captures must align with NSL-KDD network flow features (41 standard flow attributes, or headerless 41–43 column NSL-KDD lines). Unrelated tabular CSV files are rejected with HTTP `422`.
- **Binary Classification Scope**: The current production model classifies records strictly as `NORMAL` (`0`) or `POTENTIAL INTRUSION` (`1`); it does not separate predictions into specific attack sub-categories (DoS, Probe, R2L, U2R) at inference time.
- **Historical Dataset Domain**: Models were trained on NSL-KDD benchmark data; detection effectiveness on encrypted or modern proprietary traffic depends on retraining with contemporary datasets (e.g., CIC-IDS2017/2018).
- **Educational & Demonstration Scope**: Not intended as a standalone replacement for enterprise Intrusion Prevention Systems (IPS), firewalls, or 24/7 SOC threat mitigation platforms.

---

## Future Improvements

*The following enhancements are planned for future iterations and are **not yet implemented**:*

- Multi-class attack classification categorizing specific attack families (`DoS`, `Probe`, `R2L`, `U2R`)
- Live network interface packet capture and streaming flow extraction
- User authentication, API keys, and role-based access control (RBAC)
- Migration from SQLite to PostgreSQL for high-concurrency multi-user deployments
- Containerized cloud deployment (`Dockerfile`, `docker-compose.yml`, and CI/CD pipelines)
- Expanded hyperparameter tuning and gradient-boosted model benchmarking (`XGBoost`, `LightGBM`)
- Exportable forensic PDF/CSV audit reports and real-time webhook/email alerts
