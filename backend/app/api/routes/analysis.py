"""
NetGuard AI - Network Traffic Analysis Route (Placeholder)
Reserved for Phase 2: Network packet & flow capture analysis.
"""

from typing import Dict
from fastapi import APIRouter, status

router = APIRouter()


@router.get(
    "",
    summary="Analysis Route Placeholder",
    description="Endpoint placeholder for network traffic analysis functionality.",
    status_code=status.HTTP_200_OK,
)
def get_analysis_info() -> Dict[str, str]:
    """
    Placeholder endpoint for network traffic analysis.
    In Phase 2, this route will support single-flow inspection and batch CSV log analysis.
    """
    return {
        "message": "Analysis route placeholder for NetGuard AI.",
        "phase": "Phase 1 Foundation",
        "description": "Traffic analysis and flow parsing endpoints will be implemented in Phase 2."
    }
