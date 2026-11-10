"""
NetGuard AI - API Router Aggregation
Mounts all sub-routers onto the unified API v1 router.
"""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.model import router as model_router

api_router = APIRouter()

# Core Health Check Route: /api/v1/health
api_router.include_router(health_router, tags=["Health"])

# Core Intrusion Detection, History, Telemetry & Model Metadata Routes
api_router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(model_router, prefix="/model", tags=["Model"])
