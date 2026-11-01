"""
NetGuard AI - Model Route (Placeholder)
Reserved for Phase 2: ML model metadata, versioning, feature schemas, and validation metrics.
"""

from typing import Dict
from fastapi import APIRouter, status

router = APIRouter()


@router.get(
    "",
    summary="Model Route Placeholder",
    description="Endpoint placeholder for machine learning model metadata and parameters.",
    status_code=status.HTTP_200_OK,
)
def get_model_info() -> Dict[str, str]:
    """
    Placeholder endpoint for machine learning model info.
    In Phase 2, this will expose model status, architecture version, and real cross-validation metrics.
    """
    return {
        "message": "Model route placeholder for NetGuard AI.",
        "phase": "Phase 1 Foundation",
        "description": "ML model metadata and performance metrics will be served in Phase 2 once trained."
    }
