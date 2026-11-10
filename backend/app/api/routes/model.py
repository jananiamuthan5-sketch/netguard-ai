"""
NetGuard AI - Model Metadata Route
Provides verified performance metrics, parameters, and metadata for the active ML model.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import ModelInfoResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get(
    "",
    summary="Get Model Performance Metadata",
    description="Returns real evaluation metrics, feature schemas, and algorithm specifications for the active model.",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
)
def get_model_info(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns verified model metrics generated during real training on the benchmark dataset.
    """
    service = PredictionService(db)
    return service.get_model_metadata()
