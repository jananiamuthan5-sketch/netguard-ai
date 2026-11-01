"""
NetGuard AI - Predictions Route (Placeholder & History)
Reserved for Phase 2: Storing, listing, and querying past network intrusion predictions.
"""

from typing import Dict, List, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionResponse

router = APIRouter()


@router.get(
    "",
    summary="Prediction History Placeholder",
    description="Endpoint placeholder for querying past network flow prediction sessions.",
    status_code=status.HTTP_200_OK,
)
def get_predictions(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Placeholder endpoint for prediction history.
    Queries the actual database table (returns empty list in Phase 1 - no fake data).
    """
    # Real query against database schema - returns 0 items since no fake data is generated
    records = db.query(Prediction).all()
    
    return {
        "message": "Predictions route placeholder for NetGuard AI.",
        "phase": "Phase 1 Foundation",
        "description": "Historical prediction queries and persistence will be fully active in Phase 2.",
        "total_history_records": len(records),
        "data": records
    }
