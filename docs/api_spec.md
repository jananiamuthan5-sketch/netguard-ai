# NetGuard AI - API Specification (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Health & System Status

### `GET /api/v1/health`
Checks backend operational status and service identification.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "healthy",
  "service": "NetGuard AI API"
}
```

---

## 2. Phase 2 Endpoint Placeholders

### `GET /api/v1/analysis`
Placeholder endpoint for network traffic flow analysis.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "message": "Analysis route placeholder for NetGuard AI.",
  "phase": "Phase 1 Foundation",
  "description": "Traffic analysis and flow parsing endpoints will be implemented in Phase 2."
}
```

### `GET /api/v1/predictions`
Placeholder endpoint for retrieving historic prediction logs from SQLite.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "message": "Predictions route placeholder for NetGuard AI.",
  "phase": "Phase 1 Foundation",
  "description": "Historical prediction queries and persistence will be fully active in Phase 2.",
  "total_history_records": 0,
  "data": []
}
```

### `GET /api/v1/analytics`
Placeholder endpoint for aggregated telemetry and threat distribution metrics.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "message": "Analytics route placeholder for NetGuard AI.",
  "phase": "Phase 1 Foundation",
  "description": "Aggregated intrusion metrics and flow telemetry will be computed in Phase 2."
}
```

### `GET /api/v1/model`
Placeholder endpoint for machine learning model metadata and training parameters.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "message": "Model route placeholder for NetGuard AI.",
  "phase": "Phase 1 Foundation",
  "description": "ML model metadata and performance metrics will be served in Phase 2 once trained."
}
```

---

## 3. Interactive Documentation
When the FastAPI backend is running, interactive Swagger UI and Redoc documentation are accessible at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- Redoc: `http://localhost:8000/api/v1/redoc`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`
