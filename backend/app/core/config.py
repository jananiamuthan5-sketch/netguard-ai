"""
NetGuard AI - Application Configuration
Handles application settings, environment variables, and constants.
"""

import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_BACKEND_ENV = os.path.join(_BACKEND_DIR, ".env")


class Settings(BaseSettings):
    """
    Application runtime configuration loaded from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=(".env", _BACKEND_ENV),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Project Information
    PROJECT_NAME: str = "NetGuard AI API"
    VERSION: str = "v1"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database Configuration (SQLite default pointing reliably to backend/netguard.db)
    DATABASE_URL: str = f"sqlite:///{os.path.join(_BACKEND_DIR, 'netguard.db')}"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
