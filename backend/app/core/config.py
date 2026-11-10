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

    # CORS Configuration (supports local frontend + production origins via ALLOWED_ORIGINS or BACKEND_CORS_ORIGINS)
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    ALLOWED_ORIGINS: Union[str, List[str]] = []

    @field_validator("BACKEND_CORS_ORIGINS", "ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            raw = v.strip()
            if not raw:
                return []
            if raw.startswith("[") and raw.endswith("]"):
                import json
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(i).strip().rstrip("/") for i in parsed if str(i).strip()]
                except json.JSONDecodeError:
                    pass
            return [i.strip().rstrip("/") for i in raw.split(",") if i.strip()]
        if isinstance(v, list):
            return [str(i).strip().rstrip("/") for i in v if str(i).strip()]
        return []

    def get_cors_origins(self) -> List[str]:
        """Returns deduplicated list of allowed CORS origins without trailing slashes."""
        combined: List[str] = []
        for origin in list(self.BACKEND_CORS_ORIGINS) + list(self.ALLOWED_ORIGINS):
            cleaned = str(origin).strip().rstrip("/")
            if cleaned and cleaned not in combined:
                combined.append(cleaned)
        return combined


settings = Settings()
