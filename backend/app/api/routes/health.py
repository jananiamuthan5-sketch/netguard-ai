"""
NetGuard AI - Health Route
Provides operational status and service information.
"""

from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Returns the current operational health status and service identifier for NetGuard AI.",
)
def get_health() -> HealthResponse:
    """
    Health check endpoint for container probes and frontend connectivity verification.
    """
    return HealthResponse(
        status="healthy",
        service="NetGuard AI API"
    )
