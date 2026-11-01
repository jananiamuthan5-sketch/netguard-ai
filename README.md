# NetGuard AI
### AI-Powered Network Intrusion Detection System (NIDS)

NetGuard AI is a machine learning-powered cybersecurity platform designed to analyze network flow traffic and classify records into:
1. **NORMAL / BENIGN TRAFFIC**
2. **POTENTIAL INTRUSION / MALICIOUS TRAFFIC**

---

## 🚀 Current Development Status: Phase 1 Foundation

> **Notice**: NetGuard AI is currently in **Phase 1 (Architectural Foundation)**.
> In accordance with Phase 1 design principles:
> - No fake ML models or artificial accuracy figures are mocked.
> - No hardcoded or fake statistics are presented as production data.
> - No unnecessary authentication layers or microservice bloat.
> - The complete operational dashboard, real dataset training, and file upload parsing are scheduled for **Phase 2**.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Cybersecurity dark theme)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Visualization**: [Recharts](https://recharts.org/) (Configured for Phase 2 telemetry)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Database**: SQLite (Configured for prediction history)
- **Configuration & Validation**: [Pydantic v2](https://docs.pydantic.dev/) & Pydantic Settings

### Machine Learning Subsystem
- **Core Libraries**: Scikit-Learn, Pandas, NumPy, Joblib
- **Architecture**: Modular preprocessing, training, evaluation, and inference engines

---

## 🏛️ Project Architecture

```
netguard-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, Footer, RoutePlaceholder)
│   │   ├── pages/            # Application pages (LandingPage, Dashboard, Analyze, etc.)
│   │   ├── services/         # API clients (api.js with health check and future hooks)
│   │   ├── hooks/            # Custom hooks (useApiHealth.js)
│   │   ├── utils/            # Constants, route mappings, formatters
│   │   ├── App.jsx           # Main routing configuration
│   │   ├── main.jsx          # DOM entrypoint
│   │   └── index.css         # Tailwind & cyber theme styles
│   ├── public/               # Static assets & robots.txt
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite dev server configuration
│   └── tailwind.config.js    # Tailwind styling tokens
│
├── backend/
│   ├── app/
│   │   ├── api/              # API router aggregation & endpoints
│   │   │   └── routes/       # health.py, analysis.py, predictions.py, analytics.py, model.py
│   │   ├── core/             # Application settings & environment configs (config.py)
│   │   ├── database/         # SQLAlchemy engine, session maker, get_db (session.py)
│   │   ├── models/           # SQLAlchemy ORM models (prediction.py)
│   │   ├── schemas/          # Pydantic schemas (health.py, prediction.py)
│   │   ├── services/         # Business logic layer (prediction_service.py)
│   │   └── main.py           # FastAPI application startup & CORS
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
│
├── ml/
│   ├── data/
│   │   ├── raw/              # Raw network datasets (NSL-KDD, CIC-IDS) - untracked
│   │   └── processed/        # Preprocessed, engineered feature arrays
│   ├── models/               # Saved model artifacts (.joblib)
│   ├── notebooks/            # Jupyter EDA and prototyping notebooks
│   ├── src/
│   │   ├── preprocess.py     # Data validation, cleaning, and encoding pipeline
│   │   ├── train_model.py    # Stratified split, training, and model saving
│   │   ├── evaluate_model.py # Cybersecurity metrics (Precision, Recall, ROC-AUC)
│   │   └── predict.py        # Single-flow and batch prediction engine
│   └── README.md             # ML pipeline documentation
│
├── docs/                     # Architectural blueprints & specifications
│   ├── architecture.md
│   ├── api_spec.md
│   └── ml_pipeline.md
│
├── .gitignore                # Environment, venv, and binary exclusions
└── README.md                 # Project documentation (this file)
```

---

## ⚡ Setup & Execution Guide

The frontend and backend run independently and communicate over REST APIs.

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: v18+ (Tested on Node v24)
- **npm**: v9+

---

### 1. Backend Setup & Run

1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. Verify the backend:
   - Health check: `http://127.0.0.1:8000/api/v1/health`
   - Interactive Swagger API docs: `http://127.0.0.1:8000/api/v1/docs`

Expected response from `/api/v1/health`:
```json
{
  "status": "healthy",
  "service": "NetGuard AI API"
}
```

---

### 2. Frontend Setup & Run

1. Open a second terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

The landing page will display:
- **NETGUARD AI**
- **AI-Powered Network Intrusion Detection System**
- *“Project foundation is being prepared. AI-powered network traffic analysis will be available in upcoming phases.”*
- Real-time connection status pill connecting to the FastAPI `/api/v1/health` endpoint.
- Navigation links to all future application views.

---

## 🗄️ Database Foundation

SQLite is pre-configured via SQLAlchemy. The database file (`netguard.db`) is automatically initialized upon FastAPI startup, creating the `predictions` table structure:
- `id` (Integer, Primary Key)
- `file_name` (String, Indexed)
- `total_records` (Integer)
- `normal_count` (Integer)
- `intrusion_count` (Integer)
- `created_at` (DateTime)

In Phase 1, no mock data is inserted into the database.

---

## 🧠 Machine Learning Pipeline Overview

The ML subsystem follows a standard cybersecurity workflow:
```
Raw Dataset
  → Data Validation
  → Data Cleaning
  → Feature Processing
  → Train/Test Split
  → Model Training
  → Model Evaluation
  → Save Best Model
  → Prediction Engine
```

For more details, see [`ml/README.md`](ml/README.md).

---

## 🗺️ Roadmap & Planned Features

- **Phase 1 (Complete)**: Full-stack architectural foundation, FastAPI `/api/v1/health`, SQLite schema, React + Vite + Tailwind setup, routing table, ML modular skeleton.
- **Phase 2**:
  - Model training on NSL-KDD / CIC-IDS benchmark datasets.
  - Model persistence via Joblib.
  - Network traffic CSV log file upload and single-flow analysis endpoint (`/api/v1/analysis`).
  - Interactive Cybersecurity Dashboard with real-time stats and Recharts visualization.
  - Prediction history log inspection table (`/api/v1/predictions`).
- **Phase 3**:
  - Advanced threat telemetry, multi-attack classification, and model explanation (SHAP/LIME).
