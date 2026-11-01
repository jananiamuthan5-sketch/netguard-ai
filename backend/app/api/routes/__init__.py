from app.api.routes.health import router as health_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.model import router as model_router

__all__ = [
    "health_router",
    "analysis_router",
    "predictions_router",
    "analytics_router",
    "model_router",
]
