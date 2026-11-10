"""
NetGuard AI - Predictions Route
Provides endpoints for retrieving and inspecting historical network intrusion prediction sessions.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get(
    "",
    summary="Get Prediction History",
    description="Retrieves a list of past network flow analysis sessions saved in SQLite.",
    response_model=List[PredictionResponse],
    status_code=status.HTTP_200_OK,
)
def get_predictions(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Limit records per page"),
    db: Session = Depends(get_db),
) -> List[Prediction]:
    """
    Returns real historical prediction sessions saved in the database.
    """
    service = PredictionService(db)
    return service.get_all(skip=skip, limit=limit)


@router.get(
    "/{prediction_id}",
    summary="Get Prediction By ID",
    description="Retrieves details for a specific analysis session.",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
)
def get_prediction_by_id(
    prediction_id: int,
    db: Session = Depends(get_db),
) -> Prediction:
    """
    Returns a single prediction record by ID.
    """
    service = PredictionService(db)
    record = service.get_by_id(prediction_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction session with ID {prediction_id} not found."
        )
    return record
