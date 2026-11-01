# NetGuard AI - System Architecture Blueprint

## 1. Overview
**NetGuard AI** is a professional full-stack Machine Learning-powered Network Intrusion Detection System (NIDS). The platform is architected to inspect network packet and flow telemetry, providing rapid classification into:
- **Normal / Benign Traffic (Class 0)**
- **Potential Intrusion / Malicious Traffic (Class 1)**

---

## 2. Component Architecture

```
                    ┌────────────────────────────┐
                    │      Client Browser        │
                    │   React 18 + Tailwind CSS  │
                    └─────────────┬──────────────┘
                                  │  HTTP / JSON
                                  ▼
                    ┌────────────────────────────┐
                    │    FastAPI Gateway v1      │
                    │  (/api/v1/health, etc.)    │
                    └───────┬─────────────┬──────┘
                            │             │
              ORM / SQL     ▼             ▼   Model Inference
         ┌─────────────────────┐   ┌──────────────────────┐
         │   SQLite Database   │   │ Machine Learning     │
         │ (Predictions Table) │   │ Pipeline (Scikit)    │
         └─────────────────────┘   └──────────────────────┘
```

### 2.1 Frontend Subsystem (`/frontend`)
- **Framework**: React 18 with Vite build tooling.
- **Styling**: Tailwind CSS configured with custom dark cybersecurity color schemes, glassmorphic panels, and glowing status accents.
- **Routing**: React Router v6 with pre-registered routes:
  - `/` - Foundation Landing Page with real-time API health monitor
  - `/dashboard` - Operations Security Dashboard (Phase 2)
  - `/analyze` - Traffic Log Upload & Flow Inspector (Phase 2)
  - `/results` - Prediction History & Audit Records (Phase 2)
  - `/analytics` - Threat Metrics & Telemetry (Phase 2)
  - `/model-performance` - ML Evaluation Metrics & ROC-AUC Curves (Phase 2)
- **Data Visualization**: Recharts library ready for metric visualization in Phase 2.

### 2.2 Backend Subsystem (`/backend`)
- **Web Framework**: FastAPI with asynchronous ASGI execution on Uvicorn.
- **API Versioning**: Standardized under base path `/api/v1`.
- **Cross-Origin Resource Sharing (CORS)**: Configured via Pydantic settings allowing standard Vite dev server ports (`localhost:5173`, `127.0.0.1:5173`).
- **Database Layer**: SQLAlchemy ORM with SQLite database engine (`netguard.db`), automatically created during application startup lifespan.
- **Service Layer**: Decoupled service architecture (`PredictionService`) separating route handlers from ORM database transactions.

### 2.3 Machine Learning Subsystem (`/ml`)
- **Data Lifecycle**:
  `Raw Dataset → Data Validation → Data Cleaning → Feature Processing → Train/Test Split → Model Training → Model Evaluation → Save Best Model → Prediction Engine`
- **Core Libraries**: Scikit-Learn, Pandas, NumPy, and Joblib serialization.
- **Modular Scripts**:
  - `preprocess.py`: Schema validation, categorical protocol encoding, numerical normalization.
  - `train_model.py`: Stratified dataset splitting and classifier fitting.
  - `evaluate_model.py`: Cybersecurity classification metrics (Precision, Recall, F1, ROC-AUC).
  - `predict.py`: Standalone single-record and batch inference engine.

---

## 3. Database Schema: `predictions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for the analysis session |
| `file_name` | String(255) | Not Null, Indexed | Name of uploaded traffic log file |
| `total_records` | Integer | Not Null, Default 0 | Total network flow entries evaluated |
| `normal_count` | Integer | Not Null, Default 0 | Count of benign traffic records |
| `intrusion_count` | Integer | Not Null, Default 0 | Count of malicious threat records |
| `created_at` | DateTime(UTC)| Not Null, Server Default | Timestamp of analysis session |

---

## 4. Phase-by-Phase Roadmap

### Phase 1: Architectural Foundation (Current)
- Monorepo structure establishment.
- FastAPI backend initialization with `/api/v1/health` and route placeholders.
- SQLAlchemy ORM engine and `Prediction` model creation.
- React frontend with Tailwind CSS and complete routing table.
- ML modular foundation and pipeline definitions.

### Phase 2: Core ML & Interactive Dashboard (Next)
- Training baseline model on benchmark datasets (e.g. NSL-KDD / CIC-IDS2017).
- Model artifact serialization (`netguard_model.joblib`).
- File upload handling (`/api/v1/analysis`) for CSV network logs.
- Interactive Dashboard UI with live stats and Recharts visualization.
