"""
NetGuard AI - Network Traffic Analysis Route
Provides endpoints for analyzing network flow traffic logs using real ML inference.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import AnalysisResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get(
    "",
    summary="Analysis Endpoint Info",
    description="Returns specification and feature expectations for network traffic analysis.",
    status_code=status.HTTP_200_OK,
)
def get_analysis_info() -> Dict[str, Any]:
    """
    Returns information on the active analysis service and supported flow schemas.
    """
    return {
        "status": "ready",
        "service": "NetGuard AI Analysis Engine",
        "supported_format": "CSV (.csv)",
        "endpoint": "POST /api/v1/analysis",
        "description": "Upload network flow traffic CSV files for binary classification (NORMAL vs INTRUSION)."
    }


@router.post(
    "",
    summary="Analyze Network Traffic CSV",
    description="Upload a CSV log file containing network flow records for real AI-powered intrusion detection.",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_traffic(
    file: UploadFile = File(..., description="Network flow capture CSV file"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Analyzes an uploaded network traffic CSV file:
    - Validates file type and schema
    - Executes scikit-learn machine learning inference
    - Persists analysis run to SQLite database
    - Returns detailed detection telemetry and classified records
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing or invalid."
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format '{file.filename}'. Only CSV (.csv) flow captures are accepted."
        )

    try:
        content = file.file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded CSV file is empty. Please provide network traffic data."
            )

        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Uploaded file exceeds the maximum allowable limit of 50 MB."
            )

        service = PredictionService(db)
        results = service.analyze_csv_traffic(file_bytes=content, file_name=file.filename)
        return results

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=422,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while executing the traffic analysis pipeline."
        )
