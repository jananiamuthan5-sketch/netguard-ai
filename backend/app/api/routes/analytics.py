"""
NetGuard AI - Analytics Route (Placeholder)
Reserved for Phase 2: Aggregate threat telemetry, intrusion trends, and flow metrics.
"""

from typing import Dict
from fastapi import APIRouter, status

router = APIRouter()


@router.get(
    "",
    summary="Analytics Route Placeholder",
    description="Endpoint placeholder for network traffic analytics and threat telemetry.",
    status_code=status.HTTP_200_OK,
)
def get_analytics_info() -> Dict[str, str]:
    """
    Placeholder endpoint for cybersecurity telemetry and aggregation.
    In Phase 2, this will calculate intrusion breakdown ratios from real analysis history.
    """
    return {
        "message": "Analytics route placeholder for NetGuard AI.",
        "phase": "Phase 1 Foundation",
        "description": "Aggregated intrusion metrics and flow telemetry will be computed in Phase 2."
    }
