"""
NetGuard AI - Health Check Schema
Defines serialization format for system health status.
"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Schema for system health status endpoint response.
    Matches required specification:
    {
      "status": "healthy",
      "service": "NetGuard AI API"
    }
    """
    status: str = Field(default="healthy", description="Current health status of the API service")
    service: str = Field(default="NetGuard AI API", description="Name of the service")
