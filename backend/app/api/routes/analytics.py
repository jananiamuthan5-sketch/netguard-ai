"""
NetGuard AI - Analytics Route
Computes aggregate threat telemetry and network traffic metrics from real database history.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import AnalyticsResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get(
    "",
    summary="Get Threat Telemetry Analytics",
    description="Returns aggregated traffic counts, threat rates, and trend data derived from real prediction sessions.",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_200_OK,
)
def get_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Computes aggregated intrusion detection statistics from SQLite database records.
    """
    service = PredictionService(db)
    return service.get_analytics_summary()
