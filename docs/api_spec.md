# NetGuard AI - API Specification (v1)

Base URL: `http://localhost:8000/api/v1`  
Interactive Swagger UI: `http://localhost:8000/docs` (also redirected from `/api/v1/docs`)

---

## 1. System Health

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

## 2. Real Network Traffic Analysis

### `POST /api/v1/analysis`
Uploads a network traffic capture CSV file for real AI intrusion classification.
- **Request**: `multipart/form-data` with form field `file` containing a `.csv` file.
- **Status Code**: `200 OK`
- **Response Structure**:
```json
{
  "session_id": 1,
  "file_name": "sample_network_traffic.csv",
  "total_records": 30,
  "normal_count": 16,
  "intrusion_count": 14,
  "intrusion_percentage": 46.67,
  "threat_status": "THREAT_DETECTED",
  "evaluated_sample_count": 30,
  "created_at": "2026-11-02T10:33:05.123456+00:00",
  "records": [
    {
      "id": 1,
      "protocol": "tcp",
      "service": "private",
      "flag": "rej",
      "src_bytes": 0,
      "dst_bytes": 0,
      "prediction": "POTENTIAL INTRUSION",
      "is_intrusion": true,
      "confidence": 100.0,
      "threat_score": 100.0,
      "severity": "CRITICAL"
    }
  ]
}
```

---

## 3. Historical Predictions Audit

### `GET /api/v1/predictions`
Queries historical prediction analysis sessions persisted to SQLite.
- **Query Params**:
  - `skip` (int, default 0): pagination offset
  - `limit` (int, default 100): maximum records to return
- **Status Code**: `200 OK`
- **Response**:
```json
[
  {
    "id": 1,
    "file_name": "sample_network_traffic.csv",
    "total_records": 30,
    "normal_count": 16,
    "intrusion_count": 14,
    "created_at": "2026-11-02T10:33:05.123456+00:00"
  }
]
```

### `GET /api/v1/predictions/{id}`
Retrieves a specific prediction session by integer ID.

---

## 4. Aggregated Telemetry Analytics

### `GET /api/v1/analytics`
Computes threat telemetry and classification aggregates dynamically from SQLite prediction history.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "total_sessions": 1,
  "total_records": 30,
  "normal_count": 16,
  "intrusion_count": 14,
  "intrusion_rate": 46.67,
  "threat_level": "ELEVATED",
  "sessions": [
    {
      "id": 1,
      "file_name": "sample_network_traffic.csv",
      "total": 30,
      "normal": 16,
      "intrusion": 14,
      "intrusion_rate": 46.7,
      "created_at": "2026-11-02T10:33:05.123456+00:00"
    }
  ]
}
```

---

## 5. Active ML Model Metadata & Evaluation

### `GET /api/v1/model`
Returns real test evaluation metrics, features, and model parameters for the deployed classifier.
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "trained": true,
  "status": "Active",
  "model_name": "Decision Tree",
  "algorithm": "Decision Tree",
  "framework": "scikit-learn",
  "dataset_name": "NSL-KDD",
  "training_records": 25192,
  "test_records": 22544,
  "evaluation_metrics": {
    "accuracy": 0.8226,
    "precision": 0.9704,
    "recall": 0.7100,
    "f1_score": 0.8201,
    "roc_auc": 0.7707,
    "confusion_matrix": {
      "tn": 9433,
      "fp": 278,
      "fn": 3721,
      "tp": 9112
    }
  }
}
```
