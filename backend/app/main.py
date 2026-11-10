"""
NetGuard AI - FastAPI Application Entrypoint
AI-Powered Network Intrusion Detection System Backend
"""

from contextlib import asynccontextmanager
import os
import sys

# Ensure backend/ directory is on sys.path even when invoked from repository root
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.api.api import api_router
from app.core.config import settings
from app.database.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database tables on startup.
    """
    init_db()
    yield


# FastAPI Application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "REST API for **NetGuard AI** — AI-Powered Network Intrusion Detection System. "
        "Provides CSV network flow analysis using a trained NSL-KDD classification pipeline, "
        "prediction history stored in SQLite, aggregated threat analytics, and model evaluation metadata."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware Configuration
cors_origins = settings.get_cors_origins()
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/", tags=["Root"])
def root_info():
    """
    Root endpoint displaying basic service metadata and navigation links.
    """
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": f"{settings.API_V1_STR}/health",
    }


@app.get(f"{settings.API_V1_STR}/docs", include_in_schema=False)
def redirect_v1_docs():
    """Redirect legacy /api/v1/docs path to unified /docs Swagger UI."""
    return RedirectResponse(url="/docs")


# Mount API v1 router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
